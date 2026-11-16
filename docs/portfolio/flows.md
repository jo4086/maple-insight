# 핵심 사용자·데이터 흐름

## 1. 닉네임 검색: 현재 코드 경로

```text
닉네임 입력 → URL /character?nick=... → React Query
→ GET /api/character/search → OCID 확인 → Nexon character/basic
→ 직업에 맞는 skill 차수 요청 + 나머지 endpoint 묶음 호출
→ mapper/공유 계약 → 응답 → 이미지·장비 중심 화면
```

프론트엔드는 [검색 Hook](../../apps/frontend/src/features/character/hooks/useSearchNick.ts)에서 검색어를 query key로 관리한다. [API 함수](../../apps/frontend/src/features/character/api.ts)가 back에 요청한다. [컨트롤러](../../apps/back/src/domain/character/character.controller.ts)는 검색 기록, 닉네임의 OCID 확인, `basic`의 직업 확인, skill 요청 확장, mapper 적용을 순서대로 수행한다. [서비스](../../apps/back/src/domain/character/services/character.service.ts)는 요청을 제한된 동시성으로 처리한다. [화면](../../apps/frontend/src/pages/CharacterPage/CharacterMainPage/index.tsx)은 현재 이미지·장비와 선택 장비 상세 중심이고 일부 열은 숫자 placeholder다.

**확인할 계약 위험:** back은 차수별 skill 결과를 배열로 묶는데 frontend의 `SearchNickResponse.skill`은 단수 `CharacterSkill`로 선언돼 있다. 전체 데이터 표시와 실제 검색 end-to-end 검증을 완료했다고 쓰지 않는다. [frontend 타입](../../apps/frontend/src/features/character/types.ts), [루트 목표](../../GOAL.md).

## 2. 랭킹 기반 수집: 현재 잡 경로

```text
기본 실행 → ranking/overall 페이지 수집 → raw page + run 상태 DB 저장
별도 잡 → raw page 이름의 OCID 수집 → 캐릭터·유니온 snapshot
별도 잡 → accountKey 후보 묶기 → active 그룹 갱신/새 버전
```

[기본 진입점](../../apps/ingestor/src/index.ts)은 랭킹 수집만 실행한다. [랭킹 서비스](../../apps/ingestor/src/services/ranking-ingestor.ts)는 완료된 실행을 기준으로 다음 페이지 창을 정하고 페이지별 raw 응답과 실행 상태를 저장한다. [별도 잡](../../apps/ingestor/package.json)의 `dev:ocids`, `dev:groups`, `dev:sync`가 후속 단계를 호출한다. [그룹 빌더](../../apps/ingestor/src/services/character-group-builder.ts)는 후보를 account key로 묶고, 기존 active 분석 그룹을 갱신하거나 superseded 버전을 만든다.

그룹 규칙에서 OCID는 조회 식별자이고 닉네임은 시점별 값이다. 이름 재사용·그룹 구조 변화에 대비한 문서와 구현이 있지만, 전체 수집 파이프라인의 주기·재시도·품질 기준, 실제 이력 제공은 미검증이다. [그룹 규칙](../../apps/ingestor/docs/grouping-rules.md), [루트 로드맵](../../ROADMAP.md).

## 3. 버전별 게임 데이터 관리: 검증된 단계와 다음 단계

```mermaid
flowchart LR
  Raw[원본 파일] --> Import[가져오기·변환]
  Import --> Validation[검증 작업본]
  Validation --> Diff[버전별 raw diff]
  Diff --> Edit[편집 작업본 / 진행 중]
  Edit -. 계획 .-> DryRun[DB dry-run]
  DryRun -. 계획 .-> Publish[명시 승인 publish]
  Publish -. 계획 .-> Generate[타입·정적 데이터 생성]
```

Electron의 Phase 00~03은 앱 검증 기록상 완료다. Phase 04에서는 edit workbench와 직업 metadata 7개 필드의 저장·재열기, 복구 미리보기·선택 복사가 부분 구현됐다. 실제 DB와 ready validation fixture를 사용하는 native 전체 흐름, 외부 writer 경합은 남아 있다. Phase 05·06은 대기다. [단계 상태](../../apps/electron/docs/GOAL/README.md), [Phase 04 목표](../../apps/electron/docs/GOAL/Phase04.md).

현재 화면의 Renderer는 [Preload API](../../apps/electron/src/preload/index.ts)를 통해 [Main IPC](../../apps/electron/src/main/ipc/register.ts)에 요청한다. Main의 import·validation·diff·workbench 서비스가 파일·DB 경계를 처리한다. `@maple/data-admin`에 별도 seed/bundle 스크립트는 있지만, 이것을 Electron의 승인 publish 구현으로 설명하면 안 된다. [data-admin 설명](../../packages/database/data-admin/README.md).

## 4. 후속 소비 흐름

성공 publish된 ready 버전을 기반으로 생성 결과를 검토하고, 그 데이터를 계산·시뮬레이션 및 데이터 의존 화면에 연결한다는 것이 현재 계획이다. `@maple/simulator`에는 스탯·심볼 계산이 존재하지만, 보스 시뮬레이션과 통합 사용자 경험은 구현 완료가 아니다. [루트 로드맵](../../ROADMAP.md), [시뮬레이터 코드](../../packages/simulator/src/index.ts).
