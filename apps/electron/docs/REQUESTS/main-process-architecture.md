# Main process 구조 재정리

> 상태: 구현 완료 · 부분 검증

이 문서는 Electron Main process의 구조 재정리 설계, 구현 결과와 검증 상태를 기록한다. 현재 구조를 설명하는 [아키텍처](../ARCHITECTURE.md)는 이번 요청 범위에서 수정하지 않았다. Phase 02·03 완료와 Phase 04 진행 중·미완료 상태는 유지한다.

## 현재 상태

- `src/main/index.ts`는 60줄의 bootstrap으로 줄었고 환경 설정, 단일 인스턴스 lock, app lifecycle, handler 등록과 창 생성 순서를 조립한다.
- `src/main/app/`은 runtime과 main window lifecycle을, `src/main/ipc/`는 6개 기능 그룹과 통합 등록을 소유한다.
- `src/main/services/`의 구현과 colocated test는 `import`, `validation`, `versions`, `diff`, `jobs`, `workbench` 도메인으로 이동했다.
- Main → Preload → Renderer 경계, `src/shared/` 계약과 공개 channel은 변경하지 않았다.
- 구조 이동과 자동 검증은 완료했다. native Electron 일부 흐름과 mocked Chromium 직업 상호작용은 통과했지만 DB copy/rollback, 실제 conversion·validation 취소, macOS 재활성화와 packaged app은 미검증이다.

## 기준선 (2026-11-13, 변경 전)

### Git과 파일·test inventory

- branch는 `feature/electron-tab-features`이고 `git status --short --branch`는 branch 한 줄만 출력했다. 추적·미추적 변경이 없는 clean 상태였다.
- `src/main/index.ts`는 1,098줄이고 `src/main/services/`는 34개 파일이다. source 17개와 test 17개이며, source/test pair 16개(`class-data-validator`, `data-conversion`, `data-directory-conversion`, `data-validation-runner`, `data-validation`, `data-version-workspace`, `edit-workbench`, `game-data-version-registration`, `job-data`, `raw-data-diff-service`, `raw-data-diff`, `selectable-game-data-version`, `skill-data-validator`, `validation-domain`, `validation-workspace`, `version-copy-files`), source-only `typesafe.ts`, test-only `game-data-version.test.ts`로 구성된다.
- Vitest 탐색 대상은 24개 파일이다. Main service test 17개 외 Renderer test 7개(`CompareResult`, `job-model`, `navigation/model`, `upload/release-date`, `VersionListView`, `version/model`, `error-message`)이며 직접 `index.ts`의 handler 등록을 실행하는 test는 없다.

### IPC handler 23개

아래 반환형은 Main과 Preload의 현재 공개 계약 기준이다. `—`는 별도 취소 경로가 없다는 뜻이다.

