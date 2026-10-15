## 9. Phase 4 - 도메인 편집

**상태: 대기** · [상세 목표](../GOAL/Phase04.md) · [SPEC](../SPEC/06-phase-03-06.md#spec-phase-04-jobs) · [아키텍처](../ARCHITECTURE.md#architecture-phase-04)

### 목표

검증된 작업본에서 장비와 직업 데이터를 안전하게 추가, 수정, 삭제한다.

### 범위

- 장비 목록, 상세, 검색, 필터, 편집
- 잠재옵션 데이터 관리
- 직업 코드, 계열, 소속, 전직 단계 편집
- 참조 관계 검증
- 작업본 변경 이력
- 삭제 예약과 복원

### 관련 요구사항

- `EQP-001` ~ `EQP-007`
- `CLS-001` ~ `CLS-006`
- `SKL-001` ~ `SKL-003`

### 종료 조건

- [ ] 장비와 직업 CRUD가 작업본에서만 수행된다.
- [ ] 버전별 고유 제약과 참조 관계를 편집 전에 검증한다.
- [ ] 1.5차와 2.5차 전직 단계를 손실 없이 저장한다.
- [ ] 삭제된 항목을 publish 전 복원할 수 있다.
- [ ] 모든 편집은 raw 원본이나 Phase 3 불변 diff 산출물을 덮어쓰지 않고 별도 작업본 변경 이력과 재계산된 비교 결과에 반영된다.

### Phase 4a - 직업·스킬 보강

새 raw `jobID`·`jobName`에 영어 이름, 무기 유형, 한손/양손, 무기 상수·속도, 보조 무기, 주·부 스탯, 계열·소속을 수동 보강한다. 새 `jobID`에 스킬을 붙이고 링크, 1~4차, 하이퍼, 패시브, 5차, 6차와 active/passive/buff/summon을 관리한다. Skill·SkillH·SkillCommon·SkillLevel을 연결해 툴팁·수식을 정적 검사한다.

- [ ] raw JSON 불변성과 앞자리 0 보존을 fixture로 검증한다.
- [ ] Formula Grammar v1의 실제 raw 예제, 한도, parse-only 결과와 unsupported·invalid fixture를 검증한다. tooltip은 raw `#c공격키#`·`#c7레벨 : ...` 서식, `#cooltime`·존재하는 `#mpCon` 값 후보, 없는 `#missingValue` 참조를 각각 검증한다.
- [ ] PVP common은 이 연결 범위에서 제외한다.
- [ ] version·validation 입력 hash·change-set ID를 가진 edit workbench manifest와 job·skill 레코드 lifecycle을 fixture로 검증한다.

### Phase 4b - 스킬 유형과 피해 규칙

스킬 페이지의 계획된 `스킬 유형` 하위 탭에서 유형, 조건, 피해 보정자를 관리한다. 현재 탐색에 존재한다고 가정하지 않는다.

- [ ] 같은 damage 그룹은 합산하고 서로 다른 critical 그룹은 곱연산한다.
- [ ] boss-only, normal-only, debuff, 빈 조건의 적용성 fixture를 만든다.
- [ ] 상충 대상 조건, 중복 규칙, 알 수 없는 조건을 거부한다.
- [ ] 대상 조건, debuff 상태, 유형·그룹 순서의 우선순위를 검증한다.

### Phase 4c - 장비 수동·스크린샷 흐름

장비 원본 API가 없다는 전제로 수동 편집, 무기 유형 catalog, 스크린샷 기반 후보 제안과 사용자 검토를 만든다.

- [ ] 후보값은 사용자 확인 전 작업본에 확정되지 않는다.
- [ ] 이미지 동의, 외부 전송 여부, 인식 한계를 표시한다.
- [ ] 여러 스크린샷의 출처와 수정 이력을 검증한다.
- [ ] 같은 field의 충돌 후보, rejection, accepted 뒤 수동 override, 동의 만료, 동의 없는 외부 전송 거부, hash 변경 승인 무효화, 실패 publish 뒤 workbench 보존을 fixture로 검증한다.

기존 잠재옵션, 직업 1.5차·2.5차, 참조 관계, 삭제 예약·복원 종료 조건도 유지한다. 스킬 유형 하위 탭은 미구현이다.
