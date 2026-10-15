## 8. Phase 3 - 버전 diff

**상태: 대기** · [상세 목표](../GOAL/Phase03.md) · [SPEC](../SPEC/06-phase-03-06.md#spec-phase-03) · [아키텍처](../ARCHITECTURE.md#architecture-phase-03)

### 목표

두 버전의 데이터를 도메인별 안정 식별자로 비교하고 추가, 수정, 삭제를 검토한다.

### 범위

- 도메인별 identity 전략
- 추가, 수정, 삭제 계산
- 필드 단위 변경 결과
- 순서 변경과 값 변경 구분
- 검색, 필터, 정렬
- 변경 요약과 상세 UI

### 관련 요구사항

- `DIF-001` ~ `DIF-007`
- `VER-003` ~ `VER-005`

### 종료 조건

- [ ] 초기 다섯 공통 JSON fixture에서 추가, 수정, 삭제를 정확히 구분한다. 장비 작업본 비교는 Phase 4에서 확장한다.
- [ ] 배열 순서만 바뀐 경우의 정책이 정의되어 있다.
- [ ] 필드 단위 이전 값과 이후 값을 표시한다.
- [ ] 현재 버전 변경 시 diff 결과가 새 컨텍스트로 갱신된다.
- [ ] 대량 diff 결과를 탐색할 수 있다.

### 초기 다섯 파일 계약과 추가 종료 조건

두 버전과 공통 파일 하나를 선택해 추가·수정과 삭제를 별도 패널로 표시하고, 수정은 필드별 before/after를 제공한다.

### 범위

- 입력: `ms_job.json`, `ms_skill.json`, `ms_skillH.json`, `ms_skillCommon.json`, `ms_skillLevel.json`
- 제외: `ms_skillPVPCommon.json`
- 산출물: `data/diff/<baseVersion>_to_<compareVersion>/<filename>`
- 최상위 계약: `baseVersion`, `compareVersion`, `add`, `modify`, `delete`
- identity registry와 중복 identity·identity 누락·한쪽 파일 누락 오류
- 배열 순서 무시, identity 변경의 delete+add 처리

### 종료 조건

- [ ] 다섯 fixture 파일에서 identity별 add/modify/delete가 정확하다.
- [ ] `ms_job`은 `jobID`, skill/hint는 `skillID`, common은 `(skillID, commonName)`, level은 `(skillID, level)`을 사용한다.
- [ ] 중복 identity, identity 누락, 파일 누락은 비교 결과를 추정하지 않고 오류가 된다.
- [ ] 수정 필드의 before/after와 두 패널 요약을 표시한다.
- [ ] 같은 입력 재실행과 입력 해시 변경의 산출물 정책을 검증한다.

장비 작업본의 비교는 Phase 4 후속 확장이며 초기 다섯 파일 diff 산출물과 분리한다.