| 그룹       | invoke channel                          | 요청                                          | 응답                                                                         | 취소                                                                             |
| ---------- | --------------------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| import     | `data-file:open`                        | 없음                                          | `DataFileInfo \| null`                                                       | —                                                                                |
| import     | `data-directory:open`                   | 없음                                          | `DataDirectoryInfo \| null`                                                  | —                                                                                |
| import     | `data-file:classify`                    | 선택된 `filePath: string`                     | `DataFileClassification`                                                     | —                                                                                |
| import     | `data-file:convert`                     | `DataFileConversionRequest`                   | `DataFileConversionResult`                                                   | `data-file:convert:cancel`; sender+session controller, sender 파괴 시 abort      |
| import     | `data-directory:convert`                | `DataDirectoryConversionRequest`              | `DataDirectoryConversionResult`                                              | 같은 `data-file:convert:cancel`; sender+session controller, sender 파괴 시 abort |
| import     | `data-file:convert:cancel`              | `sessionId: string`                           | `boolean`                                                                    | sender+session의 file/directory conversion을 abort                               |
| validation | `data-validation:run`                   | `DataValidationRequest`                       | `DataValidationRunResult`                                                    | `data-validation:cancel`; sender+session controller, sender 파괴 시 abort        |
| validation | `data-validation:cancel`                | `sessionId: string`                           | `boolean`                                                                    | sender+session validation을 abort                                                |
| validation | `data-validation:warning:update`        | `DataValidationWarningAcknowledgementRequest` | `DataValidationReportUpdate`                                                 | —                                                                                |
| versions   | `data-version:list`                     | 없음                                          | `string[]`                                                                   | —                                                                                |
| versions   | `data-version:list-registered`          | 없음                                          | `RegisteredDataVersion[]`                                                    | —                                                                                |
| versions   | `data-version:update-release-date`      | `UpdateDataVersionReleaseDateRequest`         | `void`                                                                       | —                                                                                |
| versions   | `data-version:copy`                     | `CopyDataVersionRequest`                      | `void`                                                                       | —                                                                                |
| versions   | `data-version:delete`                   | `DeleteDataVersionRequest`                    | `void`                                                                       | —                                                                                |
| diff       | `raw-data-diff:list-comparable-files`   | `ListComparableFilesRequest`                  | `string[]`                                                                   | —                                                                                |
| diff       | `raw-data-diff:compare`                 | `CompareRawDataRequest`                       | `RawDataComparison`                                                          | —                                                                                |
| diff       | `raw-data-diff:save`                    | `SaveRawDataDiffRequest`                      | `{ status: 'created' \| 'reused' \| 'replaced'; result: RawDataComparison }` | —                                                                                |
| diff       | `raw-data-diff:open`                    | `CompareRawDataRequest`                       | `RawDataComparison \| null`                                                  | —                                                                                |
| jobs       | `job-data:list`                         | `version: string`                             | `JobDataSnapshot`                                                            | —                                                                                |
| jobs       | `job-data:draft-recovery:preview`       | `version: string`                             | `JobDraftRecoveryPreview`                                                    | —                                                                                |
| jobs       | `job-data:draft-recovery:copy-selected` | `CopySelectedJobDraftRecoveryRequest`         | `CopySelectedJobDraftRecoveryResult`                                         | —                                                                                |
| jobs       | `job-data:draft:save`                   | `SaveJobDraftRequest`                         | `JobDraft`                                                                   | —                                                                                |
| screenshot | `screenshot:capture`                    | 없음                                          | `ScreenshotCaptureResult`                                                    | —                                                                                |

진행·알림은 handler 수에 포함하지 않는 Main → Renderer event 4개다: `data-file:convert:progress`, `data-directory:convert:progress`, `data-validation:progress`, `screenshot:captured`.

### 기준 검증

코드·문서 수정 전에 실행했다.

- `pnpm --dir apps/electron run typecheck`: exit 0. Node/Web `tsc --noEmit` 통과.
- `pnpm --dir apps/electron test`: exit 0. test file 24개, test 272개 모두 통과.
- `pnpm --dir apps/electron run lint`: exit 0.
- `pnpm --dir apps/electron run build`: exit 0. Main 20 modules, preload 1 module, Renderer 1,994 modules build 통과.
- `pnpm --dir apps/electron exec prettier --check "src/main/**/*.ts" "src/preload/**/*.{ts,d.ts}" "src/shared/**/*.ts" "docs/REQUESTS/main-process-architecture.md"`: exit 1. 기존 14개 파일(`data-conversion{,.test}.ts`, `data-directory-conversion{,.test}.ts`, `data-version-workspace{,.test}.ts`, `game-data-version-registration{,.test}.ts`, `game-data-version.test.ts`, `typesafe.ts`, `validation-domain.ts`, `shared/data-import.ts`, `shared/data-validation.ts`, `shared/screenshot.ts`)의 style issue를 보고했다.
- `git diff --check`: exit 0.

이 기준선은 구조 이동 전 비교 자료이며 구현·native Electron·실제 DB 검증 결과가 아니다.

## 구현 구조와 소유권

```text
src/main/
  index.ts
  app/
    main-window.ts
    runtime.ts
  ipc/
    register.ts
    data-import.ts
    validation.ts
    data-versions.ts
    raw-data-diff.ts
    job-data.ts
    screenshot.ts
  services/
    import/
    validation/
    versions/
    diff/
    jobs/
    workbench/
```

