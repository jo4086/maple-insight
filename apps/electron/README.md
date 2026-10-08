# Maple Insight Data Studio

CSV/JSON 변환, 게임 데이터 버전 비교, 장비·직업 데이터 관리와 DB 반영을 위한 관리자용 데스크톱 애플리케이션입니다.

## 데이터 변경 원칙

- renderer는 DB와 파일 시스템에 직접 접근하지 않습니다.
- CSV/JSON 원본은 변경하지 않고 별도 작업본을 생성합니다.
- DB 반영 전 validation, diff, dry-run, 사용자 승인을 거칩니다.
- 타입 생성 결과는 Git diff로 검토한 뒤 커밋합니다.

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
