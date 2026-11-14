# 직업 데이터 탭 작업본 요청

- 상태: **부분 구현 — 로컬 복구 초안과 화면 검증 완료, native·DB 반영 대기**
- 범위: 버전별 직업 상세, 복구 초안 편집, 신규 직업 알림, 무기 유형 후보
- 시각 기준: `screenshots/manual/electron/maple-insight-job-data-ui-state-storyboard.png`
- 관련 계획: [Phase 4 직업·스킬 편집](../GOAL/Phase04.md) · [Phase 5 DB 반영](../GOAL/Phase05.md) · [직업 taxonomy 표시 데이터 계약](./job-taxonomy-display-contract.md) · [요청 목차](./README.md)
- Phase 상태: 이 독립 요청은 Phase 4 완료 근거가 아니며 현재 진행 중인 Phase 4의 미완료 상태를 바꾸지 않는다.

## 결정된 경계

사용자는 **초안 우선**과 **DB 별도 승인**을 선택했다. 현재 구현은 Electron의 로컬 복구 초안이며 승인된 Phase 4 edit workbench 또는 Phase 5 DB publish 입력이 아니다. 실제 직업·무기 유형 등록과 관계 저장은 별도 DB 설계 검토와 사용자 승인 뒤에만 진행한다.

기존 `.job-draft-recovery`의 Phase 4 전환 방향은 **검토 뒤 복사**로 확정한다. 버전·직업 ID별로 원본을 보여주고 사용자가 선택한 값만 새 change-set의 변경 불가능한 첫 metadata revision으로 복사한다. 자동 import·일괄 복사와 복구 저장소·workbench 간 dual write는 하지 않으며 원본 복구 초안은 삭제하거나 변경하지 않는다. 현재 읽기 전용 검토와 직업별 명시적 `선택 직업 복사`를 구현했다. 선택·결과 record에는 원본 provenance인 source recovery ID·SHA256, target hash들, 제외 필드와 결과를 남긴다. `jobName`·`newWeaponTypes`·`advancementJobIds`는 변환 대상에서 제외하고 확인 화면에 명시하며, 새 무기 후보를 참조하는 선택은 차단한다. stale source·target 거부와 멱등 재시도를 적용했다. 기존 에디터는 계속 기존 복구 저장소에 저장하고 새 workbench를 읽지 않는다.

## 현재 구현

- 선택 버전의 사용자 직업 목록과 상세 기본 정보를 조회한다. 직업군·소속 필터와 ID·한글명·영문명 검색을 제공한다.
- 상세 화면에서 영문 이름, 직업군, 소속, 주·부스탯을 인라인 편집한다. 저장 시 해당 직업의 전체 `JobDraft`를 복구 저장소의 `drafts.json`에 반영한다.
- 전체 편집 화면에서 기본 정보와 기존 무기 유형을 선택하고 새 무기 유형 후보를 추가한다. 후보 필드는 UUID key, category, part, 영문 이름, 직업군, 손 타입, 무기 상수다.
- 전체 편집 화면은 변경 뒤 700ms에 복구 초안을 자동 저장하며 저장 버튼으로 재시도할 수 있다. optimistic revision 충돌을 검사하고 최신 입력 위에 이전 저장 응답을 덮지 않는다.
- 저장 위치는 `.job-draft-recovery/<environment>/<version>/<recoveryId>/drafts.json`이다. `current.json`이 현재 UUID를 가리킨다. 저장은 임시 파일 rename으로 교체하며 버전별 복구 초안을 다시 조회한다.
- 미저장 인라인 변경 또는 자동 저장 대기·진행 중에는 다른 직업·버전·페이지 이동과 창 종료 경고를 제공한다.
- 신규 직업 알림은 이전 버전과 현재 버전 사이에 **이미 저장된** `ms_job.json` diff의 `add`만 읽는다. 비교를 자동 실행하거나 diff를 새로 만들지 않는다.
- `스킬 정보` 영역과 기본 정보 외 상세 탭 이름은 자리만 있으며 데이터·상호작용은 없다.

## 제한과 미완료