- `index.ts`는 환경 설정, 단일 인스턴스 lock, app lifecycle, handler 등록과 창 생성 순서만 조립하는 얇은 bootstrap이다.
- `app/main-window.ts`는 단일 main window 생성, 외부 탐색 차단, 창 이벤트와 screenshot shortcut 전달을 소유한다. screenshot 기능을 직접 import해 순환 의존하지 않고 callback과 window getter를 받는다.
- `app/runtime.ts`는 프로세스당 하나의 runtime을 만든다. 선택 파일·디렉터리, conversion·validation `AbortController`, 검증·버전 복사 배타 집합, `versionMutation` 직렬화 상태를 한 인스턴스에 유지한다.
- `ipc/register.ts`는 기능별 `register...Handlers(context)`를 호출하고 해제 경계를 제공한다. import만으로 handler, app event, 창 생성 또는 설정 쓰기가 발생하지 않는다.
- IPC는 `import`, `validation`, `versions`, `diff`, `jobs`, `screenshot` 그룹으로 나눈다. 기존 채널 이름, 요청·응답, 오류, 진행 이벤트와 취소 의미는 그대로 유지한다.
- 서비스는 `import`, `validation`, `versions`, `diff`, `jobs`, `workbench` 도메인으로 이동한다. 구현과 test는 함께 두고 Electron IPC·창·`index.ts`를 import하지 않는다.
- `preload/index.ts`, `preload/index.d.ts`, `src/shared/`, `renderer/`의 위치와 책임은 바꾸지 않는다. 새 barrel, 범용 `utils/`, 의존성 주입 프레임워크를 만들지 않는다.

## 보존할 경계와 안전 조건

- 모든 IPC 입력은 `unknown`에서 런타임 검증한 뒤 서비스에 전달한다. 버전 형식, environment 조회, ID·hash, 확인값과 허용 필드를 기존과 같게 검사한다.
- native dialog에서 선택한 파일·디렉터리만 후속 import에 사용한다. 관리 경로는 `resolve` 후 허용 root 내부인지 확인하고 절대 경로·상위 경로 탈출과 symlink 우회를 허용하지 않는다.
- conversion·validation은 sender와 session별 controller를 유지한다. renderer 파괴 시 abort하고 `finally`에서 controller, listener와 버전 배타 상태를 정리한다.
- validation과 version copy의 버전 단위 배타성, `versionMutation`의 직렬화 범위, directory conversion의 staging·rollback, version copy의 DB·파일 rollback 순서를 변경하지 않는다.
- `prepareVersionCopyFiles`가 반환한 객체는 같은 참조로 commit 또는 rollback한다. `WeakMap` 상태를 복사 가능한 값이나 새 객체로 바꾸지 않는다.
- channel 문자열 공통화는 이번 이동 범위가 아니다. 필요성이 별도로 확인되면 Electron 비의존 상수만 `src/shared/ipc-channels.ts`에서 검토한다.

## startup 순서

1. DB module을 정적 import하기 전에 환경 설정을 로드한다.
2. 단일 인스턴스 lock을 얻지 못하면 즉시 종료한다. 두 번째 인스턴스는 기존 main window를 복원하고 focus한다.
3. 프로세스당 runtime 하나를 생성한다.
4. `app.whenReady()`에서 app 설정과 window shortcut 감시를 등록한다.
5. 전체 IPC handler를 등록한 뒤 main window를 만든다. 첫 Renderer 요청보다 handler 등록이 먼저 끝나야 한다.
6. macOS `activate`에서 창이 없을 때 같은 window factory로 다시 만든다. 마지막 창 종료 동작은 현재 플랫폼 규칙을 유지한다.

## Roadmap

1. **문서와 기준선 고정:** 현재 파일 목록, IPC 채널·요청·응답·취소 매트릭스, 미커밋 변경과 기준 검증 결과를 기록한다.
2. **서비스 이동:** `services/{import,validation,versions,diff,jobs,workbench}`로 구현과 test만 이동한다. `index.ts` 동작은 바꾸지 않으며 `jobs → workbench`와 validator 의존 방향을 유지한다.
3. **IPC 추출:** jobs·diff, versions, validation·import·cancellation, screenshot 순서로 handler를 옮긴다. 각 단계에서 channel, 검증, 오류, 진행, cleanup과 rollback을 이전 전과 대조한다.
4. **app/window/runtime 분리:** 단일 runtime과 window factory를 만든 뒤 `index.ts`를 bootstrap 조립만 남도록 줄인다. 환경 로드와 handler 등록의 startup 순서를 다시 확인한다.
5. `edit-workbench.ts`와 `job-data.ts` 내부 분리는 이 작업에 포함하지 않는다. 별도 설계와 검증이 승인될 때만 수행한다.

각 단계는 독립적으로 검증하고 다음 단계로 진행한다. 서비스 이동과 handler 추출, 내부 대형 서비스 분리를 한 번에 수행하지 않는다.

## Goal

