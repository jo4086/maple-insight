# 프로젝트 명세

## 목적과 범위

Maple Insight는 사용자가 메이플스토리 닉네임으로 캐릭터 정보와 이력을 조회하는 제품이다. 가까운 최우선 과제는 Electron에서 버전별 게임 데이터를 검증하고 diff, 작업본 편집, DB dry-run·publish, 생성을 거쳐 신뢰 가능한 데이터로 만드는 일이다. frontend의 Nexon Open API 실제 데이터 표시는 이 경로와 독립적으로 병행한다. 신뢰된 버전 데이터와 계산을 바탕으로 이후 아이템·스탯·보스 시뮬레이션으로 확장한다.

범위는 운영 앱 네 개와 공통 패키지다.

- `apps/frontend`: 검색과 캐릭터 정보 표시. 관리 기능은 장기적으로 사용자 관리로 한정한다.
- `apps/back`: 검색 API, Nexon API 호출, 캐시, 정규화된 응답 계약을 제공한다.
- `apps/ingestor`: 랭킹 수집, OCID·캐릭터·유니온 스냅샷, 계정 그룹 DB 적재를 담당한다.
- `apps/electron`: 로컬 게임 데이터 관리자다. 웹 관리자 범위를 대체한다.
- `packages`: 계약, 게임 데이터, DB, 생성기, 계산기·시뮬레이터, bootstrap을 공유한다.

`apps/erd`, `apps/legacy`는 이 계획 범위가 아니다. 루트 `README.md`는 과거 중단 상태를 담은 스냅샷이며 수정하지 않는다. 이 문서부터 계획을 다시 진행한다.

## 문서와 작업 규칙

루트 `SPEC.md`는 전체 목표, `ROADMAP.md`는 앱 간 개발 순서, `GOAL.md`는 현재 공통 작업을 다룬다. 앱별 상세 계획과 완료 판정은 해당 앱 문서가 담당한다. 작업 범위에 맞는 브랜치에서 기존 미커밋 변경을 보존하고, 커밋 시 `docs/Git-Commit-Convention.md`와 최근 기록의 `type(scope): 변경 내용` 형식을 따른다.

## 소유권과 경계

| 영역 | 소유 책임 | 경계 |
| --- | --- | --- |
| Frontend | 검색 흐름과 실제 캐릭터 데이터 표현 | Nexon API와 DB에 직접 접근하지 않는다. |
| Back | 외부 API 호출, 캐시, 정규화, 검색 응답 | 프론트엔드가 소비할 계약을 명시하고 유지한다. |
| Ingestor | 주기 수집과 이력·그룹 적재 | 수집 기본 진입점은 현재 랭킹 전용이다. 전체 파이프라인 스케줄은 검증 전이다. |
| Electron | 버전별 게임 데이터 import, validate, compare, edit, publish, generate | main/preload/renderer 경계를 유지한다. 프론트엔드의 폭넓은 관리 기능을 받는다. |
| Packages | 앱 간 계약, 게임 규칙, DB, 생성과 계산 | 소유권을 Electron으로 옮기지 않는다. 이전은 영향 검토 뒤에만 결정한다. |

Electron은 나중에 변경 가능한 프론트엔드 아이템 UI 정보도 관리할 수 있다. 이는 데이터 관리 흐름이 검증된 뒤의 범위다. 기존 프론트엔드 import UI는 mock이며, 사용자 관리가 구현되었다고 보지 않는다.

## 현재 상태

### 검증됨

- Electron Phase 0과 Phase 1은 검증 기록이 있다.
- DB seed와 생성기 기반이 있다.
- 스탯·심볼 계산기는 존재한다.
- Back의 `/api/character/search` mapper는 연결되어 있다.

### 부분 구현 또는 위험

- Electron Phase 2 validation과 작업본은 진행 중이다. 작업 트리에 미커밋 변경이 있어 구현된 항목도 독립 검증 전에는 완료 근거가 아니며, Phase 2는 아직 미검증이다.
- 프론트엔드는 실제 이미지·장비 표시가 부분적이며, 나머지 열은 placeholder다.
- 로그인과 프론트엔드 admin import UI는 기능 연결이 없다.
- Back session API key는 Nexon 호출에 사용되지 않는다. Redis가 필요하다.
- frontend의 단수 skill 타입과 back의 배열 응답 사이에 계약 불일치 위험이 있다.
- ingestor는 랭킹에서 시작해 후속 OCID·캐릭터·유니온과 그룹화로 이어질 설계가 있으나 전체 기본 실행과 스케줄은 검증되지 않았다.

### 미래 범위

- 신뢰 가능한 캐릭터 이력과 수집 품질.
- Electron의 diff, 편집, dry-run, publish, 생성, 운영 안정화.
- 아이템·스탯 시뮬레이션과 아직 구현되지 않은 보스 시뮬레이션.

## 수용 기준

1. Electron은 불변 원본과 변환 결과에서 분리한 작업본을 검증하고, diff와 편집을 거친 뒤 dry-run·명시적 승인·트랜잭션 publish로 DB에 반영한다.
2. 성공해 ready가 된 버전만 타입과 정적 데이터 생성의 입력이 된다. dry-run은 DB를 변경하지 않으며 실패한 publish는 부분 반영을 남기지 않는다.
3. 신뢰된 버전 게임 데이터가 필요한 계산·시뮬레이션과 데이터 소비 기능은 publish 뒤에만 제공한다.
4. 검색한 닉네임의 실제 API 정보는 안정된 공유 계약으로 frontend에 표시되며, 이 표시 작업은 Electron 완료를 선행 조건으로 하지 않는다.
5. 계약 변경은 back·frontend·공통 계약 영향을 함께 검증한다.
6. 수집 이력은 실행 주기, 실패 처리, 데이터 품질 기준이 확인된 뒤에 사용자 기능에 사용한다.

## 열린 결정

- character 응답의 skill 표현을 배열 기준으로 확정하고 frontend 타입을 어떻게 이행할지 결정한다.
- Nexon API key의 서버 측 사용 방식과 session 보관 정책을 확정한다.
- ingestor 전체 파이프라인의 실행 주기, 재시도, 품질 기준을 정하고 운영 검증한다.
- Electron publish 완료 뒤에도 package 소유권을 유지할지, 영향 검토 뒤 일부를 이전할지 결정한다.
