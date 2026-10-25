# 화면 헤더·비교 레이아웃 정리 요청

- 상태: **완료 (2026-10-25)**
- 범위: Electron renderer의 페이지 헤더와 비교 작업공간 여백·구분선 표시
- 기준: [SPEC `APP-001`·`APP-005`·`APP-006`](../SPEC/01-foundation.md) · [SPEC `DIF-046`](../SPEC/03-diff-edit.md#spec-comparison-workspace) · [요청 목차](./README.md)
- 시각 기준: `screenshots/manual/electron/electron-request-4.png`
- Phase 상태: 기존 Phase 03 완료 상태는 변경하지 않는다.

## 요청 및 수용 계약

1. 대시보드, 데이터 업로드, 장비 데이터, 직업 데이터, DB·타입 작업 화면의 큰 본문 헤더를 제거한다.
2. 버전 리스트의 본문 헤더는 유지한다.
3. 비교 작업공간의 필터 오른쪽 세로 구분선이 보이게 하고 본문 아래 16px 여백을 제거한다.
4. renderer 표시만 다루며 Main Process, Preload, IPC, 데이터 계약과 다른 앱은 변경하지 않는다.

<a id="roadmap"></a>

## ROADMAP — 범위와 의존성

- 기존 공통 페이지 레이아웃과 비교 작업공간의 세 panel 구조를 재사용한다.
- 다섯 화면의 중복 본문 헤더만 제거하고 버전 리스트의 헤더 계층은 보존한다.
- 비교 화면은 필터 경계와 하단 여백만 조정한다. 기존 비교 동작과 Phase 의존성은 바꾸지 않는다.

<a id="goal"></a>

## GOAL — 검증 완료

- [x] 지정된 다섯 화면에서 큰 본문 헤더가 제거되고 버전 리스트 헤더가 유지됨을 캡처로 확인했다.
- [x] 비교 화면의 필터 오른쪽 세로 구분선과 제거된 16px 하단 여백을 native Electron assertion으로 확인했다.
- [x] Node/Web `tsc`, 대상 ESLint·Prettier와 production build가 모두 exit 0이었다.
- [x] native Electron에서 비교 selector·filter, 반응형 dark/light와 navigation assertion이 통과했다.

<a id="review"></a>

## REVIEW — 2026-10-25

- Node/Web `tsc`, 대상 ESLint·Prettier와 `electron-vite build`가 모두 exit 0이었다.
- `xvfb-run -a node scripts/verify-comparison-workspace-playwright.mjs`가 exit 0이었다. selector, filter, 반응형 dark/light와 navigation을 확인했다.
- `xvfb-run -a node scripts/capture-playwright.mjs --all`과 `--all --mobile`이 모두 exit 0이었다. 데스크톱 비교 화면의 구분선·하단 여백을 assertion으로 확인했다. 데스크톱 `screenshots/playwright/electron/2026-10-25T06-51-24-698Z-current-{overview,upload,version-list,compare,equipment,class,operations}.png`와 모바일 `screenshots/playwright/electron/2026-10-25T06-56-08-389Z-current-mobile-{overview,upload,version-list,compare,equipment,class,operations}.png`를 캡처했다.
- `verify-version-ui-playwright.mjs`는 기존 `버전 비교` 제목을 기다리다 timeout(exit 1)이었다. 현재 비교 제목은 `비교`이고, 버전 리스트·비교 이동은 위 두 native 스크립트로 확인했다. 나머지 과거 비교 API 가정은 이번 UI 요청에서 변경하지 않았다.
- 브라우저 도구를 사용할 수 없어 native Electron Playwright로 검증했다. 비교 script assertion과 전체 화면 캡처 외 다른 route의 추가 상호작용은 검증하지 않았다.
