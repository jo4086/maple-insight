# 프로젝트 로드맵

상태는 코드 존재가 아니라 종료 검증으로 판단한다. 앱별 상세 요구사항과 검증 기록은 각 앱 문서를 우선한다.

## 순서와 의존성

```text
Electron Phase 2 validation·작업본 완료
  -> Phase 3 버전 diff 완료
  -> Phase 4 작업본 편집 진행 중
     -> Main process 구조 재정리 (다음 작업 최우선)
     -> 남은 Phase 4 기능
  -> Phase 5 DB dry-run·명시 승인 publish
  -> Phase 6 타입·정적 데이터 생성
  -> 신뢰된 게임 데이터 소비 기능

캐릭터 API 계약 확정
  ├─ frontend 실제 데이터 표시
  └─ back 정규화·캐시 보강

수집 파이프라인 실행·품질 검증
  -> 캐릭터 이력 제공

신뢰된 게임 데이터 + 계산 규칙
  -> 아이템·스탯 시뮬레이션
  -> 보스 시뮬레이션
```

Electron Phase 02와 Phase 03은 앱 소유 목표와 검증 기록에 따라 완료됐다. 현재 마일스톤은 [Phase 04 편집 작업본](apps/electron/docs/GOAL/Phase04.md)이며 앱 소유 [단계 상태](apps/electron/docs/GOAL/README.md)에서는 진행 중 (작업본·직업 복구 선택 복사 부분 구현)이다. 다음 작업 지시에서는 남은 Phase 04 기능보다 [Main process 구조 재정리](apps/electron/docs/REQUESTS/main-process-architecture.md)를 먼저 구현·검증한다. Phase 04 완료는 아직 선언하지 않으며 Phase 05·06은 후속 순차 의존성을 유지한다. 성공 publish로 ready가 된 버전만 생성과 신뢰된 게임 데이터 소비 기능의 입력이 된다. 캐릭터 계약과 frontend API UI는 Electron과 독립적으로 병행할 수 있고, 실제 API 표시는 Electron publish에 막히지 않는다. 다만 버전 게임 데이터에 의존하는 기능은 publish 뒤에 진행한다. 수집 이력은 파이프라인 스케줄과 품질 검증 뒤다. 시뮬레이션은 신뢰된 데이터 뒤다.

## 마일스톤

### M1. Electron Phase 2 검증과 Phase 3 버전 비교

**완료.** Phase 02 검증 및 작업본 기반과 Phase 03 버전 비교는 앱 소유 문서의 종료 검증을 마쳤다.

