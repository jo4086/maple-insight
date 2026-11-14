# Maple Insight

메이플스토리 캐릭터 정보 조회와 게임 데이터 분석을 목표로 개발 중인 TypeScript 모노레포입니다. 현재 가장 집중하는 영역은 버전별 원본 데이터를 가져오고 검증·비교·편집하는 로컬 관리자 앱 **Maple Insight Data Studio**입니다. 공개 웹 서비스와 시뮬레이션은 이 데이터 기반과 별도로 단계적으로 개발합니다.

완성된 서비스가 아닌 진행 중인 프로젝트입니다. 아래의 구현 상태는 코드 존재만이 아니라 각 영역의 검증 기록을 기준으로 구분합니다.

## 해결하려는 문제

게임 데이터는 외부 API 응답, 버전별 정적 데이터, 직업·스킬 규칙, 캐릭터 이력이 서로 연결됩니다. 이 프로젝트에서는 데이터를 바로 화면이나 DB에 넣지 않고 역할별로 분리해 다룹니다.

- 외부 API 응답과 앱이 사용하는 계약을 별도 패키지로 관리합니다.
- 게임 데이터 원본을 보존하고, 검증 작업본·버전 비교 결과·편집 작업본을 구분합니다.
- 관리자 화면은 Electron Renderer에 두고, 파일·DB 접근은 Main과 제한된 Preload API를 거칩니다.
- 계산 규칙과 데이터 생성 로직을 앱에서 분리해 재사용합니다.

## 현재까지 구현한 내용

| 영역           | 구현 및 검증 상태                                                                                                                                                                                |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Data Studio    | 파일 가져오기, 변환, 검증 작업본, 버전별 원본 비교는 Phase 00~03 검증을 마쳤습니다. [단계 상태](./apps/electron/docs/GOAL/README.md)와 [검증 기록](./apps/electron/docs/REVIEW.md)을 참고하세요. |
| 직업·스킬 관리 | 직업 편집 작업본과 스킬 목록·레벨 상세·하이퍼 필터를 부분 구현했습니다. 로컬 스킬 이미지 추출과 화면 연결도 WSL 개발 환경에서 부분 검증했습니다. Phase 04 전체는 진행 중입니다.                  |
| 웹·API·수집    | React 화면, Express API, Nexon API 응답 매핑, 랭킹에서 시작하는 수집기 구조가 있습니다. 실제 캐릭터 데이터 표시와 전체 수집 파이프라인은 아직 검증되지 않았습니다.                               |
| 공통 패키지    | API 타입·공유 계약·게임 데이터·DB 접근·스탯 및 심볼 계산 로직을 분리했습니다.                                                                                                                    |

DB dry-run·승인 후 publish, publish된 버전 기반 생성, 완성된 캐릭터 이력과 보스 시뮬레이션은 후속 목표입니다. 현재 범위와 의존성은 [SPEC](./SPEC.md), [ROADMAP](./ROADMAP.md), [GOAL](./GOAL.md)에서 관리합니다.

## AI를 활용한 개발 워크플로

별도 저장소인 [codex-workspace](https://github.com/jo4086/codex-workspace)에서 Codex용 Skill과 Hook, 문서 작성·작업 범위 선택 규칙을 관리합니다. 이 프로젝트에서는 요구사항, 단계별 목표, 검증 결과를 앱별 문서에 남기고, 새 채팅의 에이전트가 관련 문서만 찾아 현재 범위와 다음 작업을 브리핑하도록 구성했습니다.

요구사항과 설계 방향을 직접 정하고 AI의 구현 결과를 검토·수정하며 검증 기록을 남기는 방식으로 개발합니다. 긴 대화 기록을 새 세션에 전달하는 부담을 줄이는 것이 목적이며, 토큰·시간 절감률은 별도로 측정하지 않았습니다.

## 저장소 구조

```text
apps/
  electron/   버전별 게임 데이터 관리자
  frontend/   캐릭터 검색·정보 화면
  back/       검색 API와 외부 API 연동
  ingestor/   랭킹·캐릭터 데이터 수집 작업
packages/
  api-types/  Nexon API 응답 타입
  contracts/  앱 간 공유 계약
  game-data/  게임 정적 데이터
  database/   Prisma 스키마와 DB 접근
  simulator/  계산·시뮬레이션 로직
  generator/  데이터 생성 로직
tools/
  maple-skill-extractor/  WZ 스킬 이미지 추출 CLI
```

주요 기술은 TypeScript, React, Electron, Node.js, Express, Prisma, Vitest, pnpm workspace와 Turborepo입니다. 이미지 추출 도구는 C#과 .NET 8을 사용합니다.

## 시작하기

```bash
pnpm install
pnpm --filter @apps/electron dev
```

Electron 앱의 테스트와 타입 검사는 다음 명령으로 실행합니다.

```bash
pnpm --filter @apps/electron test
pnpm --filter @apps/electron typecheck
```

일부 데이터 조회·가져오기 흐름에는 별도 DB와 원본 데이터가 필요합니다. 상세 설정과 제약은 [Electron README](./apps/electron/README.md)와 [스킬 이미지 추출기 README](./tools/maple-skill-extractor/README.md)를 참고하세요.

## 문서

- [전체 명세](./SPEC.md) · [개발 순서](./ROADMAP.md) · [현재 목표](./GOAL.md)
- [Electron 요구사항](./apps/electron/docs/REQUIREMENTS/README.md) · [단계별 목표](./apps/electron/docs/GOAL/README.md) · [검증 기록](./apps/electron/docs/REVIEW.md)
- [기존 아키텍처 기록](./docs/Architecture.md) · [개발 일지](./docs/dev-log.md)
- [초기 개발 회고](./docs/Technical_Insights_on_Driving_a_Service_to_Completion%28korean%29.md) · [Nexon Open API 참고](./docs/nexon-maplestory-open-api.md)
