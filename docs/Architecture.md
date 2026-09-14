# Architecture

## Overview

이 저장소는 pnpm workspace 기반 모노레포다. 실행 가능한 애플리케이션은 `apps/`, 여러 애플리케이션에서 재사용하는 타입·데이터·도구는 `packages/`에서 관리한다.

## Apps

```text
apps/
├── frontend/  # 사용자 웹 애플리케이션
├── back/      # API 서버와 캐시
├── ingestor/  # 외부 데이터 수집 및 DB 적재
└── erd/       # 데이터베이스 구조 확인 도구
```

- `frontend`: 사용자 인터페이스와 캐릭터 조회 화면을 제공한다.
- `back`: Nexon API 응답을 도메인 응답으로 변환하고 DB·Redis를 사용한다.
- `ingestor`: 랭킹 등 외부 데이터를 수집해 데이터베이스에 적재한다.
- `erd`: Prisma 스키마를 기반으로 데이터베이스 구조를 확인한다.

## Packages

```text
packages/
├── api-types/   # Nexon API 원본 응답 타입
├── bootstrap/   # 전체 빌드 전에 필요한 최소 데이터 생성
├── contracts/   # 애플리케이션 간 공유 계약
├── database/    # Prisma와 데이터 관리 스크립트
├── game-data/   # 게임 정적 데이터와 규칙
├── generator/   # 배포·적재용 데이터 생성
└── simulator/   # 게임 계산 및 시뮬레이션
```

### API Types

`character`, `ranking`, `union` 패키지에 Nexon API 응답 타입을 원본 형태로 정의한다. 내부 도메인 타입과 분리해 외부 API 변경 범위를 제한한다.

### Bootstrap

`data-core` 빌드에 앞서 필요한 taxonomy 생성 결과를 만든다. 전체 generator가 의존성을 준비하기 전에 실행되어 순환 빌드 문제를 방지한다.

### Contracts

- `domain`: frontend와 back이 공유하는 정제된 응답 타입
- `internal`: 내부 시스템에서 공유하는 계약
- `nexon`: Nexon API 관련 공통 타입

### Database

- `db`: Prisma schema, migration, repository
- `data-admin`: game-data와 생성 결과를 DB에 적재하는 관리 스크립트

### Game Data

직업, 장비, 스킬, 스탯, 심볼, 몬스터, 잠재옵션 등 정적인 게임 데이터와 규칙을 도메인별 패키지로 분리한다. 계산기와 generator가 참조하는 기준 데이터 역할을 한다.

### Generator

game-data를 조합해 장비 JSON, 스킬 메타데이터 등 적재·배포에 필요한 결과물을 생성한다. 생성 결과는 런타임 도메인 코드와 분리한다.

### Simulator

game-data와 contracts를 이용해 게임 계산 규칙과 시뮬레이션을 구현한다.

## Dependency Direction

```text
apps ───────────────> packages
generator ──────────> game-data, database
simulator ──────────> game-data, contracts
data-admin ─────────> game-data, database
bootstrap ──────────> data-core 원천 데이터
```

- 외부 API 원본 타입과 내부 도메인 계약을 분리한다.
- 정적 게임 데이터와 규칙은 game-data가 소유한다.
- DB schema와 조회·적재 경계는 database가 소유한다.
- bootstrap은 초기 빌드에 필요한 최소 생성만 담당한다.
- 애플리케이션 실행 로직을 데이터 패키지에 넣지 않는다.