- 현재 복구 저장소에는 Phase 4 `changeSetId`, manifest, validation/raw input hash, canonical hash, 상태 전이 또는 승인 무효화 계약이 없다.
- 저장된 `JobDraft` 값과 revision은 재열리지만, 저장 전 dirty 상태나 버려진 입력 자체를 복원하지 않는다.
- 시스템 직업은 목록과 저장 대상에서 제외한다. 일반 직업의 수동 제외·재포함 override와 사유·reviewer·이력은 없다.
- 신규 직업 알림은 저장된 직업 diff만 표시한다. 자동 비교, 스킬 변화 요약, 여러 상세 탭 데이터는 없다.
- 초안은 최신 전체 값과 revision만 유지한다. 필드별 mutation history, before hash, review 상태 또는 superseded 이력은 없다.
- 새 무기 후보에는 별도 `normalizedPart`, 출처, review 상태, 공격 속도, 무기 상수 예외가 없다. 저장 시 공백 제거 identity로 catalog 중복만 검사한다.
- 새 무기 후보는 로컬 초안 옵션이다. 전역 `WeaponType` 등록, 다른 직업에서의 공유, DB seed 또는 migration을 수행하지 않는다.
- 이 복구 초안은 dry-run, 승인, publish, `ready` 전환과 연결되지 않는다.
- 전직 정보는 현재 버전 DB의 직업 ID·이름과 공유 분류 규칙으로 구성한 전직 트리를 보여준다. 스킬 정보·링크 스킬·기타 데이터는 placeholder다. 직업-스킬 연결은 후속 범위다.

## 후속 DB 목표

현재 DB에는 `GameJob`과 `WeaponType`의 관계가 없다. `WeaponType.allowedJobIds`는 catalog 속성 배열이며 버전별 `GameJob` 관계를 대신하는 승인된 스키마가 아니다. 직업 보강 metadata 모델, 관계의 버전성·FK 방향과 삭제 정책은 database 설계 리뷰와 사용자 승인이 필요하다. 승인 전에는 이 요청을 근거로 schema, migration, seed 또는 실제 DB 쓰기를 진행하지 않는다.

승인 이후 목표는 같은 승인된 입력에서 **직업 보강 등록, 필요한 새 무기 유형 등록, 직업-무기 연결**을 하나의 DB transaction으로 처리하는 것이다. 중복 catalog 충돌, 직업 저장 또는 관계 저장 중 하나라도 실패하면 전체를 rollback한다. Phase 5의 dry-run, 동일 hash 승인, 부분 반영 금지와 작업본 보존 정책을 적용한다. 이 목표는 현재 구현 범위가 아니다.

## 남은 작업

- [ ] 부분 구현한 버전·직업 ID별 `검토 뒤 복사`를 native Electron·실제 데이터와 외부 동시 source writer 조건에서 검증하고, 기존 에디터를 Phase 4 workbench 읽기·쓰기로 전환한다.
- [ ] dirty 복원, 제외 override, 변경 이력과 미저장 discard 경계를 정의하고 구현한다.
- [ ] 신규 직업 알림의 자동 비교 여부와 스킬 변화 표시 범위를 결정한다.
- [ ] 스킬 정보 placeholder를 실제 직업-스킬 연결 흐름으로 구현한다.
- [ ] 무기 후보의 누락 metadata와 DB transaction 스키마를 별도 승인받는다.
- [ ] native Electron에서 인라인 저장, 자동 저장·충돌, 재열기, 이동 경고, 알림과 무기 후보를 검증한다.

## REVIEW — 복구 초안 선택 복사 부분 구현·검증 (2026-11-13)

- `직업 데이터 → 에디터`의 읽기 전용 복구 미리보기에서 직업별 명시적 `선택 직업 복사`를 제공한다. 일괄 복사는 없으며 확인 화면에 제외되는 `jobName`·`newWeaponTypes`·`advancementJobIds`를 나열한 뒤 선택값만 Phase 04 작업본의 변경 불가능한 첫 metadata revision으로 복사한다.
- `.job-draft-recovery` 원본은 보존한다. 복사 record에는 provenance인 source recovery ID·원본 SHA256, target hash들, 제외 필드와 결과를 남긴다. 새 무기 후보를 참조하는 선택은 차단하고 stale source·target을 거부하며, 동일 요청 재시도는 멱등이다. 실패 뒤 버튼은 새로고침 전까지 다시 실행할 수 없고 처리 중·성공 뒤 반복 클릭도 비활성화한다. 기존 에디터는 계속 기존 복구 저장소에 저장하고 새 workbench를 읽지 않으며 DB publish는 없다.
- 집중 Vitest 68개(`job-data` 32개, `edit-workbench` 36개), Electron production build·Node/Web typecheck, 대상 ESLint·Prettier가 통과했다. Chromium 모의 스크립트는 desktop 1480×920·mobile 390×844에서 취소·stale·성공·차단·버전 route·의도하지 않은 쓰기 없음 흐름을 확인하고 exit 0이었다. 스크린샷 `screenshots/playwright/electron/job-recovery-preview-e2e-{desktop,mobile}.png`는 Git 제외 상태다.
- native Electron IPC·실제 DB와 외부 동시 source writer race는 미검증이다. Phase 04는 미완료이며 남은 작업 체크박스는 그대로다.

