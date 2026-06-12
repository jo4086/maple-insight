# Packages

## Build Order

직업 taxonomy 데이터는 `@maple/data-core`에 입력 데이터와 생성 결과가 함께 있고,
생성 로직은 `@maple/generator`에 있다.

관련 파일:

- 입력 데이터: `game-data/core/src/taxonomy`
- 생성기 입력 설정: `game-data/core/src/taxonomy/generator/input.ts`
- 생성 결과: `game-data/core/src/taxonomy/generator/generated.ts`
- 생성 로직: `generator/src/taxonomy/generator.ts`
- 실행 스크립트: `generator/scripts/generate-taxonomy-affiliation-class.mjs`

현재 필요한 빌드 순서는 다음과 같다.

1. `@maple/data-core`를 초기 빌드한다.
2. `@maple/generator`의 class/taxonomy 생성기를 빌드하고 실행한다.
3. 갱신된 생성 결과를 포함해 `@maple/data-core`를 다시 빌드한다.
4. `@maple/data-equipment`, `@maple/data-skill` 등 나머지 패키지를 빌드한다.
5. 전체 generator를 빌드하고 나머지 데이터를 생성한다.

```text
data-core 초기 빌드
-> class/taxonomy 생성
-> data-core 최종 빌드
-> 나머지 패키지 빌드
-> 나머지 데이터 생성
```

## Bootstrap Problem

`@maple/data-core`는 다음 생성 파일을 공개 API로 내보낸다.

```text
game-data/core/src/taxonomy/generator/generated.ts
```

하지만 이 파일을 만드는 코드는 `@maple/generator`에 있고, generator는 빌드 과정에서
`@maple/data-core`와 다른 game-data 패키지의 빌드 결과를 참조한다.

따라서 생성 파일이 없는 완전히 깨끗한 상태에서는 다음 순환 관계가 생긴다.

```text
data-core 빌드에는 generated.ts가 필요
generated.ts 생성에는 generator 빌드가 필요
generator 빌드에는 data-core와 다른 패키지 빌드가 필요
```

현재는 `generated.ts`를 Git에 포함해 초기 `data-core` 빌드가 가능하도록 한다.

다음 규칙을 지켜야 한다.

- `generated.ts`를 `.gitignore`에 추가하지 않는다.
- taxonomy 입력을 변경하면 생성기를 실행하고 생성 결과도 함께 커밋한다.
- 생성 파일을 직접 수정하지 않는다.
- 생성 이후 `data-core`를 다시 빌드하거나 타입 검사한다.

## Current Limitation

현재 `@maple/generator`의 `generate:taxonomy-affiliation-class` 스크립트는 전체 generator
빌드와 `prebuild` 의존 패키지 빌드를 거친다.

따라서 아직 class/taxonomy만 독립적으로 bootstrap하는 명령은 아니다. 깨끗한 환경에서
위 빌드 순서를 안정적으로 자동화하려면 다음 작업이 필요하다.

1. class/taxonomy 생성기를 전체 generator 엔트리와 분리한다.
2. 해당 생성기가 `data-core`의 생성 결과나 equipment/skill 빌드에 의존하지 않게 한다.
3. 루트에 bootstrap 전용 스크립트를 추가한다.
4. CI에서 생성 결과가 최신인지 검사한다.

목표 빌드 순서는 다음과 같다.

```text
class/taxonomy generator
-> data-core
-> equipment/skill 등 나머지 패키지
-> 전체 데이터 generator
```
