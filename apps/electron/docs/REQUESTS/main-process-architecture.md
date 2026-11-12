# Main process 구조 재정리

> 상태: 다음 작업 최우선 · 설계 완료/구현 대기

이 문서는 Electron Main process의 구조 재정리 제안과 이후 구현 순서를 기록한다. 현재 구조를 설명하는 [아키텍처](../ARCHITECTURE.md)를 대체하지 않으며, 이 제안은 아직 구현되지 않았다. 다음 작업 지시에서는 남은 Phase 04 기능보다 이 구조 재정리를 먼저 수행한다. Phase 02·03 완료와 Phase 04 진행 중·미완료 상태는 유지한다.

## 현재 상태

- `src/main/index.ts`는 현재 1,098줄이다. 설계 수립 시점의 약 1,099줄 규모에서 bootstrap, 창 생성, 공유 실행 상태·헬퍼, 23개 IPC handler를 함께 소유한다.
- `src/main/services/`는 구현과 colocated test를 포함해 34개 파일이 한 단계에 놓여 있다.
- Main → Preload → Renderer 경계와 `src/shared/` 계약은 이미 존재한다. 이번 제안은 이 경계나 공개 API를 바꾸지 않는다.
- 단일 인스턴스 처리, DB 환경 로드, 파일·디렉터리 선택 경로 제한, `unknown` IPC 입력 검증, sender별 취소·정리, 버전 작업 배타 제어가 `index.ts`에 결합돼 있다.
- `version-copy-files.ts`의 `WeakMap`은 준비 객체의 동일성으로 staged/committed 소유 상태를 추적한다. 파일 이동 뒤에도 같은 객체를 commit·rollback에 전달해야 한다.

## 제안 구조와 소유권

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

- `index.ts`는 환경 설정, 단일 인스턴스 lock, app lifecycle, handler 등록과 창 생성 순서만 조립하는 얇은 bootstrap으로 둔다.
- `app/main-window.ts`는 단일 main window 생성, 외부 탐색 차단, 창 이벤트와 screenshot shortcut 전달을 소유한다. screenshot 기능을 직접 import해 순환 의존하지 않고 callback 또는 window getter를 받는다.
- `app/runtime.ts`는 프로세스당 하나의 runtime을 만든다. 선택 파일·디렉터리, conversion·validation `AbortController`, 검증·버전 복사 배타 집합, `versionMutation` 직렬화 상태를 한 인스턴스에 유지한다. IPC 그룹별 상태 복제를 금지한다.
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

- [ ] `index.ts`가 환경·인스턴스·lifecycle·등록·창 생성만 조립하고 기능 구현을 소유하지 않는다.
- [ ] runtime과 main window lifecycle이 프로세스당 단일 소유권을 가지며 재활성화에서도 중복 handler나 상태가 생기지 않는다.
- [ ] 23개 handler의 채널, 입력 검증, 반환·오류, 진행·취소, sender 종료 cleanup이 이전과 같다.
- [ ] version copy `WeakMap` 객체 동일성, version mutation 직렬화, validation/copy 배타성과 모든 경로 안전 조건이 유지된다.
- [ ] Preload·shared·Renderer 공개 경계와 사용자 동작이 바뀌지 않는다.
- [ ] 서비스 이동, IPC 추출, app/window/runtime 분리를 각각 독립 검증한다.

## 검증 계획

각 단계에서 `pnpm --dir apps/electron run typecheck`, `pnpm --dir apps/electron test`, `pnpm --dir apps/electron run lint`, `pnpm --dir apps/electron run build`, Prettier 확인과 `git diff --check`를 실행한다. test 탐색 수와 IPC 채널 목록을 기준선과 비교한다.

Node test와 모의 Chromium 검증은 직업·버전·검증·비교 요청, 오류, 취소와 경로 이동을 확인한다. 실제 Electron smoke에서는 startup·재활성화, preload 연결, conversion·validation 취소, version copy rollback, screenshot shortcut과 packaged path를 확인한다. 브라우저 대체 검증만으로 native IPC 또는 DB 경계를 통과했다고 기록하지 않는다.

현재 문서는 설계만 확정한다. 코드 이동, 기능 완료, native 검증 또는 Phase 04 완료를 선언하지 않는다.
