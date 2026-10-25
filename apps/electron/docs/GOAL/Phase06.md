# Phase 06 — 타입 및 정적 데이터 생성

**상태: 대기.** [Phase 05](./Phase05.md)에서 승인·반영된 `ready` 버전이 선행한다.

관련 문서:
- [ROADMAP — Phase 6 상세 범위](../ROADMAP/Phase06.md) · [단계 목록](../ROADMAP.md#phase-06)
- [SPEC — 생성 요구사항](../SPEC/04-publish.md#spec-phase-06)
- [아키텍처 — 데이터 흐름](../ARCHITECTURE.md#architecture-data-flow) · [DB와 생성 경계](../ARCHITECTURE.md#architecture-publish)

## 사용자 결과

DB에 저장된 직업·스킬·장비·규칙과 무기 유형을 사용해 `packages`의 타입·정적 데이터를 재현 가능하게 생성한다. 실행 대상과 출력 경로를 확인하고 생성된 파일의 Git diff를 직접 검토한다.

## 구현 범위

- [ ] 사용할 `ready` 버전, 해당 publish 실행, 기존 패키지 생성기와 출력 경로·실행 순서를 확인한다.
- [ ] DB의 승인된 데이터를 패키지의 직업·스킬·장비 계약으로 연결한다. 임의 수식이나 미검토 스크린샷 후보는 생성 입력으로 사용하지 않는다.
- [ ] 동일 입력에서 동일한 결과를 만들고 파일 수·변경 파일·오류를 요약한다. 결과를 자동 커밋하지 않는다.
- [ ] 생성 실패는 DB publish 성공과 분리해 표시하며 입력 DB 데이터를 변경하지 않는다.

## 완료 조건

- [ ] 같은 ready 버전과 입력에서 결과가 같고 기존 패키지 소비 코드의 타입 검사가 통과한다.
- [ ] 생성 실패 후 DB 상태가 유지되며 재실행할 수 있다.
- [ ] 사용자가 파일 변경 범위와 Git diff를 확인할 수 있다.
- [ ] 실제 Electron 실행과 생성 결과를 [REVIEW](../REVIEW.md)에 기록한 뒤에만 완료 표시한다.

**다음:** [ROADMAP — Phase 7 운영 안정화](../ROADMAP.md#phase-07).