## REVIEW — 부분 검증

- Electron Node/Web 및 `@maple/db` TypeScript 검사, Electron production build와 Vitest 23개 파일·201개 테스트가 exit 0이었다. 복구 저장·재열기, 버전 격리, revision 충돌, 심볼릭 링크 거부, 무기 category·중복 검증과 알림 모델을 포함한다.
- Playwright Chromium renderer 모의 데이터 검증이 exit 0이었다. 데스크톱 1480×920·모바일 390×844에서 필터·검색·인라인 일괄 적용과 이동 경고, 전체 편집·무기 후보·자동 저장·재진입, 신규 직업 알림·이동·초안 재열기, 저장/조회 실패와 다른 화면 이동을 확인했다. 이미지: `screenshots/playwright/electron/job-data-e2e-{desktop,mobile}.png` (Git 제외).
- 실제 PostgreSQL 연결에 필요한 `DATABASE_URL`이 없어 native Electron·실제 DB IPC 검증은 수행하지 못했다. 모의 저장 동작과 실제 파일 저장의 end-to-end 통합은 미검증이다.
- DB 설계 승인과 schema/migration/transaction 검증은 진행하지 않았다.

## REVIEW — UI 보완 검증 (2026-11-07)

- 직업 상세의 편집 행 geometry를 고정하고 select를 행 안쪽에 배치했다. 직업 페이지 shell padding을 제거하고 각 내부 영역에 margin을 두었다.
- 사이드바에 직업 정보·편집기 accordion과 picker를 제공한다. 당시 전직 정보를 비롯한 다른 상세 탭은 활성 전환되는 빈 화면이었다. 이후 전직 정보에는 DB 기반 전직 트리를 표시한다.
- checkbox OR/AND 필터를 넓히고 reset 구분선을 표시했다. 직업 목록 scrollbar는 숨기고 전역 scrollbar는 얇게 표시한다.
- navbar bell에 스크린샷 성공·오류 알림을 누적한다. 일반 push도 사용할 수 있으며 성공 banner는 표시하지 않는다.
- Web typecheck, 대상 Vitest 11개, production `electron-vite build`, ESLint·Prettier가 모두 exit 0이었다.
- Playwright Chromium 모의 renderer 상호작용 스크립트가 exit 0이었다. desktop 1480×920·mobile 390×844에서 직업 필터, 탭, 편집·저장·이동 경고, editor route, 스크린샷 알림과 route/theme 회귀를 확인했다. 이미지: `screenshots/playwright/electron/job-data-e2e-{desktop,mobile}.png` (Git 제외).
- native Electron screenshot IPC, 실제 screenshot PNG 저장과 실제 DB 연동은 검증하지 않았다. 모의 capture만 확인했으며 이 기록은 Phase 04·REQ002 완료 근거가 아니다.

## REVIEW — 전직 대표 이름·트리 연결 검증 (2026-11-08)

- `GameJob`의 현재 버전 ID·이름을 공유 직업 ID 분류기로 묶는다. 실제 DB에 있는 4차 전직을 대표로 표시하고 0·1·1.5·2·2.5·3·4·6차의 존재하는 행만 전직 정보에 보여준다. 5차는 별도 직업 ID가 없으며 모호한 ID는 검토 표시를 유지한다. 정규화 ID가 중복되면 원본 ID를 보존하고 하나만 대표로 선택하며 다른 행은 기존 목록에 남긴다.
- 에디터는 대표 직업의 실제 전직 ID를 체크해 한 복구 초안에 연결한다. 기존 초안은 새 연결 필드 없이 읽으며, backend는 다른 전직 그룹 ID 연결을 거부한다. 이 연결은 로컬 복구 초안에만 저장하고 DB 관계·마이그레이션·publish는 수행하지 않는다.
- Electron Node/Web 타입 검사, 전체 Vitest 23개 파일·210개 테스트, ESLint·Prettier, production build가 통과했다. Playwright Chromium 모의 renderer가 desktop 1480×920·mobile 390×844에서 대표 목록, 전직 ID/이름, 연결·재열기·해제, 필터, 기존 편집·알림·인접 경로를 검증했다. 이미지: `screenshots/playwright/electron/job-data-e2e-{desktop,mobile}.png` (Git 제외).
- `DATABASE_URL`이 없어 실제 DB 데이터의 명칭·누락, native Electron IPC와 복구 파일 재시작 경로는 미검증이다. Phase 04·REQ002 완료로 표시하지 않는다.

