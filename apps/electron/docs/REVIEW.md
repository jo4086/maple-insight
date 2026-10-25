# Maple Insight Data Studio Review

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

| 범위                                            | 검증 기록                                                                                           |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Phase 00·01 — 앱 기반, 가져오기·변환, 초기 감사 | [Phase00-01](./REVIEW/Phase00-01.md)                                                                |
| Phase 02 — 작업본·검증 진행 기록                | [Phase02](./REVIEW/Phase02.md)                                                                      |
| Phase 03 — raw JSON 버전 비교                   | [Phase03](./REVIEW/Phase03.md)                                                                      |
| Phase 03~06 설계 및 문서 분리 점검              | [Planning](./REVIEW/Planning.md)                                                                    |
| 아이콘 의미 정책 요청                           | [현재 UI 범위 검증 완료](./REQUESTS/icon-semantics.md#review)                                       |
| 버전 비교 결과 화면 개선 요청                   | [주요 UI 검증 완료](./REQUESTS/version-comparison-results.md#review)                                |
| 통합 비교 작업공간 요청                         | [screenshot refinement 검증 완료·legacy route 확인 대기](./REQUESTS/comparison-workspace.md#review) |
| 화면 헤더·비교 레이아웃 정리 요청               | [검증 완료](./REQUESTS/page-header-layout.md#review)                                                |

[버전 관리 요청의 부분 검증](./REQUESTS/version-management.md#review): Electron build와 Vitest 20개 파일·157개 테스트가 통과했다. native Electron 데스크톱 1480px·모바일 390px에서 날짜 유무 두 행의 overlay, 위치 불변, hover·focus·Escape와 버튼 SVG label을 검증했다. 폐기 가능한 PostgreSQL DB의 native IPC에서는 Enter 날짜 저장·비우기와 복제·삭제 회귀 검증을 통과한 뒤 임시 DB를 폐기했다. 실제 프로세스 강제 종료 복구·대량 DB 복제·복제본 native validation 및 `ready` 전환은 미검증이다. 기존 Phase 03 완료 기록과 구분한다.

[아이콘 의미 정책 검증](./REQUESTS/icon-semantics.md#review)은 2026-10-15 현재 UI 범위에서 완료했다. build, Vitest 20개 파일·157개 테스트, lint와 native Electron `verify-version-ui`·`verify-diff`가 통과했다. desktop 1480px·mobile 390px의 light·dark에서 아이콘 geometry, hover·focus, select keyboard, 탐색·비교 흐름을 확인했다. 임시 PostgreSQL version-mutations 검증 뒤 DB를 폐기했다. 현재 UI에 없는 외부 링크·새 창, 뒤로가기, swap action은 아이콘 정책만 유지하며 사용 인스턴스 검증을 주장하지 않는다. 버전 관리 요청 상태는 별도로 진행 중이다.

[버전 비교 결과 화면 개선 검증](./REQUESTS/version-comparison-results.md#review)은 2026-10-15 주요 UI 흐름을 통과했으며 일부 오류 경로 검증이 남았다. Electron build와 lint가 exit 0이었고 Vitest 21개 파일·167개 테스트가 통과했다. native Electron `verify-diff-playwright.mjs`는 desktop 1480px·mobile 390px에서 직접 상세 진입의 빈 상태와 `버전 비교로 이동` CTA, 개요의 `전체 결과 자세히`, 상세 검색·필터·10개 단위 페이지 이동·저장, 긴 문서 스크롤 중 control 접근을 확인했다. dashboard와 리스트를 다녀와도 같은 결과가 유지됐고 IPC 비교 호출 counter는 증가하지 않았다. 버전·파일 선택 변경은 결과를 지우며 프로세스 재시작은 메모리를 초기화한다. 저장 결과 조회 실패와 일반 저장 실패의 오류 표시·같은 입력 컨텍스트 결과 유지는 미검증이다. `verify-version-ui-playwright.mjs`도 통과했다. 기존 수동 `View` 라우팅을 유지했고 디스크 영속 상태나 새 dependency를 추가하지 않았다. 기존 Phase 03 완료 상태는 변경하지 않았다.

Phase 02와 Phase 03의 기존 검증은 **완료**했다. Phase 03은 Node/Web typecheck, production build, ESLint, Prettier와 production·React dev StrictMode native Electron Playwright를 통과했다. 독립 검토 보완 뒤 자동 검사는 18 Vitest 파일·124개 테스트, build, Node/Web typecheck와 ESLint를 통과했다. 해당 보완의 native 최종 실행도 통과했다. 현재 DB에 `failed`·test 행이 없어 해당 native 표시는 미검증이다. native script 범위, 다섯 파일 fixture 근거와 대량 성능은 [Phase03](./REVIEW/Phase03.md)에 분리 기록했다. [진행 상태](./GOAL/README.md)를 따른다. 이전 날짜 기록의 `SPEC.md`, `GOAL.md` 등은 당시 파일 이름이다.
