# 직업 taxonomy 표시 데이터 계약 요청

- 상태: **부분 — 단계 A 일부 구현, 이후 절차 계획**
- 소유 범위: 직업 대표 표시명, 전직 단계 원본명, taxonomy 관리·생성 절차
- 관련 요청: [직업 데이터 탭 복구 초안](./job-data-tab.md) · [요청 목차](./README.md)
- Phase 경계: 이 요청은 Phase 04 또는 REQ002 완료 근거가 아니다.

## 문제와 목표

구현 전에는 `class-code.ts`의 3212가 4차 `배틀메이지`인데도 버전별 DB 원본 `GameJob.jobName`인 `최상급 흑마법`이 `representativeName`으로 사용되어 대표 표시명과 원본 데이터의 의미가 섞였다.

이 요청은 원본을 손실 없이 보존하면서 사용자용 대표 이름을 taxonomy와 일치시킨다. 단계 A의 일부 표시 수정은 구현됐고, 나머지 표시 계약과 신규 직업을 한 권위 데이터에서 검토·승인·생성하는 절차는 제안 상태다.

## CURRENT — 단계 A 일부 구현 (2026-11-08)

- `representativeName`은 현재 버전 DB에 존재하는 4차 직업 ID의 taxonomy `className`을 사용한다. 3212는 DB 원본명 `최상급 흑마법`을 유지하면서 대표 목록에서 `배틀메이지`로 표시한다.
- `JobDataView`와 `JobEditView`는 전직 정보에서 DB 원본 이름과 4차 taxonomy 정식명을 별도 label로 표시한다.
- advancement 계약은 여전히 DB 원본 `jobName`을 보존한다. 모든 단계에 대한 `canonicalName`·`sourceJobName` 별도 typed field는 구현하지 않았다.
- 4차 ID 누락을 `missing-stage-4` 검토 상태로 노출하는 계약은 구현하지 않았다.
- 112 `히어로`, 212 `아크메이지(불,독)`, 3212 `배틀메이지` 대표 선택을 테스트했다.
- 구조화 단일 소스 JSON·generator, 신규 직업 승인 절차와 DB taxonomy snapshot 백업은 구현하지 않았다.

## 현재 권위와 불변 경계

- 현재 `class-code.ts`의 단계별 ID·`className`, `class-tree.ts`의 계열 구조·소속, `classifyJobId`의 후보·모호성 판정을 합친 taxonomy가 직업 분류와 표시명의 단일 권위다.
- `GameJob.jobName`은 수집된 버전별 원본 이름이다. taxonomy 표시명으로 덮어쓰거나 정규화하지 않는다.
- 현재 저장 계약, 원본 직업 ID, 로컬 복구 초안은 이 표시 수정으로 변경하지 않는다.
- 런타임 Electron은 저장소의 TypeScript·JSON 권위 파일을 직접 쓰지 않는다.
- DB schema, migration, seed, taxonomy snapshot 저장은 database 설계 검토와 사용자 명시 승인 전에는 추가하지 않는다.

## PROPOSED — 단계 A 완료 표시 계약

| 의미        | 필드 역할            | 출처                                 |
| ----------- | -------------------- | ------------------------------------ |
| 대표 표시명 | `representativeName` | 해당 계열 taxonomy의 4차 `className` |
| 단계 정식명 | `canonicalName`      | taxonomy 단계 항목의 `className`     |
| 단계 원본명 | `sourceJobName`      | 선택 버전 `GameJob.jobName`          |
| 원본 식별자 | `jobId`              | DB 원본 문자열 ID                    |

