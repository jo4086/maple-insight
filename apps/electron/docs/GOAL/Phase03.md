# Phase 03 — 버전별 원본 JSON 비교

**상태: 완료(기존 검증).** raw JSON 비교와 후속 버전 UI·상태 변경은 검증했다. 독립 검토 뒤 UTC 출시일·한쪽 raw JSON 누락 설명을 보완하고 native 최종 재검증을 마쳤다. `failed` 상태와 test 환경은 현재 DB 행이 없어 native 화면에서 확인하지 못했다. 기존 Phase 03 성공 기록은 유지한다. [Phase 04](./Phase04.md)는 대기다.

관련 문서:

- [ROADMAP — Phase 3 상세 범위](../ROADMAP/Phase03.md) · [단계 목록](../ROADMAP.md#phase-03)
- [SPEC — 버전 비교 기본 요구사항](../SPEC/03-diff-edit.md#spec-diff-base) · [다섯 파일 비교 계약](../SPEC/06-phase-03-06.md#spec-phase-03)
- [검증 기록](../REVIEW/Phase03.md) · [아키텍처 — 버전 diff 설계](../ARCHITECTURE.md#architecture-phase-03)

## 사용자 결과

기존 UI의 **비교 버전**을 기준(`baseVersion`), **현재 버전**을 변경 대상(`compareVersion`)으로 선택하고 공통 파일을 고른다. 대상은 `ms_job.json`, `ms_skill.json`, `ms_skillH.json`, `ms_skillCommon.json`, `ms_skillLevel.json`이며 PVP 파일은 제외한다. 추가·변경과 삭제를 분리해 보고, 변경 필드의 이전·이후 값을 확인한다. 결과는 `data/diff/<baseVersion>_to_<compareVersion>/<filename>`에 저장한다.

## 완료 범위

- [x] 기준·비교 버전과 공통 파일을 선택하고, 진행·오류·빈 결과 상태를 제공한다.
- [x] 파일별 식별자를 사용한다: Job `jobID`, Skill/SkillH `skillID`, SkillCommon `(skillID, commonName)`, SkillLevel `(skillID, level)`; ID 앞자리 0을 보존한다.
- [x] 순서만 다른 레코드는 변경으로 보지 않고, 식별자 변경은 삭제와 추가로 처리한다. 누락·중복 식별자와 한쪽 파일 누락은 오류로 표시한다.
- [x] 추가·삭제에는 전체 레코드를, 변경에는 식별자와 필드별 before/after를 표시한다. 목록 요약·검색·필터·페이지 이동을 제공한다.
- [x] `baseVersion`, `compareVersion`, `add`, `modify`, `delete`와 입력 해시를 저장한다. 같은 입력은 재사용하고, 달라진 입력은 명시적 교체만 허용한다.
- [x] Electron main에서 허용 파일명·버전·경로·심볼릭 링크를 검증한다. renderer는 파일 시스템에 직접 접근하지 않고 원본 JSON은 수정하지 않는다.

## 완료 조건과 근거

- [x] 다섯 파일 fixture에서 identity별 추가·변경·삭제와 필드별 값을 검증했다.
- [x] 순서 변경, ID 앞자리 0, 중복·누락 ID, 파일 누락, 경로·심볼릭 링크 거부를 검증했다.
- [x] 해시 stale·tamper·쓰기 실패 시 기존 산출물 보존, 같은 입력 재사용, 명시적 교체를 단위 테스트했다.
- [x] native Electron에서 임시 production `1.2.419`/`1.2.424` fixture로 비교, 추가·변경·삭제, 저장·재열기·교체, 누락 파일, 빈 결과, 파일 변경 뒤 stale 결과 제거를 확인했다.
- [x] 대량 `ms_skillLevel` 173,665개 삭제에서 비교 1,690ms, 검색 234ms, 페이지 이동 63ms를 기록했다. 데스크톱·모바일 주변 화면도 확인했다.
- [x] [REVIEW](../REVIEW.md)에 Vitest, Node/Web typecheck, build, ESLint, Prettier, native 검증 결과를 기록했다.

native script는 `ms_job.json`, 작은 skill 파일, 대량 `ms_skillLevel.json`만 실제 비교한다. 다섯 파일 identity 의미론은 fixture 단위 테스트가 증명한다. 다섯 파일 각각의 native 흐름 전체를 모두 실행한 것은 아니다.

## 후속 UI·상태 변경 검증

- [x] sidebar `버전` 아래 `리스트`·`비교` 탐색과 실제 DB의 `ready`/`importing` 행 표시를 native Electron에서 확인했다.
- [x] 리스트에서 실제 DB의 버전, `releasedOn` 또는 `미등록`, `createdAt`, production 환경과 상태를 확인했다. 관리 JSON 없는 등록 버전의 오류·목록 유지도 확인했다.
- [ ] `failed` 제외와 test 환경 행 표시는 코드·자동 테스트 범위지만, 현재 DB에 해당 행이 없어 native 화면 검증은 미실행이다.
- [x] 재시작 뒤 유효한 현재 버전 복원과 잘못된 저장값의 fallback을 확인했다.
- [x] production과 React dev StrictMode에서 파일 목록 loading 종료, 누락 관리 JSON 설명, 버튼 재활성화와 비교·저장·재열기를 확인했다.
- [x] desktop/mobile에서 대시보드 비교 화살표 세로 중앙과 select를 포함한 앱 제어 화살표 glyph 가시성을 확인했다.
- [x] UTC 달력 날짜로 `releasedOn`을 표시하는 Pacific 시간대 회귀 테스트와, 한쪽 raw JSON 누락의 파일명·버전 설명 단위 테스트를 추가했다.
- [x] 위 독립 검토 보완 뒤 native Electron 최종 재검증 결과를 기록했다.

**다음:** [Phase 04 — 도메인 편집](./Phase04.md). 장비는 이 단계의 초기 다섯 raw JSON 비교 대상이 아니다.
