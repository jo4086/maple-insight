# Maple Insight Data Studio

CSV/JSON 변환, 게임 데이터 버전 비교, 장비·직업 데이터 관리와 DB 반영을 위한 관리자용 데스크톱 애플리케이션입니다.

## 데이터 변경 원칙

- renderer는 DB와 파일 시스템에 직접 접근하지 않습니다.
- CSV/JSON 원본은 변경하지 않고 별도 작업본을 생성합니다.
- DB 반영 전 validation, diff, dry-run, 사용자 승인을 거칩니다.
- 타입 생성 결과는 Git diff로 검토한 뒤 커밋합니다.

## 작업 우선순위

우선순위는 긴급도를 나타내며 완료 상태나 ROADMAP 의존성과는 별개입니다.

- **상**: 핵심 기능에 필수이거나 정상 동작 또는 데이터 안전을 막는 작업
- **중**: 개발 중 발견한 유용한 기능 또는 구조 작업이지만 현재 핵심 흐름에는 필요하지 않은 작업
- **하**: 핵심 흐름을 막지 않는 성능 최적화 또는 아키텍처 정리로, 원칙적으로 필수 로직 뒤에 진행하는 작업

아키텍처 작업은 복잡도가 커지기 전에 주기적으로 재검토해 우선순위를 높일 수 있습니다. 측정된 지연, 오류, 데이터 위험 또는 후속 작업 차단도 우선순위 상향 근거입니다.

## Project Setup

### Install

```bash
pnpm install
```

### Development

```bash
pnpm --filter @apps/electron dev
```

### Build

```bash
# For windows
pnpm --filter @apps/electron build:win

# For macOS
pnpm --filter @apps/electron build:mac

# For Linux
pnpm --filter @apps/electron build:linux
```
