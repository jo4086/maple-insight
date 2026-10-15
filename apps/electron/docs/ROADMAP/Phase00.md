## 5. Phase 0 - 애플리케이션 기반

**상태: 완료**

### 목표

Electron 앱의 보안 경계, 화면 구조, 버전 컨텍스트와 외부 서비스 연결 기반을 마련한다.

### 범위

- Electron, React, Vite, TailwindCSS 구성
- main, preload, renderer 프로세스 경계
- 공통 레이아웃과 화면 탐색
- DB ready/importing 버전 조회
- 현재 버전과 비교 버전 선택
- native file dialog
- Jev SDK와 파일 유형 분류

### 관련 요구사항

- `APP-001` ~ `APP-005`
- `VER-001` ~ `VER-006`
- `IMP-001` ~ `IMP-005`
- `JEV-001` ~ `JEV-006`
- `ARC-001` ~ `ARC-007`
- `SEC-001`, `SEC-002`, `SEC-005`

### 현재 상태

- 애플리케이션 셸과 주요 화면이 구현되어 있다.
- ready/importing 버전 목록과 현재/비교 버전 선택이 연결되어 있다.
- 버전 폴더를 native dialog로 선택하고 하위 CSV를 탐색할 수 있다.
- Jev 파일 유형 분류가 main process에 연결되어 있다.
- 테마 전환과 수동/Playwright 스크린샷 기반이 구현되어 있다.
- 실제 Jev 성공 호출과 Windows 패키징은 운영 검증으로 남아 있다.

### 종료 조건

- [x] Electron 앱의 typecheck, lint, production build 결과가 [REVIEW](../REVIEW.md)에 기록되어 있다.
- [x] 파일 선택과 버전 조회의 정상 및 실패 경로를 검증했다.
- [x] renderer 번들에 DB 및 TypeSafe 비밀값이 포함되지 않음을 검증했다.
- [x] Jev 연결 실패가 파일 선택 기능을 차단하지 않음을 검증했다.
- [x] IPC 입력에 대한 런타임 검증 정책이 정리되어 있다.
