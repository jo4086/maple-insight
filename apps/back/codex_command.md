# Codex 명령어 한글 설명

이 문서는 현재 환경에서 `codex --help` 및 각 하위 도움말로 직접 확인한 명령어를 기준으로 정리했다.

- 기준 확인일: 2026-04-01
- 범위:
  - 확인된 CLI 명령어
  - 확인된 하위 명령어
  - 대화형 슬래시 명령은 현재 환경에서 전체 목록을 직접 확인하지 못해 참고 수준으로만 기록

## 1. 기본 실행 형태

### `codex [PROMPT]`
- Codex 대화형 세션을 시작한다.
- 프롬프트를 같이 주면 그 내용을 첫 요청으로 넣고 시작한다.

### `codex [OPTIONS] <COMMAND> [ARGS]`
- Codex의 특정 기능을 명령형으로 실행한다.
- 예: 리뷰, 로그인, 세션 재개, 클라우드 작업 등

## 2. 최상위 명령어

### `codex exec`
- Codex를 비대화형으로 실행한다.
- 한 번의 요청을 실행하고 결과를 출력하는 용도다.
- 별칭: `codex e`

### `codex review`
- 현재 저장소 변경사항에 대해 비대화형 코드 리뷰를 수행한다.
- 커밋 기준, 브랜치 기준, 미커밋 변경 기준으로 검토할 수 있다.

### `codex login`
- Codex 로그인 및 인증 관리를 한다.
- API 키 방식이나 디바이스 인증 방식과 연결된다.

### `codex logout`
- 저장된 로그인 자격 정보를 제거한다.

### `codex mcp`
- 외부 MCP 서버를 관리한다.
- MCP 서버 등록, 조회, 인증, 제거에 사용한다.

### `codex mcp-server`
- Codex 자체를 MCP 서버로 실행한다.
- 표준 입출력 기반 서버 모드다.

### `codex app-server`
- 실험적 기능이다.
- 앱 서버 또는 관련 도구를 실행한다.

### `codex completion`
- 셸 자동완성 스크립트를 생성한다.
- `bash`, `zsh`, `fish`, `powershell` 등에 사용할 수 있다.

### `codex sandbox`
- Codex 제공 샌드박스 안에서 명령을 실행한다.
- 운영체제별 샌드박스 실행 도구에 가깝다.

### `codex debug`
- 디버깅용 도구 모음이다.
- 현재는 앱 서버 관련 디버깅 하위 명령이 있다.

### `codex apply`
- Codex 에이전트가 만든 최신 diff를 현재 작업 트리에 적용한다.
- 내부적으로 `git apply` 방식으로 반영하는 용도다.
- 별칭: `codex a`

### `codex resume`
- 이전 대화형 세션을 이어서 연다.
- 최근 세션 선택 또는 특정 세션 ID 지정이 가능하다.

### `codex fork`
- 이전 세션을 복제해서 새 흐름으로 이어간다.
- 기존 세션을 보존한 채 다른 방향으로 작업할 때 쓴다.

### `codex cloud`
- 실험적 기능이다.
- Codex Cloud 작업을 조회하고 로컬에 반영한다.

### `codex features`
- 기능 플래그를 조회하거나 켜고 끈다.

### `codex help`
- 전체 도움말 또는 특정 명령의 도움말을 출력한다.

## 3. 자주 쓰는 전역 옵션

### `-m, --model <MODEL>`
- 사용할 모델을 지정한다.
- 사용자가 말한 `/model`과 목적상 가장 가까운 CLI 옵션이다.

### `-c, --config <key=value>`
- `~/.codex/config.toml`의 설정 값을 일시적으로 덮어쓴다.

### `--enable <FEATURE>`
- 특정 기능 플래그를 켠다.

### `--disable <FEATURE>`
- 특정 기능 플래그를 끈다.

### `-i, --image <FILE>`
- 초기 요청에 이미지를 첨부한다.

### `-p, --profile <CONFIG_PROFILE>`
- 설정 프로필을 지정한다.

