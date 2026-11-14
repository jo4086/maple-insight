# Phase 04 — 직업·스킬·장비 데이터 편집

**상태: 진행 중 (직업 에디터 작업본 전환 부분 검증).** [Phase 03](./Phase03.md)의 ready 검증 작업본을 입력으로 같은 입력 hash의 UUID change-set을 재열고, 입력 hash 변경 시 이전 change-set을 `superseded`로 보존한 뒤 child를 만든다. DB 등록 직업의 metadata 7개 필드를 새 edit workbench에서 조회·저장·재열고 복구 초안의 읽기 전용 검토·명시적 선택 복사를 함께 유지한다. 실제 DB·ready validation fixture를 사용한 native Electron 유효 저장·재열기·복사와 외부 source writer 경합은 미검증이다. Phase 4a~4c 기능과 완료 조건은 아직 충족하지 않았다.

관련 문서:

- [ROADMAP — Phase 4 상세 범위](../ROADMAP/Phase04.md) · [단계 목록](../ROADMAP.md#phase-04)
- [SPEC — 편집 작업본](../SPEC/06-phase-03-06.md#spec-edit-workbench) · [직업·스킬](../SPEC/06-phase-03-06.md#spec-phase-04-jobs) · [피해 규칙](../SPEC/06-phase-03-06.md#spec-phase-04-rules) · [장비](../SPEC/06-phase-03-06.md#spec-phase-04-equipment)
- [아키텍처 — 편집 작업본](../ARCHITECTURE.md#architecture-phase-04)

## 공통 편집 경계

- [ ] raw JSON과 Phase 03 diff 산출물은 변경하지 않는다. 검증 작업본에서 별도 `data/.edit-workbenches/<environment>/<version>/<changeSetId>/` 편집 작업본을 만든다.
- [ ] 변경 집합의 버전·입력 해시·record ID·수정 이력과 오류를 기록한다. 작업본 변경 시 기존 dry-run과 승인을 무효화한다.
- [ ] 도메인별 추가·수정·삭제, 보류·복원, 중복·참조 검증, 선택 버전 변경 시 컨텍스트 전환을 제공한다.

### 기존 직업 복구 초안 cutover 방향

- **검토 뒤 복사**를 승인 방향으로 삼는다. `.job-draft-recovery` 원본을 보존하고 버전·직업 ID별 사용자 검토·선택 뒤 선택값만 새 change-set의 변경 불가능한 첫 revision으로 복사한다. 자동 import, dual write, 원본 삭제는 하지 않는다.
- [ ] 부분 구현한 변환 선택·결과 record, 원본 provenance와 source/target hash 검증을 native Electron·실제 데이터와 외부 동시 source writer 조건까지 검증한다. `newWeaponTypes`와 전직 연결은 도메인 mapping 승인 전 제외하되 조용히 버리지 않고 제외 사실과 원본 보존을 검토 화면·record에 남긴다.
- 현재 직업 에디터는 DB 등록 직업 metadata를 새 workbench에서 읽고 저장하며 legacy 복구 저장소에는 쓰지 않는다. 읽기 전용 복구 검토와 직업별 명시적 `선택 직업 복사`를 유지하고 일괄 복사는 제공하지 않는다.

### 직업 에디터 작업본 전환 부분 검증 (2026-11-13)

- DB 등록 직업의 `englishName`·`classGroup`·`affiliation`·`mainStat`·`subStat`·`primaryWeapons`·`secondaryWeapons` 7개 metadata 필드를 edit workbench에서 일괄 조회하고 저장·재열며, job별 scan 대신 metadata batch read를 사용한다.
- 저장은 `changeSetId`와 `revision` stale guard를 적용한다. DB 미등록 직업 편집을 차단하고 ready validation workspace가 없으면 DB 직업을 읽기 전용으로 탐색한다. legacy 복구 저장소에는 쓰지 않는다.
- 복구 미리보기·선택 복사를 보존하고 제외 필드 `jobName`·`newWeaponTypes`·`advancementJobIds`를 표시한다. 비동기 이전 저장 응답 경합, autosave validation, 복사 DB ID와 trust boundary를 보강했다.
- 자동 검사, mocked browser와 제한된 native smoke는 통과했다. 실제 DB·ready validation fixture의 native 유효 저장·재열기·복사, credential-backed 또는 실제 DB 흐름과 외부 source writer 경합은 미검증이다. Phase 04는 미완료이며 체크박스는 그대로다.

### 복구 초안 선택 복사 부분 구현·검증 (2026-11-13)

- `직업 데이터 → 에디터`의 읽기 전용 복구 미리보기에서 직업별 명시적 `선택 직업 복사`를 제공한다. 확인 화면에 제외되는 `jobName`·`newWeaponTypes`·`advancementJobIds`를 나열한 뒤 선택값만 Phase 04 작업본의 변경 불가능한 첫 metadata revision으로 복사한다.
- `.job-draft-recovery` 원본은 보존한다. 복사 record에는 provenance인 source recovery ID·원본 SHA256, target hash들, 제외 필드와 결과를 남긴다. 새 무기 후보를 참조하는 선택은 차단하고 stale source·target을 거부하며, 동일 요청 재시도는 멱등이다. 실패 뒤 버튼은 새로고침 전까지 다시 실행할 수 없고 처리 중·성공 뒤 반복 클릭도 비활성화한다. DB publish는 없다.
- 집중 Vitest 68개(`job-data` 32개, `edit-workbench` 36개), Electron production build·Node/Web typecheck, 대상 ESLint·Prettier가 통과했다. Chromium 모의 스크립트는 desktop 1480×920·mobile 390×844에서 취소·stale·성공·차단·버전 route·의도하지 않은 쓰기 없음 흐름을 확인하고 exit 0이었다. 스크린샷 `screenshots/playwright/electron/job-recovery-preview-e2e-{desktop,mobile}.png`는 Git 제외 상태다.
- native Electron IPC·실제 DB와 외부 동시 source writer race는 미검증이다. Phase 04는 미완료이며 모든 체크박스는 그대로다.

### 읽기 전용 복구 검토 UI 부분 체크포인트 (2026-11-12)

- `직업 데이터 → 에디터` 헤더 근처의 접힌 안내를 열면 복구 검토를 지연 조회해 원본 `recoveryId`·SHA256, 직업별 제안·제외 필드와 무기 후보 참조 차단 사유를 읽기 전용으로 표시한다. IPC/preload도 preview 조회만 제공하며 오류·재시도·빈 상태·버전 전환 race를 처리한다.
- 선택·복사 action과 새 edit workbench 쓰기는 아직 없고 기존 로컬 복구 원본은 변경하지 않는다. 집중 Vitest 51개(`job-data` 24개, `edit-workbench` 27개), Electron production build·Node/Web typecheck, 대상 lint·Prettier와 Chromium 모의 스크립트가 exit 0이었다.
- Chromium 모의 브라우저는 desktop 1480×920·mobile 390×844에서 열기·새로고침·오류·빈 상태·stale 응답·버전 전환과 직업 상세 왕복을 확인했다. 스크린샷 `screenshots/playwright/electron/job-recovery-preview-e2e-{desktop,mobile}.png`는 Git 제외 상태다. native Electron IPC와 실제 DB·복구 데이터는 미검증이며 Phase 04는 미완료, 모든 체크박스는 그대로다.

## Phase 4a — 직업 보강과 스킬 연결

스킬 목록은 버전별 DB 기본 정보 조회, 직업 차수 필터, 상세 기본 정보 표시와 직업 정보 탭에서의 차수별 이동을 읽기 전용으로 부분 구현했다. 5차 전용 jobID 연결과 스킬 보강·저장, SkillH·SkillCommon·SkillLevel 연계는 남아 있으므로 아래 완료 항목은 변경하지 않는다.

- [ ] 새 직업 diff에서 raw `jobID`, `jobName`을 불러와 자동 기입한다. 영문 이름, 무기 유형·한손/양손·무기 상수·공격 속도·보조무기, 주/부스탯, 계열·소속을 수동 입력·수정한다. 문자열 ID의 앞자리 0과 비정수 전직 단계를 보존한다. 정상 사용자 ID는 숫자 문자열 1~5자리다. 숫자값이 `800000` 이상인 숫자 문자열은 길이와 무관하게 `시스템 직업`으로 분류한다.
- [ ] 시스템 직업은 raw·validation과 전체 관리자/raw 토글에 유지한다. Phase 3 불변 raw diff는 시스템 분류·선택 override와 독립적으로 raw 레코드를 유지한다. 시스템 직업은 기본 사용자 직업 목록, job enrichment, publish 선택에서는 제외한다. 직업 목록 UI가 아직 없으므로 이 기능은 미구현이다.
- [ ] 일반 직업의 jobID별 수동 제외·재포함을 시스템 분류와 분리해 사유·reviewer·시각과 함께 versioned edit workbench에 저장하고 되돌린다. 수동 재포함으로 시스템 직업을 사용자 목록에 넣지 않으며 raw는 편집·삭제하지 않는다.
- [ ] 해당 `jobID`에 스킬 ID를 연결하고 링크, 1~4차, 하이퍼, 패시브, 5차, 6차 분류 및 액티브·패시브·버프·소환 등의 스킬 유형을 관리한다.
- [ ] Skill·SkillH·SkillCommon·SkillLevel을 `skillID`로 연결해 설명·레벨·툴팁·공통 수식을 함께 확인한다. PVP common은 제외한다. raw `commonValue: ''`는 유효하며 누락·비문자열은 validation 오류다. 원문을 보존하고 지원하는 수식은 정적 문법 검사만 하며 미지원 수식은 수동 검토로 보낸다. 임의 수식 실행은 하지 않는다.
- [ ] source/linked/internal 스킬 관계와 5·6차 코어 연동 레벨 구조를 보존한다. raw ID·직업/스킬 참조·툴팁 서식과 값 참조를 구분하는 fixture를 만들고, 저장 후 재열기에서 관계 손실과 누락 연결을 확인한다.

## Phase 4b — 스킬 유형과 조건부 피해 규칙

- [ ] 스킬 데이터 화면에 `스킬 유형` 하위 탭을 만들고 유형 및 피해 증가 항목을 추가·수정·삭제한다.
- [ ] 항목마다 이름, 피해 그룹, 연산 방식, 조건을 저장한다. 같은 damage 그룹은 합산하고 별도 critical 그룹은 곱산한다.
- [ ] 보스 전용·일반 전용·디버프·조건 없음(모두)을 지원한다. 조건 충돌, 중복 ID, 알 수 없는 조건은 저장하지 않는다.
- [ ] 보스/일반 대상 및 디버프 유무별 적용 결과와 합산·곱산 순서를 fixture로 확인한다.

## Phase 4c — 장비 수동 입력과 스크린샷 후보

- [ ] 새 무기 유형을 목록에 등록하고 직업·장비 입력에서 선택할 수 있게 한다. 장비를 수동으로 추가·수정·삭제하며 잠재옵션도 버전 컨텍스트에서 관리한다.
- [ ] 장비명·정규화 이름·카테고리·부위·직업군·요구 레벨의 필수성, 버전별 고유성 및 무기 필드의 적용 조건을 검증한다.
- [ ] 여러 스크린샷을 선택해 장비 필드 후보를 만든다. 인식 제공자·외부 전송 여부·보관 기간은 처리 전에 동의받는다.
- [ ] 후보마다 대상 장비·필드, 제안값, 출처·신뢰도와 검토 상태를 보여준다. 충돌 후보를 비교하고 사용자 수락·거부·수정 뒤에만 확정값으로 반영한다. 이미지 없이 수동 입력만으로도 완료할 수 있다.
- [ ] 동의 없이 외부로 이미지를 보내지 않고, 기본적으로 원본 이미지를 DB·작업본·로그에 보관하지 않는다. 취소·인식 실패·수정 뒤 재검토 경로를 확인한다.

## 완료 조건

- [ ] 직업 → 스킬 → 새 무기 유형 → 장비로 이어지는 변경을 하나의 버전 작업본에서 재열어 검토할 수 있다.
- [ ] 검토 전 스크린샷 후보가 확정 장비값 또는 DB publish 대상에 들어가지 않는다.
- [ ] 참조 누락·중복·조건 충돌, 작업본 저장 실패, 이미지 분석 실패 시 기존 작업본이 유지된다.
- [ ] 실제 Electron에서 각 탭과 신규·수정·삭제·재열기 흐름을 검증하고 [REVIEW](../REVIEW.md)에 기록한다.

**다음:** [Phase 05 — DB dry-run 및 반영](./Phase05.md).
