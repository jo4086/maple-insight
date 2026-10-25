## 7. 후속 설계 문서 교차 점검 (2026-10-14)

### 범위와 판정

| 항목 | 내용 |
| --- | --- |
| 범위 | `SPEC.md`, `ROADMAP.md`, `GOAL.md`, `ARCHITECTURE.md`의 계획 일관성 |
| 방법 | 문서 간 요구사항·단계·현 구현 경계 교차 검토 |
| 결과 | 문서 전용 점검 완료. 새 기능 구현 또는 실행 검증은 수행하지 않음 |

### 확인 내용

- Phase 3은 `ms_job.json`, `ms_skill.json`, `ms_skillH.json`, `ms_skillCommon.json`, `ms_skillLevel.json`만 비교 대상으로 정하고 `ms_skillPVPCommon.json`을 제외한다.
- diff는 명시 identity, 중복·identity 누락·파일 누락 오류, `baseVersion`·`compareVersion`·`add`·`modify`·`delete` 계약과 필드 before/after를 계획한다.
- raw JSON, diff 산출물, 편집 작업본, DB publish의 소유 경계를 분리했다.
- 새 직업 보강, 스킬 연결·정적 수식 검사, 장비 수동·스크린샷 후보 검토, 피해 규칙 우선순위와 fixture 수용 기준을 계획에 반영했다.
- 현재 `GameJob`, raw 지향 `GameSkill` 계열, `EquipmentItem`에 없는 metadata·rule은 migration 제안으로만 기록했다.
- 스킬 유형 하위 탭과 Phase 3~6은 미구현 계획이며, Phase 2 `EL-G002` 상태를 변경하지 않았다.

### 미검증 및 제한

이 절은 문서 교차 점검만 기록한다. diff, 작업본 편집, 스크린샷 처리, migration, dry-run, publish, generator의 구현·테스트·실제 Electron 검증은 수행하지 않았다. Phase 2의 기존 native IPC, 대용량 renderer 응답성, class 외 도메인 coverage 미검증도 그대로 남는다.

## 8. Phase별 목표 문서 분리 점검 (2026-10-15)

- `GOAL.md`는 진행 중인 Phase 2의 유일한 현재 목표로 유지했다. `GOAL/Phase03.md` ~ `Phase06.md`는 대기 중인 후속 단계의 계획·체크리스트로 분리했다.
- `ROADMAP.md`의 단계 목록과 각 Phase 범위에서 해당 목표 문서로 이동할 수 있게 했다. 목표 문서는 다시 ROADMAP, SPEC, 아키텍처의 관련 절로 연결했다.
- 상대 경로와 명시적 앵커 링크를 검사해 대상 문서·앵커가 모두 존재함을 확인했다. `git diff --check -- apps/electron/docs`를 통과했다.
- 문서만 수정했다. Phase 3~6의 기능 구현·테스트, 실제 Electron 화면 검증은 수행하지 않았다. Phase 2는 여전히 진행 중이다.

## 9. 200줄 문서 분리 점검 (2026-10-15)

- `GOAL/README.md`를 진행 상태의 기준으로 두고 기존 Phase 02 목표를 `GOAL/Phase02.md`로 옮겼다. Phase 03~06은 계획 상태를 유지한다.
- 요구사항 ID와 세부 내용을 생략하지 않고 기존 SPEC을 `SPEC/README.md`와 주제별 여섯 문서로 분리했다. ROADMAP은 단계별 여덟 문서, REVIEW는 기간별 세 기록과 각각의 짧은 목차로 나눴다.
- 문서별 200줄 상한, 로컬 문서 링크·앵커, 변경 공백을 검사했다. 이전 날짜의 REVIEW 기록에 나온 옛 파일명은 당시 상태를 나타내므로 고치지 않았다.
- 앱 구현·테스트·Electron 실행 검증은 하지 않았다. 현재 목표 Phase 02의 미검증 항목은 그대로 남아 있다.