- 직업 목록과 대표 헤더는 DB에 존재하는 4차 ID의 taxonomy `className`을 사용한다. 3212의 대표 표시명은 `배틀메이지`다.
- 전직 단계 행은 `canonicalName`과 `sourceJobName`을 별도 의미로 전달하고, 화면에는 원본 이름을 명확히 구분해 보여준다. 같은 문자열이어도 두 역할을 합치지 않는다.
- taxonomy 계열에는 0·1·1.5·2·2.5·3·4·6차가 있을 수 있다. 5차 전용 직업 ID는 없으므로 5차 ID를 만들거나 추론하지 않는다.
- 하나의 ID가 여러 전직 트리에 공유될 수 있다. 모든 taxonomy 후보를 보존하고 한 트리 소유로 축소하지 않는다.
- 현재 버전 DB에 4차 ID가 없으면 다른 단계나 원본 이름을 대표로 승격하지 않고 `missing-stage-4` 검토 대상으로 남긴다.
- 분류 후보의 `className` 또는 단계가 둘 이상이면 임의 확정하지 않고 `ambiguous` 검토 대상으로 남긴다.
- 중복 정규화 ID가 있어도 원본 ID와 모든 원본 행을 보존한다. 대표 선택과 원본 데이터 보존을 분리한다.

## 미래 단일 소스 계약

미래 권위 데이터는 다음 정보를 가진 버전 지정 구조다.

- `schemaVersion`
- 안정적인 `classKey`
- 사용자용 `displayName`
- `affiliation`과 `classGroup`
- 단계 항목의 `stage`, 원본 문자열 `jobId`, `canonicalName`

공유 단계 ID는 여러 `classKey`가 참조할 수 있어야 한다. 구조화 데이터/JSON으로 이전할 때 이 파일 하나를 권위로 삼고 TypeScript taxonomy와 검증 산출물을 생성한다. 같은 내용을 손으로 관리하는 TypeScript와 JSON을 함께 두지 않는다. 전환이 완료되기 전에는 현재 `class-code.ts`·`class-tree.ts`·classifier 체계가 권위다.

## 신규 직업 변경 경로

1. Electron이 현재 버전 DB 원본과 권위 taxonomy를 비교해 로컬 검토 초안을 만든다.
2. 편집 화면이 `classKey`, 표시명, 소속, 직업군, 단계별 ID·정식명과 공유 ID 참조를 입력받는다.
3. preview/diff가 원본 이름과 taxonomy 이름, 신규·변경·삭제 항목, 공유 트리 영향, 누락 4차와 모호성을 분리해 보여준다.
4. validation이 schemaVersion, 중복 ID, 허용 단계, 4차 대표, 소속·직업군, 공유 참조, 원본 이름 보존을 검사한다.
5. 사용자가 diff와 검증 결과를 명시 승인한다.
6. 승인된 변경만 권위 데이터에 반영하고 TypeScript/API 산출물을 생성한다. 타입 검사와 분류·표시 테스트를 통과한 결과만 저장소 변경으로 제안한다.
7. 런타임은 소스 파일이나 DB 원본 행을 직접 수정하지 않는다.

## 불일치, 실패, rollback

- DB 원본명과 `canonicalName` 불일치는 정상적인 별도 데이터일 수 있다. 경고와 diff를 제공하되 자동 덮어쓰지 않는다.
- ID가 미분류·모호·중복이거나 4차가 누락되면 자동 승인을 막고 수동 검토 사유를 남긴다.
- 생성·타입 검사·분류 테스트·표시 테스트 중 하나라도 실패하면 권위 데이터와 생성 산출물을 함께 이전 상태로 되돌리고 초안과 실패 결과를 보존한다.
- 승인 뒤 입력 hash 또는 preview가 바뀌면 승인을 무효화하고 재검토한다.
- DB 버전별 taxonomy snapshot 백업과 원자적 반영은 database 설계 검토 및 별도 명시 승인 뒤에만 진행한다. 일부 snapshot만 반영되면 transaction 전체를 rollback한다.
- 복구 시 마지막 검증 완료 snapshot/생성 커밋으로 되돌린다. `GameJob.jobName` 원본은 rollback 대상 표시 데이터로 사용하지 않으며 덮어쓰지 않는다.

## ROADMAP

### 단계 A — 즉시 표시 수정

- [x] 대표 선택 결과에 taxonomy 4차 `className`을 `representativeName`으로 전달한다.
- [ ] 단계 행의 `canonicalName`과 `sourceJobName`을 분리하고 UI에서 원본 이름을 구분해 표시한다.
- [ ] 공유 ID의 복수 트리 후보, 0·1.5·2.5·6차, 5차 ID 부재를 유지한다.
- [ ] 4차 누락과 모호한 분류를 검토 상태로 노출하고 임의 fallback을 금지한다.
- [x] 기존 ID, 로컬 복구 초안, 필터·에디터 연결 동작의 회귀를 Chromium 모의 renderer에서 검증한다.

