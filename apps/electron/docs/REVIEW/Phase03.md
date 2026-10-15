# Phase 03 — raw JSON 버전 비교 검증 기록

## 2026-10-15

### 완료 범위

- `ms_job.json`, `ms_skill.json`, `ms_skillH.json`, `ms_skillCommon.json`, `ms_skillLevel.json`만 비교한다. PVP 파일은 제외한다.
- 파일별 identity로 추가·변경·삭제와 필드별 before/after를 계산한다. 레코드 순서는 무시하고 누락 필드와 `null`은 구분한다.
- Electron main이 버전·파일명·경로·심볼릭 링크를 검증하고, renderer는 IPC로만 비교·저장·재열기를 요청한다.
- 결과는 입력 해시와 함께 저장한다. 같은 입력은 재사용하고 stale·tamper는 거부하며, 명시적 교체와 실패 시 기존 산출물 보존을 처리한다.

### 자동 검사

| 검증             | 결과 | 근거                                                   |
| ---------------- | ---- | ------------------------------------------------------ |
| Vitest           | 통과 | 18개 파일, 124개 테스트                                |
| Node typecheck   | 통과 | `tsc --noEmit -p tsconfig.node.json --composite false` |
| Web typecheck    | 통과 | `tsc --noEmit -p tsconfig.web.json --composite false`  |
| production build | 통과 | `electron-vite build`                                  |
| ESLint           | 통과 | `eslint --cache .`                                     |
| Prettier         | 통과 | Phase03 소유 문서 `prettier --check`                   |

Comparator fixture는 다섯 허용 파일의 identity와 add/modify/delete를 검증한다. 추가 단위 테스트는 앞자리 0·시스템 job ID, 순서 무시, `null`/누락 구분, 중복·누락 identity, PVP·비정상 입력, 경로와 심볼릭 링크 거부를 다룬다. Service 테스트는 hash stale, 동일 입력 재사용, tamper 명시 복구, 명시적 교체와 거부된 교체, 쓰기 실패 시 기존 산출물 보존을 다룬다.

### native Electron Playwright

`pnpm build` 뒤 `node scripts/verify-diff-playwright.mjs`를 실행했다. 임시 production `1.2.419`/`1.2.424` fixture에서 다음을 통과했다.

- `ms_job.json` 추가·변경·삭제, 두 결과 영역, 필드 before/after, 저장·재열기·교체를 확인했다.
- 작은 `ms_skill.json` 변경과 `ms_skillH.json` 빈 결과, 파일 선택 변경 뒤 stale 결과 제거, 누락 파일 오류를 확인했다.
- 원본 production 파일 불변을 확인했다.
- 재검증에서 `ms_skillLevel.json` 173,665개 삭제는 비교 1,690ms, 검색 234ms, 페이지 이동 63ms였고 결과는 10개씩 페이지 처리됐다.
- 1480×920 desktop과 390×844 mobile에서 대시보드, 데이터 업로드, 장비 데이터, 직업 데이터, DB·타입 작업의 선택 버전 유지와 가로 overflow 없음을 확인했다.

native script는 `ms_job.json`, 작은 skill 파일, 대량 `ms_skillLevel.json`만 실제 비교한다. `ms_skillCommon.json`을 포함한 다섯 파일 identity 의미론은 fixture 단위 테스트가 증명한다. 다섯 파일 각각의 native 흐름 전체를 실행했다고 주장하지 않는다. 현재 버전과 파일 선택을 각각 바꾼 뒤 오래된 결과가 사라지는 것을 확인했다.

### 후속 UI·상태 변경 검증

`pnpm build` 뒤 `node scripts/verify-version-ui-playwright.mjs`를 실행했다. script가 읽은 실제 DB에는 `ready`·`importing` production 행이 있었고 `failed`·test 행은 없었다.

- `버전` 부모 sidebar와 `리스트`·`비교` 자식 탐색을 확인했다. 목록은 실제 버전, `releasedOn` 또는 `미등록`, `createdAt`, 환경과 상태를 표시했다.
- 현재 버전은 재실행 뒤 복원됐다. 잘못된 저장값은 유효한 fallback으로 교체됐다.
- 관리 JSON 없는 등록 버전은 목록에 남았다. 관리 파일이 있는 버전에서는 비교 버튼이 활성화됐고, 관리 디렉터리를 제거한 뒤에는 조회가 종료되며 누락 오류를 표시했다.
- SVG stroke와 대시보드 비교 화살표 세로 중앙을 확인했다. 1480×920 desktop과 390×844 mobile에서 select를 포함한 glyph 가시성을 확인했다.
- `verify-diff-playwright.mjs`는 production과 `ELECTRON_RENDERER_URL=http://localhost:5173` React dev StrictMode에서 파일 조회, 비교·저장·재열기를 통과했다. StrictMode에서 `파일 목록 조회 중` 상태가 남지 않았다.
- 대량 `ms_skillLevel.json` 173,665개 삭제는 production에서 비교 1,537ms·검색 199ms·페이지 77ms, dev StrictMode에서 비교 1,669ms·검색 377ms·페이지 60ms였다.

`failed` 제외와 test 환경 표시는 코드·자동 테스트 범위이나, 현재 DB에 해당 행이 없어 native 화면 검증은 미실행이다.

### 독립 검토 보완

- `releasedOn`은 UTC 달력 날짜로 표시하도록 보완했다. `VersionListView.test.tsx`는 Pacific 시간대에서 UTC 자정 날짜가 전날로 밀리지 않는 회귀를 검증한다. static list fixture는 test 환경 행도 다룬다.
- `listComparableRawDataFiles`는 한쪽 버전에만 raw JSON이 있을 때 누락 파일명·기준/비교 버전과 import 안내를 오류로 반환한다. focused service 테스트로 검증했다.
- `pnpm build`, Node/Web typecheck, Vitest 18개 파일·124개 테스트, ESLint를 통과했다.
- 보완 뒤 native Electron 스크립트 두 개를 재실행해 목록 날짜, 재시작 복원, 비교·저장·재열기, 데스크톱·모바일 흐름을 통과했다. 대량 삭제 173,665건은 비교 1,925ms, 검색 231ms, 페이지 이동 75ms였다.

### 상태

Phase 03의 기존 종료 조건과 후속 UI·상태 변경 검증은 충족했다. `failed` native 제외와 test native 표시는 DB 행 부재로 미검증이다. [Phase 04](../GOAL/Phase04.md)는 대기 상태를 유지한다.
