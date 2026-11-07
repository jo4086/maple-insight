# 직업 데이터 탭 작업본 요청

- 상태: **부분 구현 — 로컬 복구 초안과 화면 검증 완료, native·DB 반영 대기**
- 범위: 버전별 직업 상세, 복구 초안 편집, 신규 직업 알림, 무기 유형 후보
- 시각 기준: `screenshots/manual/electron/maple-insight-job-data-ui-state-storyboard.png`
- 관련 계획: [Phase 4 직업·스킬 편집](../GOAL/Phase04.md) · [Phase 5 DB 반영](../GOAL/Phase05.md) · [요청 목차](./README.md)
- Phase 상태: 이 독립 요청은 Phase 4 완료 근거가 아니며 기존 대기·미완료 상태를 바꾸지 않는다.

## 결정된 경계

사용자는 **초안 우선**과 **DB 별도 승인**을 선택했다. 현재 구현은 Electron의 로컬 복구 초안이며 승인된 Phase 4 edit workbench 또는 Phase 5 DB publish 입력이 아니다. 실제 직업·무기 유형 등록과 관계 저장은 별도 DB 설계 검토와 사용자 승인 뒤에만 진행한다.

## 현재 구현

- 선택 버전의 사용자 직업 목록과 상세 기본 정보를 조회한다. 직업군·소속 필터와 ID·한글명·영문명 검색을 제공한다.
- 상세 화면에서 영문 이름, 직업군, 소속, 주·부스탯을 인라인 편집한다. 저장 시 해당 직업의 전체 `JobDraft`를 복구 저장소의 `drafts.json`에 반영한다.
- 전체 편집 화면에서 기본 정보와 기존 무기 유형을 선택하고 새 무기 유형 후보를 추가한다. 후보 필드는 UUID key, category, part, 영문 이름, 직업군, 손 타입, 무기 상수다.
- 전체 편집 화면은 변경 뒤 700ms에 복구 초안을 자동 저장하며 저장 버튼으로 재시도할 수 있다. optimistic revision 충돌을 검사하고 최신 입력 위에 이전 저장 응답을 덮지 않는다.
- 저장 위치는 `.job-draft-recovery/<environment>/<version>/<recoveryId>/drafts.json`이다. `current.json`이 현재 UUID를 가리킨다. 저장은 임시 파일 rename으로 교체하며 버전별 복구 초안을 다시 조회한다.
- 미저장 인라인 변경 또는 자동 저장 대기·진행 중에는 다른 직업·버전·페이지 이동과 창 종료 경고를 제공한다.
- 신규 직업 알림은 이전 버전과 현재 버전 사이에 **이미 저장된** `ms_job.json` diff의 `add`만 읽는다. 비교를 자동 실행하거나 diff를 새로 만들지 않는다.
- `스킬 정보` 영역과 기본 정보 외 상세 탭 이름은 자리만 있으며 데이터·상호작용은 없다.

## 제한과 미완료

- 현재 복구 저장소에는 Phase 4 `changeSetId`, manifest, validation/raw input hash, canonical hash, 상태 전이 또는 승인 무효화 계약이 없다.
- 저장된 `JobDraft` 값과 revision은 재열리지만, 저장 전 dirty 상태나 버려진 입력 자체를 복원하지 않는다.
- 시스템 직업은 목록과 저장 대상에서 제외한다. 일반 직업의 수동 제외·재포함 override와 사유·reviewer·이력은 없다.
- 신규 직업 알림은 저장된 직업 diff만 표시한다. 자동 비교, 스킬 변화 요약, 여러 상세 탭 데이터는 없다.
- 초안은 최신 전체 값과 revision만 유지한다. 필드별 mutation history, before hash, review 상태 또는 superseded 이력은 없다.
- 새 무기 후보에는 별도 `normalizedPart`, 출처, review 상태, 공격 속도, 무기 상수 예외가 없다. 저장 시 공백 제거 identity로 catalog 중복만 검사한다.
- 새 무기 후보는 로컬 초안 옵션이다. 전역 `WeaponType` 등록, 다른 직업에서의 공유, DB seed 또는 migration을 수행하지 않는다.
- 이 복구 초안은 dry-run, 승인, publish, `ready` 전환과 연결되지 않는다.
- 스킬 정보·전직 정보·링크 스킬·기타 데이터는 placeholder다. 직업-스킬 연결은 후속 범위다.

## 후속 DB 목표

