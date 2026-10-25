# Electron renderer App 책임 분리 요청

- 상태: **진행 중 — 구조 변경과 자동 검증 완료, native 화면 검증 미실행**
- 작업일: 2026-10-23
- 범위: `apps/electron/src/renderer/src/`와 승인된 `react-router` 의존성 변경
- 기준: [SPEC §8.1 `APP-001`~`APP-009`](../SPEC/01-foundation.md) · [SPEC §9 `ARC-001`](../SPEC/05-platform-status.md) · [요청 목차](./README.md)
- 기존 Phase 03 완료 상태와 다른 요청의 검증 결과는 이 요청의 완료 근거로 사용하지 않는다.

## 요청 및 수용 계약

1. `App.tsx`는 라우터와 최상위 작업 공간 구성만 담당한다.
2. 라우트 정의와 화면 이동은 `routes/`, 라우트별 화면 조립은 `pages/`, 공통 화면 틀은 `layouts/`에서 관리한다. 기존 기능 화면과 공통 UI는 재사용한다.
3. 업로드 변환, 검증, 버전 변경 작업, 스크린샷과 테마의 상태·이벤트·IPC 흐름을 각 책임 위치로 옮긴다. 기능 전용 코드를 불필요하게 공통 디렉터리로 옮기지 않는다.
4. 기존 화면, 스타일, 버전 선택, 오류·진행 표시, 탐색 대상과 비교 결과의 화면 이동 후 유지 동작을 보존한다. 앱 재시작 시 화면과 비교 결과를 복원하는 새 기능은 추가하지 않는다.
5. Electron Main Process, Preload, 백엔드 API와 데이터 처리 계약은 변경하지 않는다. Renderer는 기존 `window.api` 경계만 사용한다.
6. `react-router` v7은 메모리 라우터로 사용한다. 앱의 URL 표시·deep link 동작은 새로 도입하지 않는다.

<a id="roadmap"></a>

## ROADMAP — 적용 범위와 의존성

1. 기존 `App.tsx`의 화면 상태, 기능 상태, IPC 구독과 화면 렌더링을 분석했다. Phase 03까지 구현된 기능 화면과 [버전 비교 결과 화면 개선 요청](./version-comparison-results.md)의 비교 결과 유지 동작을 선행 계약으로 사용했다.
2. `app/AppWorkspace.tsx`와 `app/WorkspaceContext.ts`에서 기능 상태를 연결하고, `routes/AppRoutes.tsx`·`routes/paths.ts`에 React Router v7 라우트와 화면 경로를 정의했다.
3. `pages/WorkspacePages.tsx`가 기존 기능 화면에 상태와 이벤트를 연결하고, `layouts/WorkspaceLayout.tsx`가 기존 `AppShell`·전역 메시지·중첩 화면을 조립한다. 비교 화면은 레이아웃 안에서 계속 mounted 상태로 두어 결과를 유지한다.
4. 업로드·검증·버전 변경·스크린샷 로직은 각 `features/` 내부로, 테마 상태는 `app/`으로 옮겼다. 이미 있는 `components/`와 `shared/lib/`를 재사용하므로 공통 `hooks/`·`utils/` 디렉터리는 만들지 않았다.
5. Electron 앱의 `package.json`과 lockfile에 `react-router` v7을 추가했다. 다른 앱·공통 패키지의 코드나 GOAL은 변경하지 않는다.

이 요청은 기존 Phase 03 완료에 의존하지만 Phase 04 구현의 선행 완료 조건을 바꾸지 않는다. 이전 [버전 비교 결과 화면 개선 요청](./version-comparison-results.md)의 “수동 `View` 라우팅”과 “라우팅 의존성 없음” 문구는 당시 구현·검증 기록이다. 현재 구현은 이 요청의 메모리 라우터 구성을 따른다.

<a id="goal"></a>

## GOAL — 자동 검증 완료, native 확인 대기

- [x] `App.tsx`에서 기능 상태·이벤트·화면 분기를 분리하고 기존 기능 화면과 공통 UI를 재사용했다.
- [x] 라우트, 페이지 조립, 공통 레이아웃, 기능별 상태·동작의 소유 위치를 구분했다.
- [x] Node/Web TypeScript, Electron ESLint, 변경 파일 Prettier, Vitest와 production build를 통과했다.
- [ ] native Electron에서 대시보드·업로드·리스트·비교 개요·상세·장비·직업·작업 화면 탐색과 비교 결과 유지를 재검증한다.

<a id="review"></a>

## REVIEW — 자동 검증 결과 (2026-10-23)

- Node와 Web TypeScript 검사가 통과했다. 통합 `typecheck` 스크립트는 실행 환경의 pnpm v12와 프로젝트 설정 v10 충돌로 실패했으며, 동일한 두 `tsc` 명령을 직접 실행해 통과했다.
- Electron 전체 ESLint와 변경 파일 Prettier 검사가 통과했다.
- Vitest 21개 파일·167개 테스트와 production `electron-vite build`가 통과했다.
- native Electron의 실제 화면 탐색과 비교 결과 유지 여부는 이번 리팩터링 이후 실행하지 않았다. 자동 검증 통과만으로 이 요청을 완료 처리하지 않는다.
- 요약은 [Electron REVIEW](../REVIEW.md#렌더러-구조-리팩터링-2026-10-23)에도 기록했다. 기존 Phase 03 검증 상태는 변경하지 않는다.