- Phase 02: [목표](apps/electron/docs/GOAL/Phase02.md) · [최종 검증](apps/electron/docs/REVIEW/Phase02.md#7-el-g002-완료-검증-2026-10-15)
- Phase 03: [목표](apps/electron/docs/GOAL/Phase03.md) · [검증 기록](apps/electron/docs/REVIEW/Phase03.md)
- Phase 03의 `failed` 제외와 test 환경 표시는 코드·자동 테스트 범위지만 현재 DB 행 부재로 native 화면 검증이 남았다. 기존 완료 판정은 유지한다.

종료 확인:

- [x] Phase 02 validation 작업본과 publish 가능 상태를 검증했다.
- [x] Phase 02 node/web typecheck, 테스트, lint, production build와 native 흐름을 검증했다.
- [x] Phase 03 diff의 추가·수정·삭제, 저장·재열기와 native 흐름을 검증했다.

### M2. Electron Phase 4 편집과 후속 반영·생성

현재 마일스톤은 [Phase 04 편집 작업본](apps/electron/docs/GOAL/Phase04.md)이며 진행 중 (작업본·직업 복구 선택 복사 부분 구현)이다. edit workbench supersession은 집중 테스트 36개로 검증했고 직업 복구 미리보기·명시적 단일 직업 metadata 복사 IPC/UI도 부분 검증했다. native Electron IPC·실제 DB는 미검증이고 기존 에디터의 새 workbench 읽기·쓰기 전환은 미구현이므로 Phase 04 완료를 선언하지 않는다. 다음 작업은 [Main process 구조 재정리](apps/electron/docs/REQUESTS/main-process-architecture.md)를 문서 기준선 → 서비스 이동 → IPC 추출 → app/window/runtime 분리 순서로 수행하고 각 단계를 독립 검증한다. 이후 남은 Phase 04 기능을 재개한다. Phase 05 dry-run·명시 승인 publish와 Phase 06 생성은 Phase 04 완료 뒤 진행한다.

- Main process 구조 재정리에서 preload·shared·renderer 계약과 기존 기능 동작을 유지한다.
- 구조 재정리 뒤 기존 에디터의 읽기·쓰기를 새 workbench로 전환하고 native Electron IPC·실제 DB 흐름을 검증한다.
- `newWeaponTypes`·전직 연결 등 복구 초안의 도메인별 필드를 설계·승인된 mapping으로 보강하고 Phase 4a~4c를 완료한다.
- Phase 05 dry-run·명시 승인 publish와 Phase 06 생성기를 순서대로 완료한다.
- publish 성공으로 ready가 된 버전만 생성과 버전 게임 데이터 의존 기능의 입력으로 사용한다.

종료 확인:

- [ ] 작업본 편집은 검증된 작업본에서만 수행하고 변경 이력을 diff에 반영한다.
- [ ] dry-run은 DB를 변경하지 않고, 승인 없는 publish는 실행되지 않으며, publish 실패는 부분 DB 반영을 남기지 않는다.
- [ ] ready 버전에서 생성한 결과를 검토할 수 있다.

### M3. 캐릭터 API 계약과 공개 표시

Electron과 병행한다. 실제 API 표시 작업은 Electron publish의 선행 조건이 아니다.

- Back의 `/api/character/search` 응답, 특히 skill 배열을 계약으로 확정한다.
- frontend 타입·mapper·화면을 계약에 맞춘다.
- 기존 이미지·장비 표시를 확인하고 stat·ability·skill·symbol 등 실제 응답 필드를 화면에 단계적으로 연결한다. placeholder 열은 실제 값으로 교체하거나 미지원으로 명확히 구분한다.
- Redis, Nexon API key 사용 경계와 실패 응답을 확인한다.

종료 확인:

- [ ] 대표 캐릭터 검색에서 이미지·장비뿐 아니라 선택한 stat·ability·skill·symbol 데이터가 실제 API 응답과 일치해 frontend에 표시된다.
- [ ] frontend와 back의 skill 형태가 일치한다.
- [ ] 캐시와 외부 API 실패가 구조화된 오류로 보인다.

### M4. 수집과 이력 신뢰성

- 랭킹 수집 뒤 OCID, 캐릭터, 유니온 스냅샷과 계정 그룹화를 실행하는 파이프라인을 검증한다.
- 실행 주기, 재시도, 중복 처리, 품질 기준을 정한다.

종료 확인:

- [ ] 기본 실행이 랭킹 전용임을 넘는 전체 파이프라인을 실제 환경에서 검증한다.
- [ ] OCID 기준 이력과 그룹화가 닉네임 재사용을 잘못 연결하지 않는다.

### M5. 시뮬레이션

- 기존 스탯·심볼 계산기를 성공 publish된 버전 데이터와 연결해 재현성을 검증한다.
- 아이템·스탯 비교 뒤 보스 계산을 새로 설계·구현한다.

종료 확인:

- [ ] 입력 버전과 규칙이 결과에 기록된다.
- [ ] 보스 시뮬레이션은 구현과 테스트가 끝나기 전 제공 기능으로 표시하지 않는다.

## 앱 문서

- Frontend: `apps/frontend/docs/react-query-guide.md`
- Back: `apps/back/docs/api-normalization-roadmap.md`, `apps/back/roadmap.md`
- Ingestor: `apps/ingestor/docs/db-structure.md`, `apps/ingestor/docs/grouping-rules.md`
- Electron: [SPEC](apps/electron/docs/SPEC/README.md), [ROADMAP](apps/electron/docs/ROADMAP.md), [GOAL](apps/electron/docs/GOAL/README.md), [Phase 04](apps/electron/docs/GOAL/Phase04.md), [REVIEW](apps/electron/docs/REVIEW.md)