### 단계 B — 구조화 단일 소스와 생성 경로

- [ ] `schemaVersion`, `classKey`, `displayName`, `affiliation`, `classGroup`, 단계 항목 계약을 설계 검토한다.
- [ ] 현재 taxonomy를 손실 없이 구조화 단일 소스로 이관하고 중복 수기 TypeScript/JSON 관리를 제거한다.
- [ ] 단일 소스에서 TypeScript 분류·표시 데이터를 생성하는 재현 가능한 generator를 구현한다.
- [ ] Electron 신규 직업 초안, preview/diff, validation, 명시 승인, export/generation 흐름을 구현한다.
- [ ] 불일치 수동 검토, 승인 무효화, 생성 실패 rollback 절차를 검증한다.
- [ ] DB snapshot 설계를 별도 검토하고 사용자 명시 승인 뒤에만 버전별 백업을 구현한다.

## GOAL — 인수 기준

- [x] DB 원본명이 `최상급 흑마법`인 3212가 대표 목록에서 `배틀메이지`로 표시되고 전직 정보에는 원본명이 별도로 남는다.
- [x] 212는 `아크메이지(불,독)`, 112는 `히어로`를 대표 표시명으로 사용하며 fixture의 다른 원본명에 영향받지 않는다.
- [ ] class 표시 필드와 source 표시 필드의 타입·IPC·UI 의미가 분리된다.
- [ ] 공유 ID가 여러 트리에 남고 0·1.5·2.5·6차가 표시되며 5차 ID가 생성되지 않는다.
- [ ] 4차 ID 누락과 모호한 후보는 검토 대상으로 보이고 대표명이 임의 확정되지 않는다.
- [x] Chromium 모의 renderer의 데스크톱·모바일에서 목록, 전직 정보, 에디터 연결, 검색·필터 회귀가 없다.
- [ ] 미래 단일 소스 생성은 같은 입력에서 동일 결과를 만들고 수기 중복 taxonomy 파일이 없다.
- [ ] 승인 전후 diff, 검증 오류, 승인 무효화와 rollback이 재현 가능하다.
- [ ] DB 원본 이름 overwrite와 런타임 소스 쓰기가 발생하지 않는다.
- [ ] DB snapshot은 설계 검토와 명시 승인 없이는 생성·반영되지 않는다.

## REVIEW — 부분 검증 (2026-11-08)

- [x] 대표 표시 단위 테스트가 3212·212·112와 서로 다른 DB 원본명 fixture를 검증한다.
- [ ] 분류 테스트가 공유 ID, 특수 단계, 5차 ID 부재, 4차 누락과 ambiguity를 검증한다.
- [ ] IPC·renderer 테스트가 모든 단계의 `canonicalName`과 `sourceJobName` typed field 분리 및 기존 초안 호환을 검증한다.
- [x] Playwright가 Chromium 모의 renderer의 데스크톱·모바일 목록·전직 정보·에디터·필터를 검증한다.
- [x] Electron Node/Web typecheck가 통과한다.
- [x] Vitest 23개 파일·210개 테스트가 통과한다.
- [x] 변경 source 대상 lint가 통과한다.
- [x] 변경 source와 Playwright script Prettier 검사가 통과한다.
- [x] production `electron-vite build`가 통과한다.
- [ ] 실제 DB와 native Electron IPC에서 원본명 불일치·누락·모호성 표시를 검증한다.
- [ ] 구조화 단일 소스 단계는 generator 재현성, 잘못된 입력 거부, 승인 변경 감지와 rollback을 검증한다.

현재 검증은 taxonomy 4차 대표명과 DB 원본명 표시 분리 범위에 한정한다. 모든 단계의 별도 typed field, `missing-stage-4` 검토 상태, 미래 단일 소스·generator·승인 절차·DB 백업은 미구현이다. `DATABASE_URL`이 없어 실제 DB와 native Electron IPC는 검증하지 않았다. 이 기록은 Phase 04 또는 REQ002 완료 근거가 아니다.
