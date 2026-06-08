# Git Commit Convention

이 프로젝트는 Conventional Commits 형식을 기반으로 커밋 메시지를 작성한다.

기본 형식은 다음과 같다.

```txt
type(scope): 변경 내용
```

예시:

```txt
feat(front-home): 홈 화면과 API Key 로그인 모달 추가
refactor(back-character): 캐릭터 조회 응답 매핑 구조 개편
docs(project): 프로젝트 구조와 아키텍처 문서 추가
```

## Type

커밋의 성격을 나타낸다.

| type | 사용 기준 |
| --- | --- |
| `feat` | 새로운 기능 추가 |
| `fix` | 버그 수정 |
| `refactor` | 동작은 유지하면서 코드 구조 개선 |
| `chore` | 설정, 패키지, 빌드, 정리 작업 |
| `docs` | 문서 추가 또는 수정 |
| `test` | 테스트 추가 또는 수정 |
| `style` | 포맷팅, CSS 등 동작과 무관한 스타일 수정 |
| `perf` | 성능 개선 |
| `build` | 빌드 설정, 번들링 설정 수정 |
| `ci` | GitHub Actions 등 CI 설정 수정 |
| `revert` | 이전 커밋 되돌리기 |

## Scope

변경 범위를 짧게 적는다.

이 저장소에서 주로 사용하는 scope는 다음과 같다.

| scope | 의미 |
| --- | --- |
| `project` | 프로젝트 전체 문서, 방향성, 루트 설정 |
| `workspace` | pnpm workspace, turbo, 모노레포 설정 |
| `front` | 프론트엔드 전체 |
| `front-home` | 홈 화면 |
| `front-admin` | 관리자 화면 |
| `front-character` | 캐릭터 조회 화면/기능 |
| `front-equipment` | 장비 UI/기능 |
| `front-ui` | 공통 UI 컴포넌트 |
| `front-config` | 프론트 설정 |
| `front-data` | 프론트 샘플 데이터 |
| `back` | 백엔드 전체 |
| `back-auth` | 백엔드 인증/세션 |
| `back-character` | 백엔드 캐릭터 조회 도메인 |
| `back-config` | 백엔드 설정 |
| `data-tools` | 데이터 수집, ERD, 변환 도구 |
| `packages` | 공통 패키지 전체 |
| `types` | 타입 패키지 또는 타입 정의 |
| `theme` | 폰트, 색상, Tailwind 테마 |
| `gitignore` | 추적 제외 설정 |

필요하면 새 scope를 추가해도 된다. 단, 기존 scope로 표현 가능한 경우에는 기존 것을 우선 사용한다.

## Subject

`:` 뒤에는 변경 내용을 한글로 짧게 적는다.

좋은 예:

```txt
feat(back-character): 환경별 API 요청 딜레이 조정
chore(front): 배포용 메타 정보와 관리자 라우트 정리
docs(project): 포트폴리오용 README 정리
```

피해야 할 예:

```txt
fix: 수정
update
작업함
feat(front): 이것저것 추가
```

## 커밋 분리 기준

한 커밋에는 하나의 의도를 담는다.

분리하는 것이 좋은 경우:

- README 수정과 코드 수정이 함께 있는 경우
- 프론트 변경과 백엔드 변경이 독립적인 경우
- 설정 변경과 기능 변경이 섞인 경우
- 버그 수정과 리팩터링이 섞인 경우

예시:

```txt
docs(project): 포트폴리오용 README 정리
chore(back): 프로덕션 실행과 세션 설정 정리
feat(back-character): 환경별 API 요청 딜레이 조정
chore(front): 배포용 메타 정보와 관리자 라우트 정리
```

## 자주 쓰는 명령어

변경 파일 확인:

```bash
git status --short
```

변경 요약 확인:

```bash
git diff --stat
```

특정 파일만 커밋:

```bash
git add README.md
git commit -m "docs(project): 포트폴리오용 README 정리"
```

여러 파일을 한 커밋으로 묶기:

```bash
git add apps/back/package.json apps/back/src/index.ts
git commit -m "chore(back): 프로덕션 실행 설정 정리"
```

## 현재 프로젝트 권장 방식

이 프로젝트에서는 다음 방식을 기본으로 한다.

- 커밋 메시지는 한글로 작성한다.
- 형식은 `type(scope): 변경 내용`을 따른다.
- subject 끝에 마침표를 붙이지 않는다.
- 커밋 하나에 여러 주제를 섞지 않는다.
- 작업 중간 저장용 커밋보다 나중에 읽기 좋은 단위의 커밋을 우선한다.
