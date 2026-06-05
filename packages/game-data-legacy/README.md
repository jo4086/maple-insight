# game-data

## Infomation

package-name: `@maple/game-data`
devDependencies: [`esbuild-plugin-alias`, `tsup`]

## Purpose

TODO: 이 패키지가 제공하는 게임 데이터의 범위와 사용처를 작성한다.

## Source Structure

`src` 하위 폴더는 도메인별 원천 데이터와 조합용 타입/상수를 분리한다.

### `src/affiliation`

TODO: 소속군 데이터의 역할을 작성한다.

Rules:

- TODO

### `src/class`

TODO: 직업 데이터의 역할을 작성한다.

Rules:

- TODO

### `src/equipment`

TODO: 장비 데이터의 역할을 작성한다.

Rules:

- TODO

### `src/force`

TODO: 포스 데이터의 역할을 작성한다.

Rules:

- TODO

### `src/json`

TODO: JSON 출력/중간 산출물의 역할을 작성한다.

Rules:

- TODO

### `src/monster`

TODO: 몬스터 및 보스 데이터의 역할을 작성한다.

Rules:

- TODO

### `src/potential`

TODO: 잠재능력 데이터의 역할을 작성한다.

Rules:

- TODO

### `src/raw`

TODO: 정제 전 원본 데이터의 역할을 작성한다.

Rules:

- TODO

### `src/skill`

TODO: 스킬 데이터의 역할을 작성한다.

Rules:

- `skill.ts`: 스킬 목록(`skillName.ts`) 타입
- `skill-meta.ts`: 스킬 메타(`skillMeta.ts`) 타입
- `skill-attack.ts`: 스킬 공격값(`skillAttack.ts`) 타입
- `skill-stat.ts`: 스킬 스탯값(`skillStat.ts`) 타입
- `skill-modifier.ts`: 스킬 수치 변경값(`skillModifier.ts`) 타입
- `skill-duration.ts`: 스킬 지속시간(`skillDuration.ts`) 타입
- `skill-cooldown.ts`: 스킬 재사용 대기시간(`skillCooldown.ts`) 타입
- `skill-delay.ts`: 스킬 딜레이(`skillDelay.ts`) 타입
- `skill-defense.ts`: 스킬 방어효과(`skillDefense.ts`) 타입
- `skill-debuff.ts`: 스킬 디버프(`skillDebuff.ts`) 타입
- `skill-formula.ts`: 스킬 레벨별 수식 타입과 헬퍼
- `skill-value.ts`: 스킬 값 통합 타입

Subfolders:

- `src/skill/class`: 직업별 스킬 데이터 모음
- `src/skill/common`: 공통되는 스킬 데이터 모음 (`all`, `affiliation`, `class-group`)
- `src/skill/types`: `src/skill/class`, `src/skill/common`에서 사용하는 스킬 타입 정의

### `src/starforce`

TODO: 스타포스 데이터의 역할을 작성한다.

Rules:

- TODO

### `src/stat`

TODO: 스탯 키와 계산 입력 데이터의 역할을 작성한다.

Rules:

- TODO

### `src/symbol`

TODO: 심볼 데이터의 역할을 작성한다.

Rules:

- TODO

## Data Authoring Rules

TODO: 공통 데이터 작성 규칙을 작성한다.

- TODO: 파일명 규칙
- TODO: export 이름 규칙
- TODO: 타입 import 규칙
- TODO: `as const satisfies` 사용 규칙
- TODO: 원본 데이터와 계산용 파생 데이터 구분 규칙

## Skill Data Rules

TODO: 스킬 데이터 작성 규칙을 작성한다.

- `skillName.ts`: 스킬명, 전직차수, 공용그룹, 연동/파생 관계 정의
  - `internalSkills`: 스킬창에 직접 노출되지 않는 계산용 내부 스킬
  - `linkedGroups`: 레벨이 같이 오르는 스킬 묶음
  - `derivedGroups`: 특정 스킬에서 파생되는 스킬 관계

- `skillMeta.ts`: 스킬 레벨, 효과 종류, 선행 조건, 내부 스킬 여부 정의
  - `vmatrixEnhanceCore`: 5차 강화코어
  - `hexamatrixEnhanceCore`: 6차 강화코어

- `skillAttack.ts`: 공격 퍼뎀, 타수, 대상 수, 발동 조건 정의
- `skillStat.ts`: 패시브/버프 스탯 증가값 정의
- `skillModifier.ts`: 다른 스킬의 수치 변경 효과 정의
- `skillDuration.ts`: 스킬 지속시간 정의
- `skillCooldown.ts`: 스킬 재사용 대기시간 정의
- `skillDelay.ts`: 스킬 시전 딜레이와 키다운 정보 정의

## Build

TODO: 빌드 명령과 출력 위치를 작성한다.

```bash
pnpm --filter @maple/game-data run build
```

## Typecheck

TODO: 타입체크 기준을 작성한다.

```bash
pnpm --filter @maple/game-data run typecheck
```
