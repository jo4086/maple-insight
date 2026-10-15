## 7. Phase 2 - 검증 및 작업본

**상태: 진행 중**

### 목표

변환 결과를 공통 규칙과 도메인 규칙으로 검증하고, 원본과 분리된 작업본으로 관리한다.

### 범위

- 공통 validation 파이프라인
- 도메인별 validator 등록 구조
- 오류와 경고 모델
- 레코드 및 필드 위치 표시
- 정규화 전후 값 비교
- 경고 확인과 예외 사유 기록
- publish 가능 상태 계산

### 관련 요구사항

- `VAL-001` ~ `VAL-007`
- `OWN-001`, `OWN-004`
- `LOG-001`, `LOG-002`, `LOG-006`

### 종료 조건

- [ ] 공통 오류와 도메인 오류가 동일한 결과 계약으로 표시된다.
- [ ] 오류가 있는 작업본은 다음 반영 단계로 이동할 수 없다.
- [ ] 경고 확인 여부와 사유를 저장할 수 있다.
- [ ] 원본, 변환 결과, 작업본을 구분하여 조회할 수 있다.
- [ ] Jev 결과가 결정론적 validation을 대체하지 않는다.
- [ ] 검증 실행 이력의 입력 해시·시각·상태·건수·issue 요약과 비밀값 제외를 확인한다 (`LOG-006`).

### 현재 검증 경계 (EL-G002)

서비스·mock-preload UI 검증 기록은 [REVIEW §6](../REVIEW/Phase02.md)을 따른다. 실제 Electron/native IPC run/progress/cancel·경고 저장, production 크기 renderer 응답성·취소, class 외 미지원 도메인의 publish 차단·validator coverage, report·workspace manifest 저장 실패 복구가 남았다.
