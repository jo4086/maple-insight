# Maple Insight Data Studio Review

## Phase 04 edit workbench lock 경합 수정 부분 검증 (2026-11-14)

- 사용자 native `job-data:list`는 live Electron PID 32650이 보유한 `.create.lock` 때문에 `Edit workbench creation is already locked by active process 32650` 오류로 전체 직업 snapshot 조회에 실패했고, 해당 프로세스는 이후 종료했다. 원인은 같은 프로세스의 concurrent workbench open과 metadata read가 `.create.lock`에서 경합한 것이다.
- root-local in-process queue로 같은 root의 open·read·save를 직렬화했다. 외부 프로세스 lock과 dead·malformed lock은 계속 fail closed하며 자동 제거하지 않고, 같은 root의 중첩 호출은 즉시 거부한다.
- 전체 Node/Web typecheck, Vitest 24개 파일·273개 테스트, lint, build, 변경 범위 Prettier와 `git diff --check`가 모두 exit 0이었다. mocked browser desktop·mobile도 통과했다.
- native Electron read-only DB 버전 `1.2.419`의 297개 직업과 폐기 가능한 synthetic ready workspace에서 네 개의 concurrent `job-data:list` 결과가 같은 `changeSetId`로 일관됐고 jobID 화면이 렌더링됐으며 exit 0이었다. workbench가 없는 같은 native read-only DB에서도 297개 직업을 반환했지만 편집은 사용할 수 없었다.
- synthetic workspace는 검증된 실제 데이터가 아니다. 실제 DB 쓰기와 유효 저장·복사는 검증하지 않았으며 Phase 04 완료 상태와 체크박스는 변경하지 않는다.

## Phase 04 직업 에디터 작업본 전환 부분 검증 (2026-11-13)

- DB 등록 직업은 edit workbench에서 `englishName`·`classGroup`·`affiliation`·`mainStat`·`subStat`·`primaryWeapons`·`secondaryWeapons` 7개 metadata 필드를 일괄 조회하고 저장·재열며, job별 workbench scan 대신 metadata batch read를 사용한다. 저장은 `changeSetId`와 `revision` stale guard를 모두 적용하고 DB 미등록 직업을 차단한다. legacy 복구 저장소에는 쓰지 않는다.
- ready validation workspace가 있을 때만 편집한다. 없으면 DB 직업을 읽기 전용으로 탐색한다. legacy 복구 미리보기·선택 복사를 유지하고 제외 필드 `jobName`·`newWeaponTypes`·`advancementJobIds`를 화면에 표시한다. 비동기 이전 저장 응답 경합, autosave validation, 복사 DB ID, IPC·서비스 trust boundary도 보강했다.
- 최종 Node/Web typecheck와 build, 전체 24개 파일·270개 테스트, lint, 변경 범위 Prettier와 `git diff --check`가 exit 0이었다.
- `verify-job-data-playwright.mjs`는 exit 0이었다. mocked browser desktop 1480×920·mobile 390×844에서 route 일관성, mock 저장·재열기, stale, unavailable workspace와 복구 복사를 확인했다. native Electron smoke는 폐기 가능한 data root에서 startup, preload, 잘못된 save guard와 job/operations route를 확인하고 exit 0이었다.
- 실제 DB·ready validation fixture를 사용한 native 유효 저장·재열기·복사, credential-backed 또는 실제 DB 흐름, 비협조적 외부 프로세스의 source writer 경합은 검증하지 않았다. Phase 04는 미완료이며 체크박스는 그대로다.

## Main process 구조 재정리 구현 완료·부분 검증 (2026-11-13)

