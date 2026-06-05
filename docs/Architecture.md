# Architecture

## Overview

이 레포는 모노레포 구조로 구성되어 있으며,  
실행 가능한 애플리케이션은 `apps/`, 재사용 가능한 모듈은 `packages/`에 위치한다.

---

## apps

실제 실행되는 애플리케이션들

    apps/
     ├─ frontend /    # 사용자 인터페이스 (웹)
     ├─ back/         # API 서버
     └─ ingestor/     # 외부 데이터 수집 및 적재

- `frontend`: 사용자에게 보여지는 UI
- `back`: API, 비즈니스 로직 처리
- `ingestor`: Nexon API 등 외부 데이터 수집 및 DB 적재

## packages

애플리케이션에서 공통으로 사용하는 모듈들

#### api-types

Nexon API의 raw 응답 타입 정의

    api-types/
     ├─ character/
     ├─ ranking/
     └─ union/

- 외부 API 스펙을 그대로 반영한 타입
- workspace wrapper로 여러 패키지를 묶어 관리

#### contracts

애플리케이션 간 공유되는 타입 및 계약

    contracts/
     ├─ domain/       # frontend <-> backend 공통 타입 (정제된 형태)
     ├─ internal/     # 내부 시스템에서 사용하는 코드/타입
     └─ nexon/        # Nexon API 에러 코드 정의

- `domain`: 외부에 노출되는 안정된 타입
- `internal`: 시스템 내부 규칙 (직업 코드, 장비 코드 등)
- `nexon`: 외부 API 에러 정의

#### database

DB 관련 모듈

    database/
     ├─ db/           # Prisma schema 및 DB 규칙
     └─ data-admin/   # 데이터 입력/관리 스크립트

- `db`: 스키마 및 마이그레이션 관리
- `data-admin`: game-data 기반 데이터 삽입/관리

#### game-data

게임 내 정적인 데이터 및 규칙 정의

- 직업, 장비, 스탯 등
- 도메인 규칙의 source of truth

#### generator

데이터 생성용 스크립트 패키지

- game-data를 기반으로 JSON/fixture 생성
- 실행용/가공용 로직

#### simulator

게임 로직 기반 시뮬레이션

- game-data를 기반으로 계산 수행
- 내부 게임 로직 포함

## Dependency Direction

의존성 방향은 다음을 따른다:

    apps -> packages

    generator -> game-data
    simulator -> game-data

    contracts -> (공통 기준)
    api-types -> (외부 API 기준)

- 상위(apps)는 하위(packages)에 의존
- packages 간에는 단방향 의존 유지
- game-data는 core 데이터 역할

#### Design Principles

- 외부 API 타입 (api-types)과 내부 도메인 (contracts/domain) 분리
- 도메인 규칙은 game-data에 집중
- 데이터 생성은 generator에서만 수행
- 실행 로직은 apps 또는 simulator에 위치
