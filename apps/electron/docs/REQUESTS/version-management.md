# 버전 관리 확장 요청

- 상태: **진행 중 — 일부 검증 통과, 전체 수용 미완료**
- 범위: Electron 버전 관리 화면과 버전별 DB·관리 파일의 안전한 수명 주기
- 기준: [SPEC §8.2](../SPEC/01-foundation.md#spec-version-management) · [요청 목차](./README.md)
- 기존 Phase 03의 raw 비교와 `버전 > 리스트/비교` 검증은 과거 기록이다. 현재 작업 트리에 토글·수정·복제·삭제 구현 변경이 있다. 임시 PostgreSQL DB에서 실제 변경 IPC와 복구 시뮬레이션까지 검증했다. 실제 프로세스 강제 종료와 대량 DB 복제, 복제본 native 검증·ready 전환은 미검증이다.

## 요청 및 수용 계약

1. sidebar 부모 이름은 `버전 관리`이며 클릭해 `리스트`·`비교` 자식을 접고 펼친다. 선택된 자식·현재 화면은 식별 가능해야 한다.
2. 리스트 행에서 게임 출시일 `releasedOn`을 직접 입력·저장한다. `null`은 `미등록`으로 보이고 비우기 저장으로 복원할 수 있다. 유효한 날짜만 허용하고 시스템 등록 시각 `createdAt`은 바꾸지 않는다. 저장 실패는 기존 값과 오류를 보여준다.
3. 기존 버전을 새 고유 `major.minor.patch` 대상 버전으로 **전체 복제**한다. 버전 레코드뿐 아니라 버전 소유 관계의 모든 DB 행과 원본·변환 JSON/CSV, manifest와 존재하는 버전 소유 검증 작업본의 원본 데이터·메타데이터를 복제한다. 기존 검증 결과 `validation.json`은 새 버전의 검증 증거가 아니므로 복제하지 않고 작업본은 재검증 대기 상태로 둔다. 참조 키, 내부 버전/환경 메타데이터, 파일 경로·해시 및 소유 관계를 새 대상으로 일치시키고 원본은 변경하지 않는다. `data/diff/<baseVersion>_to_<compareVersion>/`의 기존 비교 결과는 두 버전의 공유 산출물이고 새 버전의 입력 해시·identity에 대한 결과가 아니므로 복제 대상에서 제외한다. 새 버전 비교는 재실행한다. 고유 버전·대상 관리 경로 충돌은 복제 전에 거부한다.
4. 복제 대상 환경은 항상 `copy`다. 일반 가져오기에만 patch `100~299` → `test`, `300~499` → `production`을 적용하고 복제에는 적용하지 않는다. `copy`는 환경이고 상태가 아니다. 복제 진행 중 DB 상태 `copying`은 일시 상태로 활성 목록·현재 선택에서 숨긴다. 파일 복제 완료 후에만 `importing`으로 전환한다. `copy` 대상의 검증 실행은 지원하지만 검증 성공만으로 DB 상태가 자동 `ready`가 되지 않는다. 필수 적재·검증과 명시적 완료 경로가 마련되기 전에는 `ready`로 전환하지 않는다. 실패한 복제는 `failed` 또는 복구 가능한 미완료 상태로 남긴다.
5. 삭제는 대상 버전·영향 범위를 보여주고 별도 명시적 확인을 받은 후 상태를 `deleted`로 바꾸는 소프트 삭제다. DB 행과 모든 관리 파일을 그대로 보존하며 물리 삭제·자동 정리는 하지 않는다. `deleted`는 `ready`/`importing`과 다른 상태로, 활성 리스트·현재 버전 선택 및 저장된 선택 복원에서 제외한다. 현재 선택이 삭제되면 유효한 버전으로 전환한다. 기존 `failed` 제외 규칙도 유지한다.
6. 날짜 저장·복제·삭제는 main process에서 입력(semver, 날짜, 환경, 상태, 경로, 확인)을 검사하고 승인 데이터 루트 내에서 처리한다. DB·파일 중간 실패, 앱 종료, 중복 요청 시 기존 버전과 파일을 그대로 두고 대상 작업을 원자적으로 롤백하거나 상태·로그·staging을 기록해 안전하게 재시도/복구한다. `copying` 복제본을 활성 또는 `ready`로 노출하지 않는다. `importing` 복제본은 기존 활성 목록 규칙에 따라 표시하되 미검증 상태를 명시한다. 조용한 덮어쓰기와 부분 성공 표시는 금지한다.
7. `VER-016` 날짜 수정과 `VER-017` 복제·`VER-018` 삭제는 고정 폭 작업 영역에 정렬된 아이콘 전용 버튼을 사용한다. 날짜 편집기는 table·행의 bounding box를 바꾸지 않는 overlay로 열고 Enter 또는 저장 버튼으로 저장하며 Escape 또는 취소 버튼으로 취소한다. 모든 작업 아이콘은 hover와 keyboard focus에서 접근 가능한 label을 보여준다. 이 개선은 표시·상호작용 범위이며 기존 데이터·IPC 계약을 변경하지 않는다.

<a id="roadmap"></a>
## ROADMAP — 의존성과 변경 영향

1. 먼저 Electron의 버전 목록·선택·import/검증·경로 해석과 공통 DB의 버전 관계 전체를 조사한다. 현재 DB의 `GameDataVersion`은 `version` 단일 기본 키이며 환경·상태는 문자열이다. Electron의 목록 타입/필터는 `test|production`, `ready|importing`으로 제한된다. 따라서 `copy`·`deleted`는 공통 DB 관리자 계약, Electron IPC/renderer 선택·파일 경로/검증 계약에 영향을 준다. 다른 앱·공통 패키지의 버전 소비자도 수정 전 검색해 영향과 마이그레이션·기존 import 분류 충돌을 확인한다. 이 요청만으로 다른 앱 구현·GOAL은 변경하지 않는다.
2. 버전 소유 DB 관계와 관리 파일 목록(버전 소유 검증 작업본 포함, 공유 diff 산출물 제외), 새 ID/경로 재작성 규칙, 복제 순서·staging·중단/재시도 정책을 확정한다. Phase 02 검증 출력 계약과 Phase 03 diff 참조를 깨지 않는다. 기존 Phase 04/05의 편집·publish가 복제 범위에 있을 경우 해당 데이터와 참조도 포함한다.
3. 상태·환경 계약과 복제/날짜 수정/소프트 삭제 서비스 및 IPC를 구현한 뒤 UI를 연결한다. 복제본 `ready` 전환은 필수 검증 완료 및 별도 완료 경로가 마련된 뒤에만 허용한다. 현재 검증은 DB 상태를 자동 승격하지 않는다.
4. DB/파일 충돌·중단·재시도·원본 보존·선택 fallback을 자동/실제 Electron 검증하고 REVIEW에 기록한다. 이 독립 요청은 Phase 03 완료 표기나 Phase 04 진행 상태를 바꾸지 않는다.

<a id="goal"></a>
## GOAL — 일부 검증, 전체 미완료

- [x] sidebar `버전 관리` 접기/펼치기와 자식 탐색을 native Electron 데스크톱·모바일에서 검증했다.
- [x] `VER-020` overlay 개선을 native Electron 데스크톱 1480px·모바일 390px에서 검증했다. 날짜 유무 두 행 모두에서 overlay가 열렸고, 출시일 아이콘 x 좌표와 table·sidebar·행·셀 geometry, `scrollLeft`, viewport shift는 전·후 모두 0px였다. hover·keyboard focus label, 버튼 SVG accessible label, Enter·저장과 Escape·취소도 통과했다.
- [x] 임시 DB의 native IPC에서 nullable `releasedOn` 행 저장·비우기·잘못된 날짜 거부와 기존 값 보존을 검증했다.
- [x] 임시 DB의 native IPC에서 새 semver, `copy` 환경, 9개 버전 소유 모델의 관계와 관리 CSV/JSON·대기 작업본 복제 및 원본 불변을 검증했다. 대량 DB 복제는 별도 미검증이다.
- [ ] 중복 버전·경로 충돌, DB/파일 실패·중단·재시도에서 원본 불변과 대상 롤백 또는 복구 가능 상태를 검증한다.
- [x] 명시적 삭제 확인 뒤 임시 DB의 `deleted` 상태와 DB·파일 보존, 목록·선택 제외 및 재시작 fallback을 검증했다.
- [ ] `copying` 숨김, 완료 후 `importing`, `copy` 검증 실행과 DB `ready` 자동 전환 없음, 필수 검증 전 `ready` 금지를 검증하고 결과를 아래 REVIEW에 남긴다.

<a id="review"></a>
## REVIEW — 부분 검증 (2026-10-15)

- 최신 자동 검사: Electron build와 Vitest 20개 파일·157개 테스트가 통과했다. 기존 Node/Web typecheck와 DB focused 테스트 8개도 통과 기록이 있다. `copy` 환경 validation fixture 23개 테스트는 native 복제본 검증이 아니다.
- 최신 native UI 검사: Electron 데스크톱 1480px·모바일 390px에서 출시일이 있는 행과 `미등록` 행 모두 overlay가 열렸다. 각 viewport에서 출시일 아이콘 x 좌표와 table·sidebar·행·셀 geometry, `scrollLeft`, viewport shift의 overlay 전·후 차이는 모두 0px였다. hover·keyboard focus·Escape, Enter 날짜 저장, 아이콘 버튼의 접근 가능한 이름도 통과했다. 스크린샷 기반 시각 oracle은 수행하지 않았다.
- 폐기 가능한 PostgreSQL DB에 migration(`20261015000000_allow_copy_game_data_environment` 포함)을 적용한 native Electron 검사에서 Enter 날짜 저장·비우기와 복제·삭제 회귀 검증을 통과했고, 임시 DB를 폐기했다. 이전 검사에서는 잘못된 날짜 거부, 새 semver의 `copy` 복제(`copying` → `importing`), 9개 모델의 버전 소유 DB 관계, 관리 CSV/JSON과 `pending` 검증 작업본, 원본 DB·파일 불변을 확인했다. 기존 검증 결과는 복제하지 않았다.
- 기존 `verify-version-ui-playwright.mjs` native 검사에서는 데스크톱·모바일 탐색 토글, 날짜/복제/삭제 취소와 DB 불변을 확인했다. `verify-diff-playwright.mjs` native 검사에서는 raw 비교와 173,665건 삭제 흐름을 확인했다. 기존 Phase 03 기록을 새 요청의 완료 근거로 사용하지 않는다.
- 같은 임시 DB에서 소프트 삭제 후 DB·파일 보존, 활성 목록·현재 선택 제외와 재시작 뒤 fallback, 삭제된 대상 충돌 거부, CSV 누락 시 대상 DB·관리 경로 미생성도 확인했다. 가짜 `copying` 행·대상 파일·staging을 주입한 재시도는 오래된 대상·staging을 정리하고 새 복제를 완료했다. 원본 DB는 건드리지 않았고 임시 DB는 폐기했다.
- 미검증: 실제 프로세스 강제 종료 중 복제와 그 뒤 복구, 대량 DB 그래프 복제, 복제본의 native validation, `copy` 대상 DB `ready` 전환. 충돌·CSV 누락·시뮬레이션 복구만으로 모든 중단·실패 시나리오를 완료 처리하지 않는다. 따라서 복구와 `ready` 관련 GOAL은 미완료다.
- 상태 경계: Electron import 등록은 DB `importing`으로 시작한다. validation workspace의 `ready`는 DB 상태를 갱신하지 않는다. `seedGameDataBundle`은 raw·정규화·equipment 적재가 모두 성공하면 `completeGameDataVersionImport`를 호출한다. 기존 완료 메서드는 `copy` 환경을 허용하지 않는다. 복제본 `ready`에는 별도 검증·승인된 완료 경로가 필요하며 현재 자동 승격은 없다.