- [x] `index.ts`가 환경·인스턴스·lifecycle·등록·창 생성만 조립하고 기능 구현을 소유하지 않는다.
- [ ] runtime과 main window lifecycle이 프로세스당 단일 소유권을 가지며 재활성화에서도 중복 handler나 상태가 생기지 않는다.
- [ ] 23개 handler의 채널, 입력 검증, 반환·오류, 진행·취소, sender 종료 cleanup이 이전과 같다.
- [ ] version copy `WeakMap` 객체 동일성, version mutation 직렬화, validation/copy 배타성과 모든 경로 안전 조건이 유지된다.
- [ ] Preload·shared·Renderer 공개 경계와 사용자 동작이 바뀌지 않는다.
- [x] 서비스 이동, IPC 추출, app/window/runtime 분리를 각각 독립 검증한다.

첫 번째 항목은 60줄 bootstrap 구조와 최종 자동 검사로 확인했다. 마지막 항목은 Stage 2~4의 단계별 검사로 확인했다. 나머지는 일부 근거가 있지만 macOS 재활성화, 실제 취소·sender 종료 cleanup, DB rollback·배타성·경로 안전 조건과 전체 사용자 동작을 끝까지 검증하지 않아 완료 처리하지 않는다.

## Review — 구현 완료·부분 검증 (2026-11-13)

### 단계별 자동 검사

- **기준선:** typecheck, test(24개 파일·272개 테스트), lint, build와 `git diff --check`가 모두 exit 0이었다. Main·Preload·shared·요청 문서를 포함한 broad Prettier는 구조 변경 전부터 있던 14개 파일의 style issue로 exit 1이었다.
- **Stage 2 — 서비스 이동:** typecheck, test(24개 파일·272개 테스트), lint, build와 `git diff --check`가 모두 exit 0이었다. 이동된 경로 기준 broad Prettier에는 기존 style issue 11개가 남았다.
- **Stage 3 — IPC 추출:** 네 중간 지점마다 typecheck와 test가 통과했다. 최종 lint, build, 변경 범위 Prettier와 `git diff --check`는 exit 0이었다. 이 단계 lint는 exit 0이지만 warning 10개를 보고했고 Stage 4에서 수정했다.
- **Stage 4 — app/window/runtime 분리:** 전체 typecheck, test(24개 파일·272개 테스트), lint, build, 변경 범위 Prettier와 `git diff --check`가 모두 exit 0이었다.
- 독립 channel 대조에서 channel 상수 27개와 unique invoke handler 23개가 변경 전과 같았다.

### UI와 native 확인

- inline Playwright native Electron smoke는 exit 0이었다. startup, preload 연결, 잘못된 입력 guard 3개, 존재하지 않는 session 취소, screenshot IPC, dashboard/upload navigation을 확인했다.
- mocked browser 직업 상호작용은 desktop과 mobile에서 통과했다.
- 기존 `capture-playwright.mjs --all`은 exit 1이었다. overview, upload, version-list, compare, equipment screenshot까지 저장한 뒤 class 화면의 `aria-current=page`를 기다리는 `waitForFunction`에서 timeout이 발생했다. 원인은 navigation selector가 accordion인 `직업 데이터`에 `aria-current=page`를 기대한 불일치다. 실제 상태는 `직업 데이터`가 `aria-expanded=true`·`aria-current=null`이고 child `직업 정보`가 `aria-current=page`다.
- 후속 inline native Playwright는 `직업 데이터` accordion을 연 뒤 `직업 정보` child를 클릭하고 operations까지 이동해 각 실제 route의 `aria-current=page`를 확인했으며 exit 0이었다. class·operations 실제 route 상호작용은 검증했지만 capture 이미지는 완료되지 않았다. screenshot script 코드는 변경하지 않았다.

### 미검증 범위

- credential-backed DB copy/rollback
- 실제 conversion·validation cancellation과 sender 종료 cleanup
- macOS `activate` 재생성과 중복 handler·runtime 상태 부재
- packaged app smoke와 packaged path
- version copy `WeakMap` 객체 동일성, version mutation 직렬화, validation/copy 배타성과 모든 경로 안전 조건의 실제 경계 검증

따라서 구조 구현은 완료했지만 요청 검증은 부분 완료다. Phase 04는 계속 진행 중이며 이 요청 결과만으로 Phase 04 완료나 미검증 안전 조건 충족을 선언하지 않는다.
