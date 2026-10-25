## 8. Phase 3 - 버전 diff

**상태: 완료(기존 검증).** raw identity/diff, 파일 로드·경로 검증, IPC·저장·UI, 후속 버전 탐색·파일 목록 상태와 native Electron 검증을 마쳤다. 독립 검토 보완 뒤 native Electron 최종 흐름도 재검증했다. 현재 DB에 `failed`·test 행이 없어 해당 native 표시도 미검증이다. [상세 목표](../GOAL/Phase03.md) · [검증 기록](../REVIEW/Phase03.md) · [SPEC](../SPEC/06-phase-03-06.md#spec-phase-03) · [아키텍처](../ARCHITECTURE.md#architecture-phase-03)

### 목표

두 버전 데이터를 도메인별 안정 식별자로 비교하고 추가, 수정, 삭제를 검토한다.

### 범위

- 도메인별 identity 전략
- 추가, 수정, 삭제 계산과 필드 단위 변경 결과
- 순서 변경과 값 변경 구분
- 검색, 필터, 정렬, 페이지 이동
- 변경 요약과 상세 UI

### 관련 요구사항

- `DIF-001` ~ `DIF-007`
- `VER-003` ~ `VER-005`

### 초기 다섯 파일 계약

두 버전과 공통 파일 하나를 선택해 추가·수정과 삭제를 별도 패널로 표시하고, 수정은 필드별 before/after를 제공한다.

- 입력: `ms_job.json`, `ms_skill.json`, `ms_skillH.json`, `ms_skillCommon.json`, `ms_skillLevel.json`
- 제외: `ms_skillPVPCommon.json`
- 산출물: `data/diff/<baseVersion>_to_<compareVersion>/<filename>`
- 최상위 계약: `baseVersion`, `compareVersion`, `add`, `modify`, `delete`
- identity registry와 중복 identity·identity 누락·한쪽 파일 누락 오류
- 배열 순서 무시, identity 변경의 delete+add 처리

### 종료 조건

- [x] 다섯 fixture 파일에서 identity별 add/modify/delete를 정확히 구분한다. 장비 작업본 비교는 Phase 4에서 확장한다.
- [x] `ms_job`은 `jobID`, skill/hint는 `skillID`, common은 `(skillID, commonName)`, level은 `(skillID, level)`을 사용한다.
- [x] 중복 identity, identity 누락, 파일 누락, 경로·심볼릭 링크는 비교 결과를 추정하지 않고 오류가 된다.
- [x] 수정 필드 before/after와 두 패널 요약, 검색·페이지 이동을 표시한다.
- [x] 같은 입력 재사용, 입력 해시 stale·tamper, 명시적 산출물 교체, 쓰기 실패 시 기존 결과 보존을 검증한다.
- [x] native Electron 임시 fixture에서 저장·재열기·교체, 빈 결과·파일 stale·누락 파일, desktop/mobile 주변 화면을 검증한다.
- [x] `ms_skillLevel` 173,665개 삭제에서 비교 1,690ms, 검색 234ms, 페이지 이동 63ms를 확인한다.

native script 실제 비교 범위는 `ms_job.json`, 작은 skill 파일, 대량 `ms_skillLevel.json`이다. 다섯 파일 identity 계약은 fixture 단위 테스트로 검증했다. 다섯 파일 각각의 native 흐름 전체는 실행하지 않았다.

### 후속 변경 검증

- [x] `버전 > 리스트/비교` 탐색과 실제 DB의 `ready`/`importing` 목록을 확인한다.
- [x] `releasedOn`의 `미등록` 표시 계약, `createdAt`, production 환경·상태와 관리 JSON 없는 등록 버전의 목록 유지·오류를 확인한다.
- [ ] `failed` 제외와 test 환경 표시는 코드·자동 테스트 범위다. 현재 DB에 해당 행이 없어 native 화면 검증은 미실행이다.
- [x] 유효한 현재 버전의 재시작 복원과 잘못된 저장값의 fallback을 확인한다.
- [x] production·React dev StrictMode에서 파일 목록 loading 정리, 누락 파일 설명, 비활성화 해제와 비교 흐름을 확인한다.
- [x] desktop/mobile에서 대시보드·select를 포함한 화살표 glyph 가시성과 비교 화살표 세로 중앙을 확인한다.
- [x] Pacific 시간대에서 UTC `releasedOn` 달력 날짜와 한쪽 raw JSON 누락의 파일명·버전 설명을 단위 테스트한다.
- [x] 독립 검토 보완 뒤 native Electron 최종 흐름을 다시 확인했다.

장비 작업본 비교는 Phase 4 후속 확장이며 초기 다섯 파일 diff 산출물과 분리한다.