### `-s, --sandbox <SANDBOX_MODE>`
- 명령 실행 시 사용할 샌드박스 정책을 정한다.
- 가능한 값:
  - `read-only`: 읽기 전용
  - `workspace-write`: 작업공간 쓰기 허용
  - `danger-full-access`: 강한 제한 해제

### `-a, --ask-for-approval <APPROVAL_POLICY>`
- 명령 실행 전에 사람 승인 요청 방식을 정한다.
- 주요 값:
  - `untrusted`: 신뢰 명령만 자동 실행
  - `on-request`: 필요 시 모델이 승인 요청
  - `never`: 승인 없이 진행

### `--full-auto`
- 자동 실행 중심 설정을 빠르게 적용한다.
- 사실상 `on-request + workspace-write` 조합의 편의 옵션이다.

### `--dangerously-bypass-approvals-and-sandbox`
- 승인과 샌드박스를 모두 우회한다.
- 매우 위험한 옵션이다.

### `-C, --cd <DIR>`
- 작업 기준 디렉터리를 지정한다.

### `--search`
- 라이브 웹 검색 기능을 활성화한다.

### `--add-dir <DIR>`
- 기본 작업공간 외에 추가 쓰기 가능 디렉터리를 지정한다.

### `--no-alt-screen`
- 터미널 alternate screen 모드를 끈다.
- 스크롤백을 유지하고 싶을 때 유용하다.

## 4. 하위 명령어 설명

## `codex exec` 계열

### `codex exec`
- 비대화형 단건 실행이다.
- 스크립트, CI, 자동화 흐름에서 사용하기 좋다.

### `codex exec resume`
- 이전 비대화형 또는 관련 세션을 이어 실행한다.

### `codex exec review`
- `exec` 흐름 안에서 리뷰 작업을 수행한다.

## `codex review` 옵션 중심 설명

### `codex review --uncommitted`
- 스테이징 여부와 상관없이 현재 작업 중인 변경사항 전체를 리뷰한다.

### `codex review --base <BRANCH>`
- 지정한 기준 브랜치와 비교해 리뷰한다.

### `codex review --commit <SHA>`
- 특정 커밋 하나가 만든 변경을 리뷰한다.

### `codex review --title <TITLE>`
- 리뷰 결과에 표시할 제목을 지정한다.

## `codex login` 계열

### `codex login status`
- 현재 로그인 상태를 확인한다.

### `codex login --with-api-key`
- 표준 입력으로 API 키를 받아 로그인한다.

### `codex login --device-auth`
- 디바이스 인증 방식으로 로그인한다.

## `codex mcp` 계열

### `codex mcp list`
- 등록된 MCP 서버 목록을 보여준다.

### `codex mcp get <NAME>`
- 특정 MCP 서버 설정을 조회한다.

### `codex mcp add <NAME> --url <URL>`
- HTTP 기반 MCP 서버를 등록한다.

### `codex mcp add <NAME> -- <COMMAND>...`
- 로컬 명령으로 실행되는 stdio 기반 MCP 서버를 등록한다.

### `codex mcp remove <NAME>`
- 등록된 MCP 서버 설정을 삭제한다.

### `codex mcp login <NAME>`
- 해당 MCP 서버에 OAuth 로그인한다.

### `codex mcp logout <NAME>`
- 해당 MCP 서버 인증을 해제한다.

## `codex app-server` 계열

### `codex app-server`
- 실험적 앱 서버를 실행한다.

### `codex app-server generate-ts`
- 앱 서버 프로토콜용 TypeScript 바인딩을 생성한다.

### `codex app-server generate-json-schema`
- 앱 서버 프로토콜용 JSON Schema를 생성한다.

## `codex sandbox` 계열

### `codex sandbox macos`
- macOS Seatbelt 기반 샌드박스에서 명령을 실행한다.

### `codex sandbox linux`
- Linux 샌드박스에서 명령을 실행한다.
- 기본적으로 bubblewrap 계열을 사용한다.