현재 DB에는 `GameJob`과 `WeaponType`의 관계가 없다. `WeaponType.allowedJobIds`는 catalog 속성 배열이며 버전별 `GameJob` 관계를 대신하는 승인된 스키마가 아니다. 직업 보강 metadata 모델, 관계의 버전성·FK 방향과 삭제 정책은 database 설계 리뷰와 사용자 승인이 필요하다. 승인 전에는 이 요청을 근거로 schema, migration, seed 또는 실제 DB 쓰기를 진행하지 않는다.

승인 이후 목표는 같은 승인된 입력에서 **직업 보강 등록, 필요한 새 무기 유형 등록, 직업-무기 연결**을 하나의 DB transaction으로 처리하는 것이다. 중복 catalog 충돌, 직업 저장 또는 관계 저장 중 하나라도 실패하면 전체를 rollback한다. Phase 5의 dry-run, 동일 hash 승인, 부분 반영 금지와 작업본 보존 정책을 적용한다. 이 목표는 현재 구현 범위가 아니다.

## 남은 작업

- [ ] 복구 초안을 Phase 4 edit workbench로 승격할지 별도 변환 입력으로 둘지 설계한다.
- [ ] dirty 복원, 제외 override, 변경 이력과 미저장 discard 경계를 정의하고 구현한다.
- [ ] 신규 직업 알림의 자동 비교 여부와 스킬 변화 표시 범위를 결정한다.
- [ ] 스킬 정보 placeholder를 실제 직업-스킬 연결 흐름으로 구현한다.
- [ ] 무기 후보의 누락 metadata와 DB transaction 스키마를 별도 승인받는다.
- [ ] native Electron에서 인라인 저장, 자동 저장·충돌, 재열기, 이동 경고, 알림과 무기 후보를 검증한다.

## REVIEW — 부분 검증

- Electron Node/Web 및 `@maple/db` TypeScript 검사, Electron production build와 Vitest 23개 파일·201개 테스트가 exit 0이었다. 복구 저장·재열기, 버전 격리, revision 충돌, 심볼릭 링크 거부, 무기 category·중복 검증과 알림 모델을 포함한다.
- Playwright Chromium renderer 모의 데이터 검증이 exit 0이었다. 데스크톱 1480×920·모바일 390×844에서 필터·검색·인라인 일괄 적용과 이동 경고, 전체 편집·무기 후보·자동 저장·재진입, 신규 직업 알림·이동·초안 재열기, 저장/조회 실패와 다른 화면 이동을 확인했다. 이미지: `screenshots/playwright/electron/job-data-e2e-{desktop,mobile}.png` (Git 제외).
- 실제 PostgreSQL 연결에 필요한 `DATABASE_URL`이 없어 native Electron·실제 DB IPC 검증은 수행하지 못했다. 모의 저장 동작과 실제 파일 저장의 end-to-end 통합은 미검증이다.
- DB 설계 승인과 schema/migration/transaction 검증은 진행하지 않았다.

## REVIEW — UI 보완 검증 (2026-11-07)

- 직업 상세의 편집 행 geometry를 고정하고 select를 행 안쪽에 배치했다. 직업 페이지 shell padding을 제거하고 각 내부 영역에 margin을 두었다.
- 사이드바에 직업 정보·편집기 accordion과 picker를 제공한다. 다른 상세 탭은 활성 전환되는 빈 화면으로 유지한다.
- checkbox OR/AND 필터를 넓히고 reset 구분선을 표시했다. 직업 목록 scrollbar는 숨기고 전역 scrollbar는 얇게 표시한다.
- navbar bell에 스크린샷 성공·오류 알림을 누적한다. 일반 push도 사용할 수 있으며 성공 banner는 표시하지 않는다.
- Web typecheck, 대상 Vitest 11개, production `electron-vite build`, ESLint·Prettier가 모두 exit 0이었다.
- Playwright Chromium 모의 renderer 상호작용 스크립트가 exit 0이었다. desktop 1480×920·mobile 390×844에서 직업 필터, 탭, 편집·저장·이동 경고, editor route, 스크린샷 알림과 route/theme 회귀를 확인했다. 이미지: `screenshots/playwright/electron/job-data-e2e-{desktop,mobile}.png` (Git 제외).
- native Electron screenshot IPC, 실제 screenshot PNG 저장과 실제 DB 연동은 검증하지 않았다. 모의 capture만 확인했으며 이 기록은 Phase 04·REQ002 완료 근거가 아니다.
