# Maple Insight Data Studio Goal

## 1. 관리 원칙

- 이 문서에는 현재 진행할 목표 하나만 둔다. 후속 단계의 계획은 [Phase03](./Phase03.md) ~ [Phase06](./Phase06.md)에 둔다.
- 범위가 바뀌면 구현 전에 [SPEC](../SPEC/README.md)와 [ROADMAP](../ROADMAP.md)를 먼저 검토한다.
- 체크 항목은 구현과 검증이 모두 끝난 경우에만 완료 처리한다.
- 검증 결과와 남은 위험은 [REVIEW](../REVIEW.md)에 기록한다.
- 완료된 목표는 REVIEW 기록과 함께 이력으로 남기고 다음 목표로 교체한다.

## 2. 현재 목표

| 항목      | 내용                                             |
| --------- | ------------------------------------------------ |
| 목표 ID   | `EL-G002`                                        |
| 이름      | 검증 및 작업본 기반 구축                         |
| 상태      | 진행 중                                          |
| Roadmap   | [Phase 2 상세 범위](../ROADMAP/Phase02.md)                                          |
| 선행 조건 | EL-G001 완료, 변환 결과와 manifest의 안정된 계약 |

### 목표

변환된 버전 데이터를 공통 규칙과 도메인 규칙으로 검증하고, 원본 및 변환 결과와 분리된
작업본에서 오류와 경고를 검토할 수 있는 기반을 만든다.

### 사용자 결과

1. 버전별 변환 결과를 검증 작업으로 시작한다.
2. 파일, 레코드와 필드 단위 오류 및 경고를 확인한다.
3. 정규화 전후 값을 비교한다.
4. 경고를 확인하거나 예외 사유를 기록한다.
5. publish 가능 여부를 확인한다.

## 3. 관련 요구사항

- `VAL-001` ~ `VAL-007`
- `OWN-001`, `OWN-004`
- `LOG-001`, `LOG-002`, `LOG-006`
- `NFR-PERF-001`, `NFR-PERF-002`
- `NFR-REL-001`, `NFR-REL-002`
- [SPEC §12 수용 기준 8~10](../SPEC/05-platform-status.md)

## 4. 포함 범위

- 원본, 변환 결과와 작업본의 구분
- 공통 validation 결과 계약
- 도메인 validator 등록 구조
- 오류와 경고 심각도
- 파일, 레코드와 필드 위치 정보
- 정규화 전후 값
- 경고 확인과 예외 사유
- publish 가능 상태 계산
- 검증 실행 상태와 결과 UI
- 검증 및 작업본 단위 테스트

## 5. 제외 범위

- 두 버전의 diff 계산
- 장비 및 직업 CRUD UI
- DB dry-run과 publish
- 타입 및 정적 데이터 생성
- Jev 판단만으로 수행하는 자동 수정
- 앱 재시작 후 작업 세션 복구

## 6. 설계 제약

- 원본 CSV와 관리 경로의 변환 JSON은 수정하지 않는다.
- 작업본은 변환 결과에서 재생성할 수 있어야 한다.
- 공통 형식 검증과 도메인 규칙 검증을 분리한다.
- validator 추가가 기존 도메인의 조건문 확장으로 이어지지 않게 한다.
- 결정론적으로 확인 가능한 값은 Jev를 사용하지 않는다.
- 오류가 남아 있는 작업본은 publish 가능 상태가 될 수 없다.
- 경고는 확인 여부와 예외 사유를 잃지 않아야 한다.
- renderer는 작업본 파일이나 DB에 직접 접근하지 않는다.

## 7. 구현 작업

### A. 계약

- [x] validation issue와 severity 타입 정의
- [x] 파일, 레코드와 필드 위치 타입 정의
- [x] 정규화 전후 값 타입 정의
- [x] validator 입력 및 결과 계약 정의
- [x] 작업본 상태와 publish 가능 상태 정의

### B. validation 서비스

- [x] 공통 validator 파이프라인 구현
- [x] 도메인 validator registry 구현
- [x] 오류와 경고 집계 구현
- [x] 경고 확인 및 예외 사유 반영 구현
- [x] publish 가능 상태 계산 구현
- [x] 취소와 실패 시 부분 작업본 정리

### C. 작업본 저장

- [x] 원본, 변환 결과와 분리된 작업본 경로 정의
- [x] manifest와 작업본의 입력 해시 연결
- [x] 같은 입력에서 같은 초기 작업본 생성
- [x] 기존 작업본 충돌 및 재생성 정책 구현

