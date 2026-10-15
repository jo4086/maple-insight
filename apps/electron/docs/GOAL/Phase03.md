# Phase 03 — 버전별 원본 JSON 비교

**상태: 대기.** [Phase 02](./Phase02.md)는 검증을 마쳤다. 이 문서는 다음 단계 계획이며 아직 착수하지 않았고, 체크박스는 완료 표시가 아니다.

관련 문서:
- [ROADMAP — Phase 3 상세 범위](../ROADMAP/Phase03.md) · [단계 목록](../ROADMAP.md#phase-03)
- [SPEC — 버전 비교 기본 요구사항](../SPEC/03-diff-edit.md#spec-diff-base) · [다섯 파일 비교 계약](../SPEC/06-phase-03-06.md#spec-phase-03)
- [아키텍처 — 버전 diff 설계](../ARCHITECTURE.md#architecture-phase-03)

## 사용자 결과

기존 UI의 **비교 버전**을 기준(`baseVersion`), **현재 버전**을 변경된 대상(`compareVersion`)으로 선택하고 두 버전에 공통으로 존재하는 파일 하나를 고른다. 파일 목록은 `ms_job.json`, `ms_skill.json`, `ms_skillH.json`, `ms_skillCommon.json`, `ms_skillLevel.json`이며 PVP 파일은 제외한다. **추가·변경**과 **삭제**를 별도 화면 영역으로 보고, 변경된 필드의 이전 값과 이후 값을 확인한다. 저장 버튼으로 `data/diff/<baseVersion>_to_<compareVersion>/<filename>`에 결과를 남긴다.

## 구현 범위

- [ ] 기준·비교 버전과 공통 파일 선택, 비교 진행·오류·빈 결과 상태를 제공한다.
- [ ] 파일별 식별자를 사용한다: Job `jobID`, Skill/SkillH `skillID`, SkillCommon `(skillID, commonName)`, SkillLevel `(skillID, level)`; ID는 앞자리 0을 보존한다.
- [ ] 레코드 순서만 다른 경우 변경으로 보지 않고, 식별자 변경은 삭제와 추가로 처리한다. 누락·중복 식별자 또는 한쪽 파일 누락은 추정하지 않고 오류로 표시한다.
- [ ] 추가와 삭제에는 전체 레코드를, 변경에는 식별자와 필드별 before/after를 표시한다. 목록 요약과 검색·필터를 제공한다.
- [ ] `baseVersion`, `compareVersion`, `add`, `modify`, `delete`를 담은 JSON을 저장한다. 동일 입력 재실행과 입력 해시가 달라진 산출물 교체를 구분한다.
- [ ] Electron main에서 허용 파일명·버전·경로를 검증한다. renderer는 파일 시스템에 직접 접근하지 않으며 원본 JSON은 수정하지 않는다.

## 완료 조건

- [ ] 다섯 파일별 fixture에서 추가·변경·삭제와 필드별 값이 맞다.
- [ ] 순서 변경, ID 앞자리 0, 중복·누락 ID, 한쪽 파일 누락을 검증한다.
- [ ] 실제 Electron에서 파일 선택부터 비교·두 영역 확인·저장·재열기까지 확인한다. 저장 실패가 기존 산출물을 훼손하지 않는다.
- [ ] 큰 결과에서 화면이 응답하며 선택 버전 변경 시 오래된 결과를 보여주지 않는다.
- [ ] 검증 결과를 [REVIEW](../REVIEW.md)에 기록한 뒤에만 완료 표시한다.

**다음:** [Phase 04 — 도메인 편집](./Phase04.md). 장비는 이 단계의 초기 다섯 raw JSON 비교 대상이 아니다.
