# Generated Skill Metadata Refactor

브랜치: `refactor/generated-skill-metadata`

이 문서는 현재 브랜치에서 진행한 스킬 generated 메타데이터 리팩터링 작업을 정리한다.

## 목적

- generated 스킬 데이터에 `linkedGroups` 메타데이터를 포함한다.
- 5차/6차 스킬 코어 데이터를 역할별로 분리한다.
- 5자리 `classId` 기반 데이터 생성을 제거하고 raw `jobID` 기반 구조로 정리한다.
- generator가 생성한 결과물과 수동으로 관리해야 하는 스킬 메타데이터의 경계를 명확히 한다.

## Generator 변경

`packages/generator/src/generated/1.2.424/skills/*.ts` 생성 결과가 다음 형태로 변경됐다.

```ts
export const skillData = {
  skillGroups: {},
  linkedGroups: {},
} as const;
```

변경된 주요 파일:

- `packages/generator/scripts/generate-game-skills-by-raw-job.mjs`
- `packages/generator/src/game-skill/generator.ts`
- `packages/generator/src/game-skill/types.ts`

`linkedGroups`에는 5차 강화 코어와 5차 스킬 코어의 연동 그룹 정보가 포함된다.

generated 결과물은 스크립트 실행으로 재생성 가능하므로, 커밋 대상에서 제외하거나 `.gitignore` 정책을 별도로 정리할 수 있다.

## Generated Skill File Name

듀얼블레이더 generated 파일명을 현재 class key 기준에 맞춰 정리했다.

- 삭제: `dual-blade.ts`
- 추가: `dual-blader.ts`

현재 기준 key는 `dual-blader`다.

## Fifth Skill Data

`packages/game-data/skill/src/fifth` 아래 데이터를 역할별로 분리했다.

추가/정리된 주요 파일:

- `skill-core.ts`
- `enhancement-core.ts`
- `enhancement.ts`

`enhancement-core.ts`는 기존 `enhancement.ts`와 분석용 `temp4.ts`를 합친 결과다.

- `skills`: 실제 `"강화"`가 붙은 5차 강화 코어명
- `linkedGroups`: 기존 `enhancement.ts`의 연동 그룹
- `FifthEnhancementCoreName<'hero'>` 형태의 직업별 자동완성 타입 제공

기존 `enhancement.ts`는 호환을 위해 `enhancement-core`를 re-export한다.

## Sixth Skill Data

기존 `packages/game-data/skill/src/sixth/core.ts`를 제거하고 역할별 파일로 분리했다.

추가된 주요 파일:

- `common-core.ts`
- `mastery-core.ts`
- `skill-core.ts`

`sixth/enhancement.ts`는 fifth skill core 데이터를 기반으로 6차 강화 기준 데이터를 re-export하는 방향으로 정리했다.

## Class Code / Job ID

5자리 `classId` 계열을 제거했다.

삭제된 주요 파일:

- `packages/game-data/class/src/classCode.json`
- `packages/generator/scripts/generate-class-json.mjs`
- `packages/generator/src/class/*`

새로 추가된 파일:

- `packages/game-data/core/src/taxonomy/class-code.ts`

`class-code.ts`에서는 raw `jobID`를 stage 구조로 정리한다.

```ts
export const classJobStages = [0, 1, 1.5, 2, 2.5, 3, 4, 6] as const;
```

듀얼블레이더의 `1.5`, `2.5` 전직 단계도 반영했다.

## Name Correction

`메지션`으로 되어 있던 표기를 `매지션`으로 수정했다.

영향 범위:

- `packages/game-data/core`
- `packages/game-data/class`
- `packages/game-data/skill/src/raw/job.ts`
- generated taxonomy/json

## CSV Conversion Script

`scripts/convert-csv-to-json.mjs` 동작을 변경했다.

현재 동작:

- `data/<version>/` 바로 아래 `.csv` 파일을 탐색한다.
- `json/` 폴더를 만들고 JSON 변환 결과를 저장한다.
- `csv/` 폴더를 만들고 원본 CSV 파일을 이동한다.
- 같은 이름의 CSV가 이미 `csv/` 안에 있으면 덮어쓰지 않고 에러를 낸다.

예시:

```txt
data/1.2.425/ms_skill.csv
```

실행 후:

```txt
data/1.2.425/json/ms_skill.json
data/1.2.425/csv/ms_skill.csv
```

## Temporary Analysis Files

5차 스킬 데이터를 분석하기 위해 임시 파일들이 추가되어 있다.

- `packages/game-data/skill/src/fifth/temp.ts`
- `packages/game-data/skill/src/fifth/temp2.ts`
- `packages/game-data/skill/src/fifth/temp3.ts`

용도:

- jobID별 스킬명 추출
- `invisible` 기준 분류
- `쓸만한` / `강화` 스킬 분류

최종 구조에 필요 없다면 커밋 전에 제거 대상이다.

## Remaining Cleanup

- generated 스킬 결과물을 커밋할지, `.gitignore`로 제외할지 결정한다.
- `packages/generator/src/generated/1.2.424/skills.(1)/` 백업 폴더는 커밋하지 않는 것이 좋다.
- `temp.ts`, `temp2.ts`, `temp3.ts`를 최종 코드에 남길지 제거할지 결정한다.
- generator 변경과 generated 결과물을 같은 커밋에 둘지 분리할지 결정한다.

## Verification

작업 중 확인한 주요 검증 명령:

```bash
pnpm --filter @maple/data-core run typecheck
pnpm --filter @maple/data-skill run typecheck
pnpm --filter @maple/generator run typecheck
node --check scripts/convert-csv-to-json.mjs
```