### `codex sandbox windows`
- Windows 제한 토큰 기반 샌드박스에서 명령을 실행한다.

## `codex debug` 계열

### `codex debug app-server`
- 앱 서버 관련 디버깅을 수행한다.

## `codex apply` 계열

### `codex apply <TASK_ID>`
- 특정 작업 ID에 연결된 최신 diff를 현재 로컬 작업 트리에 적용한다.

## `codex resume` 계열

### `codex resume`
- 세션 선택기를 열어 이전 세션을 다시 시작한다.

### `codex resume --last`
- 가장 최근 세션을 바로 이어서 시작한다.

### `codex resume --all`
- 현재 디렉터리 기준 필터를 풀고 모든 세션을 보여준다.

### `codex resume --include-non-interactive`
- 비대화형 세션도 재개 목록에 포함한다.

## `codex fork` 계열

### `codex fork`
- 기존 세션을 복제해서 새 대화 흐름을 만든다.

### `codex fork --last`
- 가장 최근 세션을 바로 복제한다.

### `codex fork --all`
- 모든 세션을 대상으로 복제할 세션을 고른다.

## `codex cloud` 계열

### `codex cloud exec --env <ENV_ID> [QUERY]`
- TUI를 열지 않고 Codex Cloud에 새 작업을 제출한다.

### `codex cloud status <TASK_ID>`
- 특정 클라우드 작업의 상태를 확인한다.

### `codex cloud list`
- 클라우드 작업 목록을 조회한다.

### `codex cloud apply <TASK_ID>`
- 클라우드 작업 결과 diff를 로컬에 적용한다.

### `codex cloud diff <TASK_ID>`
- 클라우드 작업의 unified diff를 확인한다.

## `codex features` 계열

### `codex features list`
- 알려진 기능 플래그와 현재 상태를 본다.

### `codex features enable <FEATURE>`
- 특정 기능 플래그를 설정 파일에서 활성화한다.

### `codex features disable <FEATURE>`
- 특정 기능 플래그를 설정 파일에서 비활성화한다.

## 5. 사용자가 자주 헷갈리는 항목

### `/model`
- 사용자가 대화형 환경에서 떠올리는 슬래시 명령이다.
- 현재 이 환경에서는 슬래시 명령 전체 목록을 직접 출력하는 공식 도움말을 확인하지 못했다.
- 다만 CLI 기준으로 같은 목적의 기능은 `--model` 옵션이다.
- 의미: 어떤 모델로 응답할지 바꾸는 기능

### `/subagents`
- 대화형 환경에서 하위 에이전트 또는 보조 작업 단위를 다루는 명령으로 이해할 수 있다.
- 현재 환경에서는 이 슬래시 명령의 공식 목록과 세부 도움말을 직접 확인하지 못했다.
- 의미상으로는 작업 분할, 병렬 보조 작업, 하위 에이전트 활용과 관련된 제어 기능으로 보는 것이 맞다.

### `/help`
- 일반적으로 대화형 명령 환경에서 도움말을 여는 명령으로 쓰일 가능성이 높다.
- 다만 현재 확인된 공식 CLI 명령은 `codex help`다.

## 6. 빠른 이해용 요약

- 대화 시작: `codex`
- 모델 지정: `codex -m <MODEL>`
- 단건 실행: `codex exec`
- 코드 리뷰: `codex review`
- 로그인: `codex login`
- 외부 MCP 연결: `codex mcp`
- 이전 세션 이어하기: `codex resume`
- 이전 세션 복제하기: `codex fork`
- 클라우드 작업 다루기: `codex cloud`
- 기능 플래그 관리: `codex features`

## 7. 주의

- 이 문서는 현재 로컬 환경에서 직접 확인한 도움말 기준이다.
- Codex 버전이 바뀌면 명령어, 옵션, 실험 기능 이름이 달라질 수 있다.
- `/model`, `/subagents` 같은 대화형 슬래시 명령은 이번 환경에서 전체 목록을 공식적으로 추출하지 못했으므로 참고 설명으로만 봐야 한다.
