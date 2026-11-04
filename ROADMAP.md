# 프로젝트 로드맵

상태는 코드 존재가 아니라 종료 검증으로 판단한다. 앱별 상세 요구사항과 검증 기록은 각 앱 문서를 우선한다.

## 순서와 의존성

```text
Electron Phase 2 validation·작업본 완료
  -> Phase 3 버전 diff
  -> Phase 4 작업본 편집
  -> Phase 5 DB dry-run·명시 승인 publish
  -> Phase 6 타입·정적 데이터 생성
  -> 신뢰된 게임 데이터 소비 기능

캐릭터 API 계약 확정
  ├─ frontend 실제 데이터 표시
  └─ back 정규화·캐시 보강

수집 파이프라인 실행·품질 검증
  -> 캐릭터 이력 제공

신뢰된 게임 데이터 + 계산 규칙
  -> 아이템·스탯 시뮬레이션
  -> 보스 시뮬레이션
```

Electron Phase 2는 현재 최우선 경로다. Phase 0·1은 검증됐지만, Phase 2는 미커밋 변경과 미완료 UI·검증 항목 때문에 미검증이다. Phase 3부터 6까지는 순차 의존하며, 성공 publish로 ready가 된 버전만 생성과 신뢰된 게임 데이터 소비 기능의 입력이 된다. 캐릭터 계약과 frontend API UI는 Electron과 독립적으로 병행할 수 있고, 실제 API 표시는 Electron publish에 막히지 않는다. 다만 버전 게임 데이터에 의존하는 기능은 publish 뒤에 진행한다. 수집 이력은 파이프라인 스케줄과 품질 검증 뒤다. 시뮬레이션은 신뢰된 데이터 뒤다.

## 마일스톤

### M1. Electron Phase 2 검증 및 작업본

현재 목표는 `apps/electron/docs/GOAL.md`의 `EL-G002`다.

- validation 작업본 IPC와 UI를 완료한다.
- 파일·레코드·필드 issue, 정규화 전후 값, 경고 확인과 예외 사유, publish 가능 상태를 검증한다.
- 실제 흐름과 대용량 입력에서 renderer 응답성을 검증한다.

종료 확인:

- [ ] Electron `docs/GOAL.md`의 Phase 2 미완료 항목과 완료 조건을 검증 근거로 닫는다.
- [ ] Electron `docs/REVIEW.md`에 최신 검증 결과와 잔여 위험을 기록한다.
- [ ] Phase 2 변경 기준 node/web typecheck, 테스트, lint와 production build가 통과한다.

### M2. Electron 버전 데이터 반영과 생성

- Phase 3 diff, Phase 4 작업본 편집, Phase 5 dry-run·명시 승인 publish, Phase 6 생성기를 순서대로 완료한다.
- publish 성공으로 ready가 된 버전만 생성과 버전 게임 데이터 의존 기능의 입력으로 사용한다.

종료 확인:

- [ ] diff가 추가·수정·삭제를 안정 식별자로 표시한다.
- [ ] 작업본 편집은 검증된 작업본에서만 수행하고 변경 이력을 diff에 반영한다.
- [ ] dry-run은 DB를 변경하지 않고, 승인 없는 publish는 실행되지 않으며, publish 실패는 부분 DB 반영을 남기지 않는다.
- [ ] ready 버전에서 생성한 결과를 검토할 수 있다.

### M3. 캐릭터 API 계약과 공개 표시

Electron과 병행한다. 실제 API 표시 작업은 Electron publish의 선행 조건이 아니다.

- Back의 `/api/character/search` 응답, 특히 skill 배열을 계약으로 확정한다.
- frontend 타입·mapper·화면을 계약에 맞춘다.
- 기존 이미지·장비 표시를 확인하고 stat·ability·skill·symbol 등 실제 응답 필드를 화면에 단계적으로 연결한다. placeholder 열은 실제 값으로 교체하거나 미지원으로 명확히 구분한다.
- Redis, Nexon API key 사용 경계와 실패 응답을 확인한다.

종료 확인:

- [ ] 대표 캐릭터 검색에서 이미지·장비뿐 아니라 선택한 stat·ability·skill·symbol 데이터가 실제 API 응답과 일치해 frontend에 표시된다.
- [ ] frontend와 back의 skill 형태가 일치한다.
- [ ] 캐시와 외부 API 실패가 구조화된 오류로 보인다.

### M4. 수집과 이력 신뢰성

- 랭킹 수집 뒤 OCID, 캐릭터, 유니온 스냅샷과 계정 그룹화를 실행하는 파이프라인을 검증한다.
- 실행 주기, 재시도, 중복 처리, 품질 기준을 정한다.

종료 확인:

- [ ] 기본 실행이 랭킹 전용임을 넘는 전체 파이프라인을 실제 환경에서 검증한다.
- [ ] OCID 기준 이력과 그룹화가 닉네임 재사용을 잘못 연결하지 않는다.

### M5. 시뮬레이션

- 기존 스탯·심볼 계산기를 성공 publish된 버전 데이터와 연결해 재현성을 검증한다.
- 아이템·스탯 비교 뒤 보스 계산을 새로 설계·구현한다.

종료 확인:

- [ ] 입력 버전과 규칙이 결과에 기록된다.
- [ ] 보스 시뮬레이션은 구현과 테스트가 끝나기 전 제공 기능으로 표시하지 않는다.

## 앱 문서

- Frontend: `apps/frontend/docs/react-query-guide.md`
- Back: `apps/back/docs/api-normalization-roadmap.md`, `apps/back/roadmap.md`
- Ingestor: `apps/ingestor/docs/db-structure.md`, `apps/ingestor/docs/grouping-rules.md`
- Electron: `apps/electron/docs/SPEC.md`, `apps/electron/docs/ROADMAP.md`, `apps/electron/docs/GOAL.md`, `apps/electron/docs/REVIEW.md`
