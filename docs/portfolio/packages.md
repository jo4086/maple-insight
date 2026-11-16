# 공통 패키지 분석

패키지는 앱 간 재사용만을 위한 모음이 아니라 **데이터 출처, 계약, 저장, 생성, 계산의 책임 경계**다. 이름이 비슷한 패키지도 입력과 출력이 다르다. [패키지 개요](../../packages/README.md).

| 영역 | 주요 패키지 | 현재 책임과 근거 |
| --- | --- | --- |
| 외부 응답 타입 | `api-types/character`, `ranking`, `union` | Nexon 원본 형식 타입. [README](../../packages/api-types/README.md) |
| 앱 계약 | `contracts/domain`, `internal`, `nexon` | 정규화된 도메인 계약, 내부 코드 체계·규칙, Nexon 관련 계약. [domain index](../../packages/contracts/domain/src/index.ts) |
| 정적 게임 데이터 | `game-data/core`, `class`, `equipment`, `skill`, `potential`, `monster`, `symbol` 등 | 직업 분류, 장비·스킬·보스·심볼 데이터와 타입의 소유 패키지. [game-data 경로](../../packages/game-data/package.json) |
| DB | `database/db` | Prisma schema·migration, client, runtime repository, 관리 API. [DB 아키텍처](../../packages/database/db/docs/ARCHITECTURE.md) |
| 관리 CLI | `database/data-admin` | 버전·입력 경로 결정, seed·export 실행. DB 쓰기는 `@maple/db`에 위임. [README](../../packages/database/data-admin/README.md) |
| 생성 | `bootstrap`, `generator` | bootstrap은 core taxonomy 생성의 초기 순환 해소, generator는 직업·스킬·장비·보스 등 결과 생성. [빌드 순서](../../packages/README.md) |
| 계산 | `simulator`, `calculator` | 스탯·심볼 계산 및 별도 기본 계산 로직. 보스 시뮬레이션 완료를 뜻하지 않음. [simulator index](../../packages/simulator/src/index.ts), [calculator index](../../packages/calculator/src/index.ts) |

## DB와 데이터 수명 주기

[Prisma schema](../../packages/database/db/prisma/schema.prisma)에는 랭킹 실행·raw page, OCID, 검색 이력, 유니온 랭킹, 그룹, 게임 데이터 버전·raw 레코드, 직업·스킬, 장비·무기 타입 모델이 있다. 한 DB에 모델이 있다고 해서 모든 경로가 제품에서 연결됐다는 뜻은 아니다. `@maple/db`는 runtime repository와 admin API를 구분하고, `@maple/data-admin`은 CLI 입력과 실행 결과를 담당한다. [DB README](../../packages/database/db/README.md).

기존 `data-admin`의 bundle seed는 `raw → gameData → equipment`를 순서대로 처리하지만 세 작업을 하나의 통합 트랜잭션으로 묶지는 않는다. 따라서 이 스크립트를 Electron Phase 05의 무변경 dry-run·명시 승인·원자적 publish로 설명하지 않는다. [data-admin README](../../packages/database/data-admin/README.md), [Electron Phase 05](../../apps/electron/docs/GOAL/Phase05.md).

## 생성과 빌드 의존성

`data-core`가 공개하는 생성 taxonomy 파일을 만들기 위해 전체 generator를 먼저 빌드하면 순환이 생긴다. `bootstrap`이 data-core 원천만 읽어 그 파일을 갱신하고, 이후 data-core·나머지 데이터 패키지·generator를 빌드하는 순서를 택했다. 생성 파일은 깨끗한 checkout을 위해 Git에 포함된다. 이는 **빌드 그래프 설계 사례**로 설명할 만하다. [패키지 README](../../packages/README.md).

현재 남은 작업은 깨끗한 checkout의 전체 생성 검증과 CI의 생성 결과 최신성 검사다. legacy game-data 제거 여부도 결정되지 않았다. 이 부분은 패키지 README의 남은 작업 목록을 따른다.

## 계산 로직의 현재 범위

`@maple/simulator`에는 스탯·심볼 계산기와 테스트가 있다. `@maple/calculator`에는 기본 캐릭터 계산과 임시 skill delay 코드가 있다. 데이터 원천, 계산 규칙, 사용자 UI까지 묶인 검증된 시뮬레이터 제품은 아직 아니다. [simulator 소스](../../packages/simulator/src/index.ts), [calculator 소스](../../packages/calculator/src/index.ts), [루트 로드맵](../../ROADMAP.md).

## 무기 타입 작업의 정확한 위치

DB에는 전역 무기 타입 catalog와 버전별 장비 연결·fallback 조회 API가 있지만, 앱 소비자는 아직 repository로 전환되지 않았다. DB의 `REQ001-P02`~`P04`는 진행 중이며 최종 소비자 검증 `P05`는 대기다. 일부 데이터와 제약 검증을 전체 무기 데이터 체계 완료로 쓰지 않는다. [현재 DB 아키텍처](../../packages/database/db/docs/ARCHITECTURE.md), [DB 로드맵](../../packages/database/db/docs/ROADMAP.md).
