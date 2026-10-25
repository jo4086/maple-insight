# 통합 비교 작업공간 요청

- 상태: **2026-10-24 screenshot refinement 검증 완료 (legacy route 확인 대기)**
- 범위: Electron의 두 버전 간 초기 다섯 raw JSON 비교·검토·저장 작업공간
- 기준: [SPEC §8.6 `DIF-032`~`DIF-053`](../SPEC/03-diff-edit.md#spec-comparison-workspace) · [요청 목차](./README.md)
- 대체 관계: 별도 개요·상세 화면을 정의한 `DIF-020`~`DIF-031`과 [이전 요청](./version-comparison-results.md)을 이 요청으로 대체한다. 이전 문서와 검증 기록은 이력으로 유지한다.
- Phase 상태: 기존 Phase 03 완료 상태는 변경하지 않는다. 이 요청의 수용 검증은 별도로 기록한다.

## 요청 및 수용 계약

1. `/compare`는 전역 상단의 현재 버전(`compareVersion`)을 사용하고, 작업공간에서는 기준 버전(`baseVersion`)과 파일만 선택해 결과를 검토한다. 별도 개요·상세 화면을 오가지 않는다. 기준 버전과 파일의 초기값은 미선택이다.
2. 사용자는 전역 현재 버전과 작업공간 기준 버전을 선택하고 `ms_job.json`, `ms_skill.json`, `ms_skillH.json`, `ms_skillCommon.json`, `ms_skillLevel.json`을 한 번의 동작으로 비교·저장한다. 파일은 순차 처리하며 기존 파일별 compare/open/save IPC만 사용한다. 새 batch IPC는 추가하지 않는다.
3. **2026-10-24 refinement로 표시 방식 대체됨:** 다섯 파일의 상태·건수를 동시에 나열한 고정 카드 목록은 사용하지 않는다. dropdown은 파일명만 표시하고 추가·수정·삭제 건수는 선택 파일에만 표시한다. 실패한 파일을 선택하면 오류 원인과 해당 파일의 동작을 개별 표시한다. 한 파일의 오류는 다른 파일 처리를 중단하거나 성공 결과를 지우지 않는다.
4. 비교에 성공한 파일만 저장한다. 같은 입력 hash의 유효한 기존 산출물은 기존 정책대로 덮어쓰기나 확인 없이 재사용한다. 입력 hash가 다르거나 기존 산출물이 malformed이면 해당 파일만 교체 승인을 요구한다. 취소하거나 저장이 실패하면 기존 산출물을 보존한다.
5. **2026-10-24 refinement로 대체됨:** 왼쪽 고정 파일 카드 목록과 가운데 하단 pager를 요구한 이전 배치는 사용하지 않는다.
6. **2026-10-24 field-row refinement, 최신 screenshot refinement로 대체됨:** 결과 영역은 추가·수정·삭제 필터, 검색과 상단 페이지 이동만 제공한다. 추가·삭제는 기존과 같이 전체 JSON 레코드를 표시한다. 모든 파일의 수정 레코드를 같은 카드에서 변경 필드와 필드별 이전·이후 값만 표시한 계약은 과거 구현·검증 이력으로 유지한다.
7. 버전 변경이나 새 전체 실행은 이전 작업을 현재 결과처럼 남기지 않는다. 비동기 응답과 저장 요청은 버전·파일·입력 hash가 현재 작업과 일치할 때만 반영한다.
8. 기존 `/compare-results` 진입은 `/compare`로 redirect한다. 별도 결과 상태를 복원하거나 새 비교를 실행하지 않는다.
9. 데스크톱과 모바일 폭에서 다섯 파일 batch 상태, 파일 전환, 추가·삭제 전체 JSON, 수정 전후 JSON, 검색·페이지 이동, 재시도·저장·교체 확인에 접근할 수 있어야 한다. 수정 전후 box는 좁은 폭에서 세로로 쌓고 상태와 변경 강조는 색상만으로 구분하지 않는다.
10. 파일 선택은 파일명만 표시하는 단일 dropdown으로 제공한다. 유효한 기준 버전·파일 선택에 저장 결과가 있으면 자동으로 연다. 선택이 바뀌면 stale 결과, 변경 유형 필터, 검색어와 page를 지운다. 저장 결과가 없으면 빈 상태를 유지하고 비교나 저장을 자동 실행하지 않는다.
11. 본문은 얇은 divider로 구분한 왼쪽·가운데·오른쪽 세 panel이다. 가운데 결과 panel은 더 넓은 flexible grid column으로 두고, 오른쪽 panel은 제목만 표시한 빈 영역으로 둔다. pager는 결과 상단에만 둔다.
12. 저장 결과 자동 열기에 성공했다는 notice는 표시하지 않는다. 저장 결과 조회 실패를 포함한 오류 표시는 유지한다.
13. **2026-10-24 field-row refinement 이력:** 수정 레코드의 renderer 표시만 바꾸고 legacy·신규 diff 산출물의 저장 형식, 선택적 전체 snapshot, identity, 비교 알고리즘과 저장 정책은 변경하지 않았다.
14. 최신 기준은 `screenshots/manual/electron/electron-request-3.png`이다. 모든 수정 카드는 `수정` label을 가진 얇은 outline의 단일 container 안에 이전·이후 JSON box 두 개를 나란히 표시하고, 변경된 값은 각 box에서 강조한다.
15. 저장 산출물에 전체 `before`·`after` snapshot이 있으면 각 JSON box에 변경되지 않은 필드를 포함한 전체 snapshot을 표시한다.
16. 전체 snapshot이 없는 legacy 산출물도 같은 두 box 형상을 사용한다. 각 box에는 산출물에서 확인 가능한 최선의 identity와 변경 필드의 해당 시점 값만 표시하며, 사용할 수 없는 변경되지 않은 필드를 추정하거나 생성하지 않는다.
17. 좁은 폭에서는 이전·이후 JSON box를 세로로 쌓는다. 이 refinement는 renderer 표시만 변경하며 비교 알고리즘, diff 저장 형식, 선택적 snapshot 계약, identity, 입력 hash와 저장·충돌 정책은 변경하지 않는다.

<a id="roadmap"></a>

## 범위와 의존성

- 기존 raw diff 계산, 파일별 identity, 경로·심볼릭 링크 검증, 입력 hash, 원본 불변과 저장 충돌 정책을 재사용한다. 후속 refinement에서도 산출물 형식과 비교 알고리즘은 변경하지 않는다.
- renderer가 기존 `compareRawData`, `openRawDataDiff`, `saveRawDataDiff` IPC를 파일별로 조합한다. main/preload batch IPC와 새 상태 관리 dependency는 추가하지 않는다.
- renderer의 비교 상태와 route를 통합하고 `/compare-results` 호환 redirect를 둔다.
- 전역 현재 버전 선택을 재사용한다. 작업공간의 기준 버전·파일 선택과 저장 결과 자동 열기는 비교·저장 실행과 분리한다.
- `ms_skillPVPCommon.json`, 장비 비교, raw JSON 편집, DB publish, 다른 앱 변경은 범위 밖이다.
- 이전 요청의 검증이나 Phase 03 완료 기록을 이 요청의 완료 근거로 재사용하지 않는다.

<a id="goal"></a>

## 수용 체크리스트 — screenshot refinement 검증 완료

- [x] 두 버전 선택 한 번으로 다섯 파일을 순차 비교·저장하고 파일별 상태·건수·오류를 확인했다.
- [x] 일부 파일 실패 시 나머지 파일의 저장 결과가 유지되고 실패 파일 산출물이 생성되지 않음을 확인했다.
- [x] 다섯 저장 산출물과 파일 전환, 필터·검색, 당시 상·하단 페이지 이동을 확인했다. 이 항목의 하단 pager와 고정 파일 카드 목록은 2026-10-24 refinement 이전 이력이다.
- [x] 같은 입력 산출물 재사용, 다른 hash의 파일별 충돌·취소·승인 교체를 확인했다. malformed 산출물의 승인 요구는 자동 테스트로 확인했다.
- [x] 추가·삭제 전체 JSON과 수정 전후 전체 JSON, 중첩 변경 강조와 변경되지 않은 문맥 보존을 확인했다.
- [x] 데스크톱 독립 스크롤, 모바일 접근성과 전역 가로 overflow 부재, dashboard·리스트 이동 후 결과 유지를 확인했다.
- [x] Node/Web TypeScript, Electron ESLint, Vitest 21개 파일·173개 테스트, production build가 통과했다.
- [ ] `/compare-results` redirect는 route 설정과 build로 확인했지만 MemoryRouter의 직접 native 진입은 실행하지 못했다.

### 2026-10-24 screenshot refinement 수용 — 검증 완료

- [x] 모든 수정 카드가 `수정` label과 얇은 outline의 단일 container 안에서 이전·이후 JSON box 두 개를 표시함을 확인했다.
- [x] 전체 snapshot 산출물에서 변경되지 않은 필드를 포함한 before·after 전체 JSON이 보이고 중첩된 변경 leaf 값만 강조되며, 변경되지 않은 값은 중립 표시됨을 확인했다.
- [x] 전체 snapshot이 없는 legacy 산출물도 같은 두 box 형상으로 확인 가능한 최선의 identity와 변경 필드별 이전·이후 값을 표시하며, 사용할 수 없는 필드를 생성하지 않음을 확인했다.
- [x] 데스크톱 1480×920에서는 두 JSON box가 나란히 배치되고 모바일 390px 폭에서는 세로로 쌓이며, 긴 값과 중첩 값에 접근할 수 있음을 확인했다.
- [x] 추가·삭제 카드 표시가 유지되고 main·IPC·storage, 비교 알고리즘, diff 저장 형식, 선택적 snapshot, identity, 입력 hash와 저장·충돌 정책에 변경이 없음을 확인했다.
- [x] Node/Web TypeScript, 전체 Electron ESLint, Prettier, Vitest 21개 파일·182개 테스트와 `electron-vite` production build가 모두 exit 0이었고, native Electron Playwright desktop·mobile 표시도 exit 0으로 확인했다.

### 2026-10-24 후속 refinement 수용 — 검증 완료

- [x] 다섯 파일 모두에서 수정 레코드가 legacy·신규 산출물의 선택적 전체 snapshot 유무와 무관하게 같은 카드로 표시되는지 확인했다.
- [x] 수정 카드가 원본 identity와 변경 필드별 이전·이후 값을 표시하고, 추가·삭제 카드가 기존 전체 레코드 표시를 유지하는지 확인했다.
- [x] 저장 결과 자동 열기 성공 notice `저장된 비교 결과를 열었습니다.`는 표시되지 않고 조회 실패 등 오류 표시는 유지되는지 확인했다.
- [x] diff 저장 형식, identity, 비교 알고리즘과 저장 정책에 변경이 없고 main·IPC·storage를 수정하지 않았음을 확인했다.
- [x] Node/Web TypeScript, Electron ESLint, Prettier, Vitest 21개 파일·180개 테스트, production build와 native Electron Playwright를 실행해 모두 exit 0을 확인했다.

원인은 파일명별 예외가 아니라 renderer가 선택적 `before`·`after` snapshot과 legacy 변경 필드에 따라 표시를 분기한 것이었다. 분기를 통합해 모든 수정 카드를 필드 중심으로 표시하며 원본 identity를 유지한다.

### 2026-10-24 이전 refinement 수용 — 검증 완료

- [x] 상단 전역 현재 버전만 사용하고 기준 버전·파일이 미선택으로 시작하며 batch가 비활성화됨을 확인했다.
- [x] 파일명 전용 dropdown, 저장 결과 자동 열기와 저장 결과가 없을 때 빈 상태를 확인했다.
- [x] 선택 변경 시 결과·필터·검색어·page 초기화와 지연 응답 race 차단을 확인했다.
- [x] 다섯 파일 batch와 충돌 처리를 확인했다. 파일을 전환해도 충돌 상태가 유지되고 지연된 교체 완료 뒤 Cancel이 숨겨짐을 확인했다.
- [x] 얇은 divider의 세 panel, 넓은 가운데 flexible grid column, 제목만 있는 빈 오른쪽 panel과 상단 pager만 표시됨을 desktop/mobile screenshot과 dark/light에서 확인했다.

<a id="review"></a>

## REVIEW — 2026-10-24 screenshot refinement 검증

- `electron-request-3.png` 기준대로 모든 수정 카드가 단일 outline container와 반응형 before·after JSON box 두 개를 표시했다. 전체 snapshot에서는 변경되지 않은 문맥을 모두 유지하고 중첩된 변경 leaf 값만 강조했으며, 그 밖의 값은 중립 표시했다.
- snapshot이 없는 legacy 산출물은 확인 가능한 최선의 identity와 변경 필드별 이전·이후 값만 같은 두 box에 표시했다. 추가·삭제 카드 표시는 바뀌지 않았다.
- main·IPC·storage, 비교 알고리즘, diff 저장 형식, 선택적 snapshot, identity, 입력 hash와 저장·충돌 정책은 변경하지 않았다.
- Node/Web TypeScript, 전체 Electron ESLint, Prettier, Vitest 21개 파일·182개 테스트와 `electron-vite` production build가 모두 exit 0이었다.
- native `verify-comparison-workspace-playwright.mjs`가 exit 0이었다. desktop 1480×920에서 두 box의 가로 배치, mobile 390px 폭에서 세로 배치를 확인했다.
- 스크린샷: `screenshots/playwright/electron/comparison-workspace-desktop.png`, `screenshots/playwright/electron/comparison-workspace-mobile.png`.
- 아래 field-row 형식과 이전 refinement 검증은 당시 이력으로 유지한다. MemoryRouter의 legacy `/compare-results` 직접 native 진입 제한도 그대로다.

## REVIEW — 2026-10-24 후속 refinement 검증

- Node/Web TypeScript, Electron ESLint, Prettier, Vitest 21개 파일·180개 테스트와 production build가 모두 exit 0이었다.
- native `verify-comparison-workspace-playwright.mjs`가 exit 0이었다. `ms_job.json`과 `ms_skill.json`의 수정 카드에서 원본 identity, 변경 필드와 필드별 이전·이후 값을 확인했다. 추가·삭제 전체 레코드, 변경 유형 필터, 검색과 상단 페이지 이동도 확인했다.
- 저장 결과 자동 열기 성공 notice `저장된 비교 결과를 열었습니다.`가 표시되지 않고 조회 실패 오류와 저장 충돌 표시는 유지됨을 확인했다.
- 원인은 파일명별 처리가 아니라 선택적 `before`·`after` snapshot과 legacy 변경 필드에 따른 renderer 분기였다. 모든 수정 카드를 필드 중심으로 통합했으며 main·IPC·storage, diff 저장 형식, identity, 비교 알고리즘과 저장 정책은 변경하지 않았다.
- 스크린샷: `screenshots/playwright/electron/comparison-workspace-desktop.png`.
- 아래 2026-10-24 이전 refinement와 2026-10-23의 수정 전후 전체 JSON 검증은 당시 이력으로 유지한다. MemoryRouter의 legacy `/compare-results` 직접 native 진입 제한도 그대로다.

## REVIEW — 2026-10-24 이전 refinement 검증

- Node/Web `tsc`, 전체 Electron ESLint, Prettier, Vitest 21개 파일·178개 테스트와 production build가 모두 exit 0이었다.
- native script가 exit 0이었다. 초기 기준 버전·파일 dropdown 미선택과 batch 비활성화, 저장 결과 자동 열기, 선택 변경 초기화, 저장 결과 없음, 지연 응답 race 차단을 확인했다.
- desktop/mobile screenshot과 dark/light를 확인했다. 다섯 파일 batch와 충돌 처리, 파일 전환 뒤 충돌 유지, 지연된 교체 완료 뒤 Cancel 숨김을 확인했다.
- 이 기록은 2026-10-24 이전 refinement 범위다. 후속 수정 카드·notice refinement의 검증 근거로 사용하지 않는다. 아래 2026-10-23 검증과 기존 Phase 03 이력은 변경하지 않는다. legacy `/compare-results` 직접 native 진입만 미검증이며 당시 UI 변경 범위 밖이다.

## REVIEW — 부분 검증 (2026-10-23)

- Node/Web `tsc`, Electron ESLint, Vitest 21개 파일·173개 테스트, `electron-vite build`가 모두 exit 0이었다.
- native `verify-comparison-workspace-playwright.mjs`가 exit 0이었다. 1480×920과 390×844 viewport에서 실행했으며 모바일 full-page PNG의 실제 출력 폭은 375px이다.
- 다섯 산출물의 버전·파일명·입력 hash, 파일 전환, 검색, 필터와 상·하단 페이지 이동, 수정 전후 전체 JSON과 중첩 변경 강조를 확인했다.
- 왼쪽 파일 목록과 가운데 결과 body의 독립 스크롤, 모바일 전역 가로 overflow 부재를 확인했다. 오른쪽 예약 영역도 표시됐다.
- 한 파일 누락 시 네 파일 성공·누락 파일 실패와 산출물 부재, 같은 입력 산출물 재사용, 다른 hash 충돌의 승인 전 보존·취소·승인 교체를 확인했다. malformed 산출물은 Vitest에서 파일별 승인 요구와 자동 저장 미호출을 확인했다.
- dashboard와 버전 리스트를 다녀온 뒤 같은 비교 결과가 유지됨을 확인했다.
- 스크린샷: `screenshots/playwright/electron/comparison-workspace-desktop.png`, `screenshots/playwright/electron/comparison-workspace-mobile.png`.
- 제한: native Electron은 `file:` URL과 MemoryRouter를 사용해 legacy `/compare-results` 직접 진입을 실행하지 못했다. `<Navigate replace to="/compare" />` route 설정과 build만 확인했으므로 요청 전체를 완전 검증으로 표시하지 않는다.
