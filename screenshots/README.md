# Screenshots

스크린샷은 촬영 방식과 대상 애플리케이션 순서로 분류한다.

```text
screenshots/
  manual/
    electron/
  playwright/
    electron/
    frontend/
```

- `manual/electron`: Electron 앱의 버튼 또는 `Ctrl+Shift+S`가 스크롤 전체 페이지를 저장한다. 전체 캡처를 지원하지 않는 환경에서는 `capturePage()`로 현재 viewport를 저장한다.
- `playwright/electron`: Electron Playwright 캡처 스크립트가 저장한다.
- `playwright/frontend`: 프론트엔드 Playwright 도입 시 사용한다.

이미지 산출물은 Git에 커밋하지 않는다.