### D. IPC 및 UI

- [x] 검증 시작, 진행, 취소 IPC와 preload 경계 추가
- [x] validation 결과 요약 표시
- [x] 파일, 레코드와 필드별 issue 탐색 UI
- [x] 정규화 전후 값 비교 UI
- [x] 경고 확인 및 예외 사유 입력 UI
- [x] publish 가능 상태 표시

D 항목은 [REVIEW §6](../REVIEW/Phase02.md)의 71개 Electron 테스트와 mock preload 기반 Playwright 확인으로 구현과
UI 동작을 검증했다. 이는 실제 Electron/native IPC 검증을 뜻하지 않는다.

### E. 테스트

- [x] 공통 validator 정상 및 실패 fixture
- [x] 도메인 validator 등록 테스트
- [x] 오류가 publish를 차단하는 테스트
- [x] 경고 확인과 예외 사유 테스트
- [x] 결정론적 작업본 생성 테스트
- [x] 취소 및 실패 정리 테스트
- [ ] 실제 production 대용량 입력의 renderer 응답성 및 취소 검증
- [ ] 실제 Electron/native IPC에서 run/progress/cancel과 경고 저장 검증
- [ ] class 외 도메인 미지원 차단과 향후 validator coverage 검증
- [ ] 검증 실행 이력의 식별자·입력 해시·시각·상태·처리 건수·issue 요약과 비밀값 제외 검증 (`LOG-006`)

## 8. 완료 조건

- [x] 공통 오류와 도메인 오류가 동일한 결과 계약으로 표시된다.
- [x] 오류가 있는 작업본은 다음 단계로 이동할 수 없다.
- [x] 경고 확인 여부와 예외 사유를 저장할 수 있다.
- [x] 원본, 변환 결과와 작업본을 구분하여 조회할 수 있다.
- [x] 동일한 변환 결과에서 같은 초기 작업본을 생성한다.
- [x] Jev 결과가 결정론적 validation을 대체하지 않는다.
- [x] node/web typecheck, 테스트, lint와 production build가 통과한다.
- [x] 검증 결과와 잔여 위험이 [REVIEW](../REVIEW.md)에 기록되어 있다.
- [ ] 실제 Electron/native IPC 검증이 [SPEC §12.8](../SPEC/05-platform-status.md)을 충족한다.
- [ ] production 크기 입력 응답성·취소 검증이 [SPEC §12.9](../SPEC/05-platform-status.md)를 충족한다.
- [ ] class 외 도메인 차단·coverage 검증이 [SPEC §12.10](../SPEC/05-platform-status.md)을 충족한다.
- [ ] 검증 실행 이력이 `LOG-006`의 필드·비밀값 제외 조건을 충족한다.

## 9. 현재 기준선

- Phase 0 애플리케이션 기반 완료
- Phase 1 파일 가져오기 및 변환 완료
- `data/<environment>/<version>/{csv,json}` 관리 경로
- 변환 manifest와 파일별 SHA-256
- main/preload/renderer IPC 경계
- 진행, 취소 및 구조화된 변환 오류 UI

## 10. 알려진 위험

- CSV 파일마다 도메인과 필드 구조가 달라 validator 경계가 불명확해질 수 있다.
- 작업본 전체 복사는 대용량 버전에서 저장 공간을 과도하게 사용할 수 있다.
- 정규화가 원본 의미를 바꾸지 않는다는 기준을 도메인별로 정의해야 한다.
- 경고 확인·예외 사유는 report와 workspace manifest에 저장한다. 두 파일의 저장·복구가 모두 실패할 때의 불일치 처리와 이후 작업 이력 연결은 남았다.

## 11. 후속 계획 경계

- [Phase 03 — 버전 비교](./Phase03.md), [Phase 04 — 도메인 편집](./Phase04.md),
  [Phase 05 — DB 반영](./Phase05.md), [Phase 06 — 생성](./Phase06.md)은 계획 문서다.
  단계별 범위는 [ROADMAP](../ROADMAP.md), 요구사항은 [SPEC](../SPEC/README.md), 저장 경계는 [아키텍처](../ARCHITECTURE.md)에 연결한다.
- 이 후속 계획은 `EL-G002`의 상태와 완료 체크를 바꾸지 않는다.
- 실제 Electron IPC와 대용량 데이터 검증, class 외 validator coverage가 남아 있으므로 현재 목표는
  계속 진행 중이다.