## REVIEW — 정보·에디터 UI 부분 검증 (2026-11-09)

- 직업 정보는 선택한 주무기·보조무기 key를 catalog와 초안 후보의 표시명으로 해석하고 빈 값은 `미입력`으로 표시한다. 종족은 현재 DB·`JobDraft`·taxonomy에 직업별 authoritative source가 없어 `미등록`으로 표시한다.
- 에디터 행은 `jobID` → `직업명` → `원본 직업명` → `직업 영문명` → `직업군` → `소속` → `주스탯` → `부스탯` 순서다. desktop/mobile label 폭은 112px/88px, 입력 높이는 32px이며 control별 최대 폭을 유지한다.
- 저장은 최초 진입·재열기·원상 복구·성공 뒤와 저장 중 비활성화되고, 편집 뒤와 실패 재시도 때 활성화된다.
- Chromium 모의 script 전체 실행은 exit 0이었다. desktop 1480×920·mobile 390×844에서 인접 상세·에디터 route, 저장·no-op·autosave·오류 흐름을 확인했고 Git ignored 스크린샷을 `screenshots/playwright/electron`에 저장했다. Vitest 23개 파일·222개 테스트와 Electron production build·Node/Web 타입 검사, 변경 파일 ESLint·Prettier가 통과했다.
- 실제 DB·native Electron 통합은 검증하지 않았으며 Phase 04 완료로 표시하지 않는다.

## REVIEW — 복구 초안 읽기 전용 사전검사 부분 검증 (2026-11-12)

- `job-data.ts`의 내부 `previewJobDraftRecovery`는 현재 무기 catalog·스탯 제약으로 복구 초안을 검증하고, `recoveryId`, 정확한 원본 파일의 SHA256, 원본 `jobId`·`jobName`·`revision`과 제안 metadata를 반환한다. `jobName`·`newWeaponTypes`·`advancementJobIds`는 명시적으로 제외하며, 초안 무기 후보 참조는 향후 복사 차단 대상으로 표시한다.
- 중복 직업 ID는 거부하되 선행 0이 있는 ID는 서로 다른 문자열로 취급한다. malformed·symlink·읽는 동안 바뀐 원본도 거부하고 복구 초안은 변경하지 않는다. UI·IPC·복사·새 workbench 쓰기·DB 쓰기는 없으며 Phase 04는 미완료다.
- 제공된 검증 근거는 `job-data` 24개와 `edit-workbench` 27개를 합친 Vitest 51개, Electron production build·Node/Web typecheck, 범위 지정 ESLint·Prettier와 `git diff --check`가 모두 exit 0이다. 실제 DB·native Electron은 검증하지 않았다. 남은 작업 체크리스트는 완료 처리하지 않는다.

## REVIEW — 복구 초안 읽기 전용 UI 부분 체크포인트 (2026-11-12)

- `직업 데이터 → 에디터` 헤더 근처의 접힌 안내를 열면 복구 검토를 지연 조회해 원본 `recoveryId`·SHA256, 직업별 제안·제외 필드와 무기 후보 참조 차단 사유를 읽기 전용으로 표시한다. IPC/preload도 preview 조회만 제공하며 오류·재시도·빈 상태·버전 전환 race를 처리한다.
- 선택·복사 action과 새 edit workbench 쓰기는 아직 없고 기존 로컬 복구 원본은 변경하지 않는다. 집중 Vitest 51개(`job-data` 24개, `edit-workbench` 27개), Electron production build·Node/Web typecheck, 대상 lint·Prettier와 Chromium 모의 스크립트가 exit 0이었다.
- Chromium 모의 브라우저는 desktop 1480×920·mobile 390×844에서 열기·새로고침·오류·빈 상태·stale 응답·버전 전환과 직업 상세 왕복을 확인했다. 스크린샷 `screenshots/playwright/electron/job-recovery-preview-e2e-{desktop,mobile}.png`는 Git 제외 상태다. native Electron IPC와 실제 DB·복구 데이터는 미검증이며 Phase 04는 미완료, 남은 작업 체크박스는 그대로다.
