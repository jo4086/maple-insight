## 10. Phase 5 - DB dry-run 및 publish

**상태: 대기** · [상세 목표](../GOAL/Phase05.md) · [SPEC](../SPEC/06-phase-03-06.md#spec-phase-05) · [아키텍처](../ARCHITECTURE.md#architecture-phase-05)

### 목표

승인된 작업본을 dry-run으로 검증하고 단일 버전 단위로 DB에 안전하게 반영한다.

### 범위

- dry-run 저장소 계층
- 예상 변경 건수와 오류 보고
- 사용자 승인 화면
- 버전 상태 전이
- 트랜잭션 publish
- 실패 롤백과 재시도
- 작업 로그

### 관련 요구사항

- `DB-001` ~ `DB-008`
- `SEC-003`, `SEC-004`
- `LOG-001` ~ `LOG-004`
- `VER-006` ~ `VER-009`

### 종료 조건

- [ ] dry-run은 DB를 변경하지 않는다.
- [ ] 승인 전 publish를 실행할 수 없다.
- [ ] 중간 실패 시 해당 publish의 변경이 모두 롤백된다.
- [ ] 성공한 버전만 ready로 전환된다.
- [ ] 실패 사유와 재시도 가능 여부를 확인할 수 있다.

### 제안 schema와 추가 종료 조건

직업 보강, 스킬 metadata·규칙, 무기 catalog, 장비 draft/evidence, 승인·실행 이력을 위한 migration을 제안한다. 현 스키마에 존재한다고 가정하지 않는다.

- [ ] nullable 확장, backfill, 읽기 전환, 제약 강화 순서의 migration을 검토한다.
- [ ] dry-run이 DB를 변경하지 않고 예상 변경·오류를 제공한다.
- [ ] 작업본 해시와 연결된 명시적 승인 없이는 publish하지 않는다.
- [ ] 실패 publish는 트랜잭션으로 롤백하고 ready 전환을 막는다.
- [ ] approved change-set의 frozen hash와 record ID를 제안 metadata·draft·evidence·approval·run 테이블에 추적 가능하게 반영한다.
