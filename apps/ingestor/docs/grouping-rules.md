# Character Grouping Rules

## 목적

- `union-ranking`과 `basic` 수집 결과를 이용해서 같은 계정에 속한 캐릭터를 그룹으로 묶는다.
- 닉네임 변경, 대표캐릭터 변경, 닉네임 재사용까지 장기적으로 추적할 수 있는 구조를 유지한다.

## 핵심 원칙

- 현재 조회의 외부 식별자는 `ocid`다.
- `character_name`은 현재 시점의 이름일 뿐이며, 장기 식별자로 쓰지 않는다.
- 그룹 판정은 단일 숫자 값보다 `union-ranking`의 대표캐릭터와 멤버 구조를 우선 사용한다.
- 현재값 테이블과 히스토리 테이블을 분리한다.

## 현재값 테이블

- `characters`
  - 현재 기준 캐릭터 메타
- `character_basics`
  - 현재 기준 `/character/basic`
- `character_union_rankings`
  - 현재 기준 `/ranking/union`
- `character_account_groups`
  - 현재 활성 그룹 메타
- `character_account_group_members`
  - 현재 그룹 멤버 목록

## 히스토리 테이블

- `character_basic_histories`
  - `basic` 응답의 append-only 시계열
  - 이름 변경, 월드 변경, 직업 변경, 레벨 흐름 추적
- `character_union_ranking_histories`
  - `union-ranking` 응답의 append-only 시계열
  - 대표캐릭터 변경, 멤버 구조 변경, 그룹 signature 변화 추적

## 그룹 생성 규칙

1. `union-ranking` 저장 시 `accountKey = worldName:unionLevel:unionPower`를 만든다.
2. 같은 `accountKey`를 가진 캐릭터들을 같은 계정 후보로 본다.
3. `union-ranking.character_name`은 대표캐릭터명으로 저장한다.
4. 조회한 캐릭터명이 대표캐릭터명과 같으면 `main`, 아니면 `sub`로 저장한다.
5. 그룹 생성 시 아래 메타를 함께 저장한다.
   - `primaryCharacterName`
   - `representativeCharacterOcid`
   - `memberCount`
   - `memberNamesSnapshot`
   - `unionRankingDate`
   - `status`
   - `previousGroupId`

## 그룹 버전 규칙

1. 수동으로 확정한 그룹은 `source=manual`로 두고 자동 분석이 덮어쓰지 않는다.
2. 자동 생성 그룹은 `source=analysis`로 둔다.
3. 그룹은 삭제하지 않고 버전으로 관리한다.
4. 새 버전이 생기면 이전 그룹은 `status='superseded'`로 전환한다.
5. 새 버전은 `previousGroupId`로 이전 그룹을 가리킨다.

## 그룹 유지 규칙

1. 대표캐릭터가 같고 기존 멤버가 그대로 유지되며 새 부캐만 추가된 경우:
   - 기존 그룹 row 유지
   - `lastValidatedAt` 갱신
   - 새 멤버 row만 추가
2. 아래 경우는 새 그룹 버전을 생성한다.
   - 메인캐릭터 변경
   - 메인캐릭터 닉네임 변경
   - 부캐 닉네임 변경
   - 부캐 삭제
   - 기존 멤버 집합의 구조적 변화
3. 자동 그룹 재계산 시 기존 `analysis active` 그룹과 비교해서 위 조건에 따라 유지 또는 버전 생성으로 나눈다.

## 닉네임 변경 추적 규칙

1. 이름은 재사용될 수 있으므로 이름만으로 같은 캐릭터라고 판단하지 않는다.
2. 아래 정보가 함께 이어질 때 같은 캐릭터 연속성 후보로 본다.
   - `basic history`
   - `union-ranking history`
   - 그룹 멤버 구조
3. 대표캐릭터 닉네임이 바뀐 경우에도 멤버 구조가 이어지면 기존 그룹을 우선 유지한다.

## 대표캐릭터 ocid 연결 규칙

1. `union-ranking` 저장 시 대표캐릭터명이 현재 조회 캐릭터명과 같으면 그 row의 `ocid`를 바로 `representativeCharacterOcid`로 저장한다.
2. 대표캐릭터명이 다른 경우에는 이미 저장된 `character_union_rankings`에서 대표캐릭터 후보를 찾는다.
3. 아래 조건이면 같은 대표캐릭터로 즉시 연결한다.
   - 최근 1일 이내 수집 데이터
   - `worldName` 동일
   - `className` 동일
4. 최근 데이터가 없으면 유사도 판정을 사용한다.
   - `worldName` 동일
   - `className` 동일
   - `ranking`, `unionLevel`, `unionPower` 수치 유사도 98% 이상
5. 위 조건을 통과하면 해당 후보의 `ocid`를 `representativeCharacterOcid`로 저장한다.
6. 어떤 후보도 확정되지 않으면 `representativeCharacterOcid`는 `null`로 둔다.

## 닉네임 재사용 방어 규칙

예시:

- A가 `태풍 -> 부처`로 변경
- B가 `몬스터 -> 태풍`으로 변경

이 경우:

- `태풍`은 시점마다 다른 캐릭터를 가리킬 수 있다.
- 이름 문자열은 신뢰하지 않는다.
- 과거 `basic history`와 `union-ranking history`를 함께 보고 기존 그룹 연속성 여부를 확인한다.

## 일일 검증 규칙

1. 새 `union-ranking` 수집 후 그룹을 재계산한다.
2. 대표캐릭터 변경 여부를 본다.
3. 멤버 snapshot이 기존 active 그룹의 멤버 snapshot과 어떤 관계인지 비교한다.
4. 대표캐릭터 동일 + 기존 멤버 subset + 새 멤버 추가만 있으면 기존 그룹 유지다.
5. 대표캐릭터 변경, 멤버 삭제, 멤버 닉변 같은 구조 변화가 있으면 새 그룹 버전을 만든다.
6. 애매한 경우 해당 그룹 멤버들의 최신 `basic`과 `union-ranking`을 다시 비교한다.

## 향후 추가 권장사항

- 그룹 이벤트 테이블
  - `created`
  - `representative_changed`
  - `member_snapshot_changed`
  - `superseded`
- 내부 canonical character id
  - `ocid` 변경 전후를 같은 실체로 연결할 수 있는 내부 식별자