- [요청 문서](./REQUESTS/main-process-architecture.md#review--구현-완료부분-검증-2026-11-13)에 따라 1,098줄 `index.ts`의 서비스, IPC와 app/window/runtime 책임을 분리하고 60줄 bootstrap으로 정리했다. Phase 04 완료 상태는 변경하지 않았다.
- 기준선 typecheck, test(24개 파일·272개 테스트), lint, build와 `git diff --check`는 exit 0이었다. broad Prettier는 기존 style issue 14개로 exit 1이었다.
- Stage 2 서비스 이동의 typecheck, test(24개 파일·272개 테스트), lint, build와 `git diff --check`는 exit 0이었고 이동된 경로의 broad Prettier에는 기존 issue 11개가 남았다.
- Stage 3 IPC 추출 중 네 차례의 typecheck와 test가 통과했다. 최종 lint, build, 변경 범위 Prettier와 `git diff --check`는 exit 0이었다. lint warning 10개는 Stage 4에서 수정했다.
- Stage 4 app/window/runtime 분리 뒤 전체 typecheck, test(24개 파일·272개 테스트), lint, build, 변경 범위 Prettier와 `git diff --check`가 모두 exit 0이었다. 독립 대조에서도 channel 상수 27개와 unique invoke handler 23개가 유지됐다.
- inline Playwright native Electron smoke는 exit 0이었다. startup, preload, 잘못된 입력 guard 3개, 존재하지 않는 session 취소, screenshot IPC와 dashboard/upload navigation을 확인했다. mocked browser 직업 상호작용도 desktop/mobile에서 통과했다.
- 기존 native `capture-playwright.mjs --all`은 overview, upload, version-list, compare, equipment screenshot 저장 뒤 class navigation의 `waitForFunction`(`aria-current=page`) timeout으로 exit 1이었다. 원인은 selector가 accordion인 `직업 데이터`에 `aria-current=page`를 기대한 불일치다. 실제 상태는 `직업 데이터`가 `aria-expanded=true`·`aria-current=null`이고 child `직업 정보`가 `aria-current=page`다.
- 후속 inline native Playwright는 `직업 데이터` accordion을 연 뒤 `직업 정보` child를 클릭하고 operations까지 이동해 각 실제 route의 `aria-current=page`를 확인했으며 exit 0이었다. class/operations 실제 route 상호작용은 검증했지만 capture 이미지는 완료되지 않았다. screenshot script 코드는 변경하지 않았다. 기존 이력은 유지한다.
- credential-backed DB copy/rollback, 실제 conversion·validation cancellation과 sender 종료 cleanup, macOS `activate`, packaged app smoke는 미검증이다. 따라서 runtime 재활성화, handler 전체 의미, rollback·배타성·경로 안전 조건과 전체 사용자 동작은 완료로 판정하지 않는다.

## Phase 04 복구 초안 선택 복사 부분 구현·검증 (2026-11-13)

- `직업 데이터 → 에디터`의 읽기 전용 복구 미리보기에서 직업별 명시적 `선택 직업 복사`를 제공한다. 일괄 복사는 없으며 확인 화면에 제외되는 `jobName`·`newWeaponTypes`·`advancementJobIds`를 나열한 뒤 선택값만 Phase 04 작업본의 변경 불가능한 첫 metadata revision으로 복사한다.
- `.job-draft-recovery` 원본은 보존한다. 복사 record에는 provenance인 source recovery ID·원본 SHA256, target hash들, 제외 필드와 결과를 남긴다. 새 무기 후보를 참조하는 선택은 차단하고 stale source·target을 거부하며, 동일 요청 재시도는 멱등이다. 실패 뒤 버튼은 새로고침 전까지 다시 실행할 수 없고 처리 중·성공 뒤 반복 클릭도 비활성화한다.
- 기존 에디터 저장은 계속 기존 복구 저장소에 기록하며 새 workbench를 읽지 않는다. DB publish와 일괄 이관은 없다. 집중 Vitest 68개(`job-data` 32개, `edit-workbench` 36개), Electron production build·Node/Web typecheck, 대상 ESLint·Prettier가 통과했다.
- Chromium 모의 스크립트는 desktop 1480×920·mobile 390×844에서 취소·stale·성공·차단·버전 route·의도하지 않은 쓰기 없음 흐름을 확인하고 exit 0이었다. 스크린샷 `screenshots/playwright/electron/job-recovery-preview-e2e-{desktop,mobile}.png`는 Git 제외 상태다. native Electron IPC·실제 DB는 미검증이다. 첫 revision 게시 직전에 복구 원본을 재확인하지만, 비협조적 외부 프로세스가 재확인 후 파일을 교체하는 경합은 원자적으로 차단하지 못한다. Phase 04는 미완료, 체크박스는 그대로다.

## Phase 04 복구 초안 읽기 전용 UI 부분 체크포인트 (2026-11-12)

- `직업 데이터 → 에디터` 헤더 근처의 접힌 안내를 열면 복구 검토를 지연 조회해 원본 `recoveryId`·SHA256, 직업별 제안·제외 필드와 무기 후보 참조 차단 사유를 읽기 전용으로 표시한다. IPC/preload도 preview 조회만 제공하며 오류·재시도·빈 상태·버전 전환 race를 처리한다.
- 선택·복사 action과 새 edit workbench 쓰기는 아직 없고 기존 로컬 복구 원본은 변경하지 않는다. 집중 Vitest 51개(`job-data` 24개, `edit-workbench` 27개), Electron production build·Node/Web typecheck, 대상 lint·Prettier와 Chromium 모의 스크립트가 exit 0이었다.
- Chromium 모의 브라우저는 desktop 1480×920·mobile 390×844에서 열기·새로고침·오류·빈 상태·stale 응답·버전 전환과 직업 상세 왕복을 확인했다. 스크린샷 `screenshots/playwright/electron/job-recovery-preview-e2e-{desktop,mobile}.png`는 Git 제외 상태다. native Electron IPC와 실제 DB·복구 데이터는 미검증이며 Phase 04는 미완료, 체크박스는 그대로다.

## Phase 04 복구 초안 읽기 전용 사전검사 부분 검증 (2026-11-12)

- `job-data.ts`의 내부 `previewJobDraftRecovery`는 현재 무기 catalog·스탯 제약으로 복구 초안을 검증하고, `recoveryId`, 정확한 원본 파일의 SHA256, 원본 `jobId`·`jobName`·`revision`과 제안 metadata를 반환한다. `jobName`·`newWeaponTypes`·`advancementJobIds`는 명시적으로 제외하며, 초안 무기 후보 참조는 향후 복사 차단 대상으로 표시한다.
- 중복 직업 ID는 거부하되 선행 0이 있는 ID는 서로 다른 문자열로 취급한다. malformed·symlink·읽는 동안 바뀐 원본도 거부하고 복구 저장소는 변경하지 않는다. UI·IPC·복사·새 workbench 쓰기·DB 쓰기는 없으며 Phase 04는 미완료다.
- 제공된 검증 근거는 `job-data` 24개와 `edit-workbench` 27개를 합친 Vitest 51개, Electron production build·Node/Web typecheck, 범위 지정 ESLint·Prettier와 `git diff --check`가 모두 exit 0이다. 실제 DB·native Electron은 검증하지 않았다.

## Phase 04 직업 변경 이력 내부 저장 부분 검증 (2026-11-12)

- 현재 작업본에 `jobID`별 직업 메타데이터 변경을 UUID record와 증가 revision의 변경 불가능한 파일로 저장하고 재열 수 있다. 기존 revision 해시와 예상 revision을 검사하며 보류 중인 임시 파일은 보존하고 건너뛴다. 입력 변경 후 이전 `superseded` 작업본은 읽기 전용으로 조회할 수 있고 새 작업본은 빈 상태로 시작한다.
- Linux에서 파일·디렉터리 동기화를 거친 뒤 성공을 반환한다. 집중 Vitest 27개, Electron production build·Node/Web 타입 검사 및 대상 ESLint·Prettier가 exit 0이었다. 실제 강제 종료·전원 손실 및 다른 운영체제의 동기화 내구성은 검증하지 않았다.
- 기존 로컬 복구 초안의 **검토 뒤 선택 복사**는 방향만 확정했다. 복사 화면, 원본 provenance 검증, 무기 후보·전직 연결의 도메인별 변환, IPC·UI·DB 연동은 아직 없다. Phase 04 완료 조건은 열어 둔다.

## Phase 04 EWB-005 저장 안전성 부분 체크포인트 (2026-11-12)

- 내부 edit workbench 서비스는 같은 검증 입력 hash의 UUID change-set을 재열고, 입력 hash가 바뀌면 이전 change-set을 `superseded`로 보존한 뒤 이를 부모로 하는 새 change-set을 만든다.
- supersession 도중 중단되어도 이전 `superseded` tip을 유지하며 다음 열기에서 child 생성을 마칠 수 있다. 완료되지 않은 staging directory는 보존하되 열기 대상에서는 무시한다.
- live·malformed·dead lock은 모두 fail closed한다. path rename race가 live owner를 축출할 수 있어 lock을 자동 회수하지 않는다. dead lock도 모든 앱 프로세스를 닫은 뒤 수동 조사하고 backup 위치로 옮겨야 하며, 파괴적 자동 정리는 하지 않는다.
- 최초 저장 경계의 집중 Vitest 20개와 Electron production build·Node/Web 타입 검사, 대상 ESLint·Prettier가 exit 0이었다. 이후 Linux 디렉터리 fsync와 직업 변경 이력을 추가했으며 위 별도 기록을 따른다. 실제 프로세스 강제 종료·전원 손실 및 적대적 동시 경로 교체는 미검증이다. 기존 복구 초안 migration, IPC·UI 연동은 아직 없으며 Phase 04 완료 체크리스트는 변경하지 않는다.

## Phase 04 기초 저장 경계 부분 검증 (2026-11-09)

- `apps/electron/src/main/services/edit-workbench.ts`와 `apps/electron/src/main/services/edit-workbench.test.ts`의 내부 미연결 서비스는 ready 검증 작업본에서 빈 UUID manifest를 생성하고 재열며, validation report·marker·converted manifest와 목록화된 JSON hash를 확인한다. symlink와 생성 뒤 입력이 바뀐 충돌은 거부한다.
- 집중 Vitest 12개와 Electron production build·Node/Web 타입 검사, 대상 ESLint·Prettier가 통과했다. publish, 기존 복구 초안 migration, IPC·UI, 이전 change-set supersession·recovery, 실제 DB는 구현하거나 검증하지 않았다.
- 프로세스 crash는 exclusive lock을 남겨 수동 검토가 필요할 수 있다. 적대적 동시 행위자의 path ancestor race를 완전히 막지 못하며 directory rename은 power-loss durable하지 않다.
- 다음 작업은 EWB-005 supersession과 crash recovery, revision history·records, 복구 초안 migration 설계이며 storage가 안전해진 뒤 UI를 연결한다. Phase 04 수용 항목은 완료 처리하지 않는다.

## 직업 정보·에디터 UI 부분 검증 (2026-11-09)

- 직업 정보는 선택한 주무기·보조무기 key를 catalog와 초안 후보의 표시명으로 해석하고 빈 값은 `미입력`으로 표시한다. 종족은 현재 DB·`JobDraft`·taxonomy에 직업별 authoritative source가 없어 `미등록`으로 표시한다.
- 에디터 행은 `jobID` → `직업명` → `원본 직업명` → `직업 영문명` → `직업군` → `소속` → `주스탯` → `부스탯` 순서다. desktop/mobile label 폭은 112px/88px, 입력 높이는 32px이며 control별 최대 폭을 유지한다. 저장은 최초 진입·재열기·원상 복구·성공 뒤와 저장 중 비활성화되고, 편집 뒤와 실패 재시도 때 활성화된다.
- Chromium 모의 script 전체 실행은 exit 0이었다. desktop 1480×920·mobile 390×844에서 인접 상세·에디터 route와 저장·no-op·autosave·오류 흐름을 확인했다. 스크린샷은 Git ignored 상태로 `screenshots/playwright/electron`에 저장했다. Vitest 23개 파일·222개 테스트와 Electron production build·Node/Web 타입 검사, 변경 파일 ESLint·Prettier가 통과했다.
- 실제 DB·native Electron 통합은 검증하지 않았으며 Phase 04 완료로 표시하지 않는다. 상세 기록은 [직업 데이터 탭 요청](./REQUESTS/job-data-tab.md#review--정보에디터-ui-부분-검증-2026-11-09)을 따른다.

## 시그너스 필터·대표 4차 전직 accent 검증 (2026-11-08)

- `node apps/electron/scripts/verify-job-data-playwright.mjs`는 exit 0이었다. 시그너스 기사단 순서에 4차 대표 jobID `5112` 미하일 전직 트리를 추가하고, 저장 초안의 소속을 의도적으로 오래된 `노바`로 두었다. `직업 정보`의 `시그너스 기사단` 필터에서 미하일이 표시·선택되고 히어로·배틀메이지가 제외됐으며, 필터 해제 뒤 미하일과 비시그너스 대표가 다시 함께 표시됨을 확인했다.
- desktop 1480×920과 mobile 390×844의 dark/light 조합 모두에서 미하일 4차 대표 행의 inset box-shadow를 실제 computed style로 확인했다. shadow color는 dark `rgb(85, 230, 176)`, light `rgb(8, 127, 91)`였고 CSS accent computed color와 일치했다. 3차·4차 차수 텍스트 bounding box의 x 좌표 차이는 각 조합에서 `0px`여서 accent가 내용을 밀지 않았다.
- Electron production build·Node/Web typecheck와 Vitest 23개 파일·222개 테스트, Playwright script Prettier, `git diff --check`, `node --check`가 exit 0이었다. 모의 renderer와 localStorage만 검증했으며 실제 DB·native Electron IPC는 검증하지 않았다. Phase 상태는 변경하지 않았다.

## 직업 스탯·무기 선택기 및 표시 계약 검증 (2026-11-08)

- `node apps/electron/scripts/verify-job-data-playwright.mjs`는 exit 0이었다. Chromium 모의 renderer에서 text input 대신 `주스탯`·`부스탯` fieldset의 추가·제거 button과 선택 chip을 사용했다. `STR`, `LUK`, `INT`, `DEX` 네 선택지, 히어로의 `STR, DEX` 복수 주스탯과 `DEX, STR` 복수 부스탯, 인라인 저장·재열기를 확인했다. 선택한 값의 추가 button이 사라져 중복 선택할 수 없음도 확인했다.
- 제논은 `STR, DEX, LUK` 주스탯과 빈 부스탯을 불러와 저장·reload한 뒤 같은 chip 순서와 빈 값을 확인했다. `DEX` 제거와 재추가도 fieldset에서 확인하고 저장했다. 신규 렌은 알려지지 않은 신규 직업으로 영문 이름이 비어 있었고 입력 전 임의 기본값이 없었다. 새 작업본에서 `INT` 주스탯과 `LUK` 부스탯을 선택해 저장·reload했다.
- 작업본이 없는 팔라딘의 영문 기본값 `Paladin`은 내부 영문 `classKey`에서 생성됨을 확인했다. 기존 복구 초안의 `Legacy Hero`는 그대로 유지됐다. 이 생성값은 내부 key의 단어를 읽기 좋게 변환한 값이며, 검수된 메이플스토리 공식 영문 번역 목록이 아니다.
- 4차 대표 전직 행은 왼쪽 accent border와 screen-reader용 대표 설명을 유지하면서 보이는 `대표 이름`을 중복 출력하지 않았다. DB 원본 이름 `최상급 흑마법`은 상세와 편집기에서 유지됐다.
- 주무기 선택기는 검색 입력 전 `+ 추가하기`로 한손검(`sword`)·스태프(`staff`) 후보를 즉시 표시하고 보조무기 `medallion`을 제외했다. key 입력 검색, 결과 없음, 선택 뒤 chip과 `+ 추가하기` 복귀, Escape 닫기, chip 제거를 확인했다. 보조무기도 category 후보 즉시 표시·검색·선택·제거를 확인했다. `새 무기 등록` toggle과 기존 등록·저장 흐름도 유지됐다.
- desktop 1480×920 dark와 mobile 390×844 light에서 route/theme, 가로 overflow 부재, fieldset·label 접근성 assertion이 통과했다. `screenshots/playwright/electron/job-data-e2e-{desktop,mobile}.png`와 `job-editor-e2e-{desktop,mobile}.png`를 새로 생성해 직접 확인했다. desktop/mobile에서 선택 chip, picker button, 전직 행과 레이아웃 잘림이 없었다. 이미지는 Git ignored 상태로 유지한다.
- `pnpm --dir apps/electron run build`, `pnpm --dir apps/electron test`(23개 파일·221개 테스트), 변경 파일 ESLint·Prettier와 `git diff --check`가 exit 0이었다. 실제 DB, native Electron IPC, 운영 데이터 저장은 검증하지 않았다. 모의 renderer와 localStorage 저장만 확인했으며 Phase 04·REQ002 완료 근거로 사용하지 않는다.

## 직업 표시 순서 검증 (2026-11-08)

- `@maple/data-core`의 `affiliations`·`classTree`를 기준으로 소속, 전사·마법사·궁수·도적·해적, 대표 직업 숫자 ID 순서를 적용했다. focused service test 14개가 exit 0이었고 interleaved 소속·직업군, classKey와 다른 순서, 시그너스 미하일, 도적 우선 제논과 공유 시민 ID의 개별 계열 유지를 확인했다.
- Electron Node/Web typecheck, 변경 파일 ESLint·Prettier가 exit 0이었다. Chromium 모의 renderer script가 exit 0이었고 desktop 1480×920·mobile 390×844에서 직업 목록과 에디터의 같은 대표 순서, 탐색·검색·필터 흐름을 확인했다.
- 실제 DB, native Electron IPC와 미매핑 taxonomy 데이터는 검증하지 않았다.

## 직업 taxonomy 대표명·DB 원본명 표시 부분 검증 (2026-11-08)

- [직업 taxonomy 표시 데이터 계약](./REQUESTS/job-taxonomy-display-contract.md#review--부분-검증-2026-11-08)의 단계 A 일부를 구현했다. 3212의 DB 원본명 `최상급 흑마법`은 유지하고 대표명 `배틀메이지`를 표시하며, 112·212 대표 선택도 테스트했다. 모든 단계의 별도 typed field, `missing-stage-4`, 미래 단일 소스·generator·승인 절차·DB 백업은 미구현이다.
- Node/Web typecheck, Vitest 23개 파일·210개 테스트, 변경 source lint, production build와 Chromium 모의 renderer desktop/mobile assertion은 통과했다. Playwright script Prettier는 수정 뒤 재검사에서 통과했다. 실제 DB와 native Electron IPC는 `DATABASE_URL` 부재로 미검증이다.

## 직업 전직 대표 이름·연결 검증 (2026-11-08)

- [직업 데이터 요청 기록](./REQUESTS/job-data-tab.md#review--전직-대표-이름트리-연결-검증-2026-11-08)에 현재 버전 `GameJob` 행과 공유 분류기로 만든 4차 대표 직업·전직 트리, 에디터의 단일 복구 초안 ID 연결과 기존 초안 호환을 기록했다. 실제 DB 관계는 변경하지 않았다.
- Node/Web 타입 검사, Electron 전체 23개 파일·210개 테스트, 변경 source ESLint와 production build가 통과했다. Chromium 모의 renderer에서 desktop 1480×920·mobile 390×844의 대표 목록·전직 단계·ID·이름·연결·재열기·필터·기존 경로를 확인했다. Playwright script Prettier는 수정 뒤 재검사에서 통과했다.
- `DATABASE_URL`이 없어 실제 DB·native Electron IPC·복구 파일 재시작 검증은 수행하지 않았다. Phase 04·REQ002 완료 근거가 아니다.

## 직업 데이터 탭 UI 보완 검증 (2026-11-07)

- [독립 요청 검증 기록](./REQUESTS/job-data-tab.md#review--ui-보완-검증-2026-11-07)에 직업 상세 고정 편집 행·안쪽 select, 페이지 shell 여백 제거와 내부 여백, 사이드바 직업 정보·편집기 accordion/picker, 활성 빈 탭, 넓어진 checkbox OR/AND 필터·reset 구분선·숨긴 직업 scrollbar, 얇은 전역 scrollbar를 기록했다.
- navbar bell에는 스크린샷 성공·오류 알림이 누적되며 일반 push도 사용할 수 있다. 성공 banner는 표시하지 않는다.
- Web typecheck, 대상 Vitest 11개, production `electron-vite build`, ESLint·Prettier가 통과했다. Playwright Chromium 모의 renderer 검증은 desktop 1480×920·mobile 390×844에서 필터, 탭, 편집·저장·이동 경고, editor route, 스크린샷 알림과 route/theme 회귀를 확인했다. 스크린샷은 `screenshots/playwright/electron/job-data-e2e-{desktop,mobile}.png`에 보관한다.
- native Electron screenshot IPC, 실제 screenshot PNG 저장과 실제 DB 연동은 검증하지 않았다. 모의 capture만 확인했으며 Phase 04·REQ002 완료 근거로 사용하지 않는다.

## 직업코드 공유 분류 규칙 연동 (2026-11-05)

- [`@maple/data-core` 목표와 검토 기록](../../../packages/game-data/core/docs/REVIEW/REQ001/Phase01.md)에 따른 직업코드 분류기를 Electron 직업 원본 검증기에 연결했다. 알려진 직업·더미·미분류·스킬 그룹·시스템 ID·모호한 ID를 구분하고 에반 `2220`의 빈 이름을 경고한다. 원본과 DB는 쓰지 않는다.
- Core 분류기 5개 테스트, Core/Electron Node 타입 검사, Electron 23개 파일·202개 테스트와 production build가 통과했다. Chromium 모의 데이터로 desktop 1480×920·mobile 390×844에서 검증 결과 경고·확인·직업 화면 왕복을 확인했다.
- 실제 원본 데이터셋에서 새 경고의 수와 기존 검증 상태 영향, native Electron과 실제 DB 검증은 수행하지 않았다.

## 직업 데이터 탭 복구 초안 (2026-11-05)

- [독립 요청](./REQUESTS/job-data-tab.md#review--부분-검증)에 버전별 직업 화면·인라인 일괄 적용·전체 편집·신규 직업 알림·무기 유형 후보와 파일 복구 초안을 기록했다. 실제 DB 직업·무기 transaction과 Phase 4 작업본 연계는 별도 설계·승인 대기다.
- Electron Node/Web 및 database TypeScript 검사, Electron production build, Vitest 23개 파일·201개 테스트가 통과했다. Playwright Chromium renderer에서 모의 데이터를 사용해 desktop 1480×920·mobile 390×844의 조회·편집·저장·경고·재진입·오류와 인접 화면 이동을 확인했다.
- 실제 DB 연결용 `DATABASE_URL`이 없어 native Electron과 실제 DB IPC·재시작 검증은 수행하지 못했다. 스크린샷은 `screenshots/playwright/electron/job-data-e2e-{desktop,mobile}.png`에 보관하고 Git에 포함하지 않는다.

## 화면 헤더·비교 레이아웃 정리 검증 (2026-10-25)

- [독립 요청](./REQUESTS/page-header-layout.md#review)에 따라 대시보드·업로드·장비·직업·작업 화면의 큰 본문 헤더를 제거하고 버전 리스트 헤더는 유지했다. 비교 화면은 필터 오른쪽 세로 구분선을 표시하고 16px 하단 여백을 제거했다. 기존 Phase 03 완료 상태는 변경하지 않았다.
- Node/Web `tsc`, 대상 ESLint·Prettier와 `electron-vite build`가 모두 exit 0이었다.
- native `verify-comparison-workspace-playwright.mjs`가 exit 0이었다. selector, filter, 반응형 dark/light와 navigation을 확인했다.
- native `capture-playwright.mjs --all`과 `--all --mobile`이 모두 exit 0이었다. 데스크톱 비교 화면의 구분선·하단 여백 assertion을 확인했고 데스크톱 `screenshots/playwright/electron/2026-10-25T06-51-24-698Z-current-{overview,upload,version-list,compare,equipment,class,operations}.png`와 모바일 `screenshots/playwright/electron/2026-10-25T06-56-08-389Z-current-mobile-{overview,upload,version-list,compare,equipment,class,operations}.png`를 캡처했다.
- `verify-version-ui-playwright.mjs`는 과거 비교 제목 `버전 비교` 대기 중 timeout(exit 1)이었다. 버전 리스트·비교 이동은 위 native 검증에서 확인했으나 이 오래된 스크립트의 후속 비교 흐름은 재검증하지 않았다.
- 브라우저 도구를 사용할 수 없어 native Electron Playwright를 사용했다. 비교 script assertion과 전체 화면 캡처 외 다른 route의 추가 상호작용은 검증하지 않았다.

## 렌더러 구조 리팩터링 (2026-10-23)

`App.tsx`의 화면 전환, 업로드, 검증, 버전 작업, 스크린샷과 테마 책임을 렌더러의 routes/pages/layouts/features/app으로 분리했다. 기존 화면 컴포넌트와 비교 결과의 화면 이동 후 유지 방식을 보존했다. React Router v7 메모리 라우터를 사용해 기존 URL 비노출 동작을 유지한다. Electron Main Process 코드는 이번 작업에서 수정하지 않았다.

- 검증: Node/Web TypeScript 검사, 렌더러 ESLint, 변경 파일 Prettier 검사, Vitest 21개 파일·167개 테스트, production `electron-vite build` 통과.
- 당시 제한: 구조 리팩터링 자체의 native Electron 수동 화면 검증은 실행하지 않았다. 이후 통합 비교 작업공간의 native 검증은 아래 별도 기록에서 실행했다. 통합 `typecheck` 스크립트는 로컬 pnpm v12와 프로젝트 설정 v10의 버전 충돌로 실행되지 않아 같은 두 TypeScript 명령을 직접 실행했다.

## 통합 비교 작업공간 screenshot refinement 검증 (2026-10-24)

- `electron-request-3.png` 기준대로 모든 수정 카드가 단일 outline container와 반응형 before·after JSON box 두 개를 표시했다. 전체 snapshot에서는 변경되지 않은 문맥을 모두 유지하고 중첩된 변경 leaf 값만 강조했으며, 그 밖의 값은 중립 표시했다.
- snapshot이 없는 legacy 산출물은 확인 가능한 최선의 identity와 변경 필드별 이전·이후 값만 같은 두 box에 표시했다. 추가·삭제 카드 표시는 바뀌지 않았다.
- main·IPC·storage, 비교 알고리즘, diff 저장 형식, 선택적 snapshot, identity, 입력 hash와 저장·충돌 정책은 변경하지 않았다.
- Node/Web TypeScript, 전체 Electron ESLint, Prettier, Vitest 21개 파일·182개 테스트와 `electron-vite` production build가 모두 exit 0이었다.
- native `verify-comparison-workspace-playwright.mjs`가 exit 0이었다. desktop 1480×920과 mobile 390px 폭에서 각각 두 box의 가로·세로 배치를 확인했다.
- 스크린샷: `screenshots/playwright/electron/comparison-workspace-desktop.png`, `screenshots/playwright/electron/comparison-workspace-mobile.png`.
- 아래 field-row 형식과 이전 refinement 검증은 당시 이력으로 유지한다. MemoryRouter의 legacy `/compare-results` 직접 native 진입 제한도 그대로다.

## 통합 비교 작업공간 후속 refinement 검증 (2026-10-24)

- 원인은 파일명별 처리가 아니라 선택적 `before`·`after` snapshot과 legacy 변경 필드에 따른 renderer 분기였다. 모든 수정 카드를 원본 identity와 변경 필드별 이전·이후 값을 보여 주는 필드 중심 형식으로 통합했다. 추가·삭제의 전체 레코드 표시는 유지했다.
- 저장 결과 자동 열기 성공 notice `저장된 비교 결과를 열었습니다.`는 표시하지 않고 조회 실패 등 오류와 저장 충돌 표시는 유지했다. main·IPC·storage, diff 저장 형식, identity, 비교 알고리즘과 저장 정책은 변경하지 않았다.
- Node/Web TypeScript, Electron ESLint, Prettier, Vitest 21개 파일·180개 테스트와 production build가 모두 exit 0이었다.
- native `verify-comparison-workspace-playwright.mjs`가 exit 0이었다. `ms_job.json`·`ms_skill.json` 수정 카드, 추가·삭제 전체 레코드, 변경 유형 필터, 검색, 상단 페이지 이동, 성공 notice 부재, 오류와 충돌 표시를 확인했다.
- 스크린샷: `screenshots/playwright/electron/comparison-workspace-desktop.png`.
- 아래 이전 refinement와 2026-10-23의 수정 전후 전체 JSON 검증 날짜는 당시 이력으로 유지한다. MemoryRouter의 legacy `/compare-results` 직접 native 진입 제한도 그대로다.

## 통합 비교 작업공간 refinement 검증 (2026-10-24)

- Node/Web `tsc`, 전체 Electron ESLint, Prettier, Vitest 21개 파일·178개 테스트와 production build가 모두 exit 0이었다.
- native script가 exit 0이었다. 초기 기준 버전·파일 dropdown 미선택과 batch 비활성화, 저장 결과 자동 열기, 선택 변경 초기화, 저장 결과 없음, 지연 응답 race 차단을 확인했다.
- desktop/mobile screenshot과 dark/light를 확인했다. 다섯 파일 batch와 충돌 처리, 파일 전환 뒤 충돌 유지, 지연된 교체 완료 뒤 Cancel 숨김을 확인했다.
- legacy `/compare-results` 직접 native 진입만 미검증이며 새 UI 변경 범위 밖이다. 2026-10-23 기록과 기존 Phase 03 이력은 그대로 유지한다.

## 통합 비교 작업공간 (2026-10-23)

- Node/Web `tsc`, Electron ESLint, Vitest 21개 파일·173개 테스트, `electron-vite build`가 모두 exit 0이었다.
- native `verify-comparison-workspace-playwright.mjs`가 exit 0이었다. 1480×920과 390×844 viewport에서 다섯 저장 산출물, 파일 전환, 검색·필터, 상·하단 페이지 이동, 수정 전후 전체 JSON과 중첩 변경 강조를 확인했다.
- 왼쪽 파일 목록과 가운데 결과 body의 독립 스크롤, dashboard·버전 리스트 이동 후 결과 유지, 같은 입력 산출물 재사용을 확인했다.
- 한 파일 누락 시 나머지 네 파일 저장과 실패 파일 산출물 부재를 확인했다. 다른 hash 충돌은 승인 전 보존, 취소, 승인 교체를 확인했고 malformed 산출물의 파일별 승인 요구는 Vitest로 확인했다.
- 스크린샷: `screenshots/playwright/electron/comparison-workspace-desktop.png`(1480×920), `screenshots/playwright/electron/comparison-workspace-mobile.png`(390×844 viewport, 실제 full-page PNG 375px 폭).
- 제한: MemoryRouter의 legacy `/compare-results` 직접 진입은 native Electron에서 실행하지 못했다. redirect route 설정과 build만 확인했으므로 요청 전체는 부분 검증이다. 상세 기록은 [통합 비교 작업공간 요청](./REQUESTS/comparison-workspace.md#review)을 따른다.

검증 원칙: 구현과 검증을 구분하고, 근거 없는 항목은 완료로 기록하지 않는다. 실행하지 못한 GUI·외부 호출은 미검증으로 남긴다. 실패와 경고는 다음 조치와 함께 기록한다.

| 범위                                            | 검증 기록                                                                                            |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Phase 00·01 — 앱 기반, 가져오기·변환, 초기 감사 | [Phase00-01](./REVIEW/Phase00-01.md)                                                                 |
| Phase 02 — 작업본·검증 진행 기록                | [Phase02](./REVIEW/Phase02.md)                                                                       |
| Phase 03 — raw JSON 버전 비교                   | [Phase03](./REVIEW/Phase03.md)                                                                       |
| Phase 03~06 설계 및 문서 분리 점검              | [Planning](./REVIEW/Planning.md)                                                                     |
| Main process 구조 재정리 요청                   | [구현 완료·부분 검증](./REQUESTS/main-process-architecture.md#review--구현-완료부분-검증-2026-11-13) |
| 아이콘 의미 정책 요청                           | [현재 UI 범위 검증 완료](./REQUESTS/icon-semantics.md#review)                                        |
| 버전 비교 결과 화면 개선 요청                   | [주요 UI 검증 완료](./REQUESTS/version-comparison-results.md#review)                                 |
| 통합 비교 작업공간 요청                         | [screenshot refinement 검증 완료·legacy route 확인 대기](./REQUESTS/comparison-workspace.md#review)  |
| 화면 헤더·비교 레이아웃 정리 요청               | [검증 완료](./REQUESTS/page-header-layout.md#review)                                                 |

[버전 관리 요청의 부분 검증](./REQUESTS/version-management.md#review): Electron build와 Vitest 20개 파일·157개 테스트가 통과했다. native Electron 데스크톱 1480px·모바일 390px에서 날짜 유무 두 행의 overlay, 위치 불변, hover·focus·Escape와 버튼 SVG label을 검증했다. 폐기 가능한 PostgreSQL DB의 native IPC에서는 Enter 날짜 저장·비우기와 복제·삭제 회귀 검증을 통과한 뒤 임시 DB를 폐기했다. 실제 프로세스 강제 종료 복구·대량 DB 복제·복제본 native validation 및 `ready` 전환은 미검증이다. 기존 Phase 03 완료 기록과 구분한다.

[아이콘 의미 정책 검증](./REQUESTS/icon-semantics.md#review)은 2026-10-15 현재 UI 범위에서 완료했다. build, Vitest 20개 파일·157개 테스트, lint와 native Electron `verify-version-ui`·`verify-diff`가 통과했다. desktop 1480px·mobile 390px의 light·dark에서 아이콘 geometry, hover·focus, select keyboard, 탐색·비교 흐름을 확인했다. 임시 PostgreSQL version-mutations 검증 뒤 DB를 폐기했다. 현재 UI에 없는 외부 링크·새 창, 뒤로가기, swap action은 아이콘 정책만 유지하며 사용 인스턴스 검증을 주장하지 않는다. 버전 관리 요청 상태는 별도로 진행 중이다.

[버전 비교 결과 화면 개선 검증](./REQUESTS/version-comparison-results.md#review)은 2026-10-15 주요 UI 흐름을 통과했으며 일부 오류 경로 검증이 남았다. Electron build와 lint가 exit 0이었고 Vitest 21개 파일·167개 테스트가 통과했다. native Electron `verify-diff-playwright.mjs`는 desktop 1480px·mobile 390px에서 직접 상세 진입의 빈 상태와 `버전 비교로 이동` CTA, 개요의 `전체 결과 자세히`, 상세 검색·필터·10개 단위 페이지 이동·저장, 긴 문서 스크롤 중 control 접근을 확인했다. dashboard와 리스트를 다녀와도 같은 결과가 유지됐고 IPC 비교 호출 counter는 증가하지 않았다. 버전·파일 선택 변경은 결과를 지우며 프로세스 재시작은 메모리를 초기화한다. 저장 결과 조회 실패와 일반 저장 실패의 오류 표시·같은 입력 컨텍스트 결과 유지는 미검증이다. `verify-version-ui-playwright.mjs`도 통과했다. 기존 수동 `View` 라우팅을 유지했고 디스크 영속 상태나 새 dependency를 추가하지 않았다. 기존 Phase 03 완료 상태는 변경하지 않았다.

Phase 02와 Phase 03의 기존 검증은 **완료**했다. Phase 03은 Node/Web typecheck, production build, ESLint, Prettier와 production·React dev StrictMode native Electron Playwright를 통과했다. 독립 검토 보완 뒤 자동 검사는 18 Vitest 파일·124개 테스트, build, Node/Web typecheck와 ESLint를 통과했다. 해당 보완의 native 최종 실행도 통과했다. 현재 DB에 `failed`·test 행이 없어 해당 native 표시는 미검증이다. native script 범위, 다섯 파일 fixture 근거와 대량 성능은 [Phase03](./REVIEW/Phase03.md)에 분리 기록했다. [진행 상태](./GOAL/README.md)를 따른다. 이전 날짜 기록의 `SPEC.md`, `GOAL.md` 등은 당시 파일 이름이다.
