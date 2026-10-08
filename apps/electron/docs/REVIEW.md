# Maple Insight Data Studio Review

## 1. 검증 원칙

- 구현 여부와 검증 완료 여부를 구분한다.
- 실행 결과나 코드 근거가 없는 항목은 완료로 기록하지 않는다.
- 외부 서비스 호출, GUI 조작 등 자동 검증하지 못한 항목은 수동 검증으로 남긴다.
- 실패와 경고는 숨기지 않고 다음 작업에 필요한 조치와 함께 기록한다.

## 2. Phase 0 기반 검증

### 검증 정보

| 항목   | 내용                                                            |
| ------ | --------------------------------------------------------------- |
| 검증일 | 2026-10-06                                                      |
| 브랜치 | `electron`                                                      |
| 범위   | Electron 셸, 버전 조회, 파일 선택 경계, Jev 연결, renderer 보안 |
| 결과   | 기반 검증 통과, 실제 Jev 성공 호출은 명시적 실행 전까지 보류    |

### 자동 검증 결과

| 검증                      | 결과 | 근거                                                                 |
| ------------------------- | ---- | -------------------------------------------------------------------- |
| Node typecheck            | 통과 | `tsc --noEmit -p apps/electron/tsconfig.node.json --composite false` |
| Web typecheck             | 통과 | `tsc --noEmit -p apps/electron/tsconfig.web.json --composite false`  |
| ESLint                    | 통과 | main, preload, renderer 전체 검사                                    |
| Production build          | 통과 | main, preload, renderer 번들 생성                                    |
| 문서 및 소스 whitespace   | 통과 | `git diff --check -- apps/electron JEV_GUIDE.md`                     |
| renderer 비밀값 노출      | 통과 | renderer 출력에서 `TYPESAFE_API_KEY`, `DATABASE_URL` 미검출          |
| renderer 서버 의존성 노출 | 통과 | renderer 출력에서 `@typesafe-ai/sdk`, `@maple/db` 미검출             |
| DB ready 버전 조회        | 통과 | 로컬 DB에서 `1.2.424` 조회                                           |
| Jev API 키 누락 실패      | 통과 | 키가 없을 때 SDK가 요청 전 오류를 반환하며 프로세스가 종료되지 않음  |
| IPC 파일 경로 제한        | 통과 | native dialog 선택 경로 집합과 문자열 타입을 main process에서 확인   |
| BrowserWindow 보안 옵션   | 통과 | context isolation, sandbox 활성화, node integration 비활성화         |

### 확인된 빌드 결과

```text
main:     out/main/index.js
preload:  out/preload/index.js
renderer: out/renderer/index.html 및 assets
```

### GUI 검증 결과

- [x] Electron 개발 앱이 실제 창으로 실행된다.
- [x] DB 연결 성공 시 ready/importing 버전이 버전 선택기에 표시된다.
- [x] DB 연결 실패 시 오류가 표시되고 앱 창은 유지된다.
- [x] native dialog에서 버전 폴더를 선택하고 CSV 목록과 메타데이터를 확인한다.
- [x] 폴더 선택 취소 시 기존 상태가 손상되지 않는다.
- [ ] 실제 TypeSafe API 키로 Jev 파일 분류를 한 번 실행한다.
- [x] Jev 호출 실패 후에도 파일 선택과 로컬 변환 기능을 사용할 수 있다.

### 잔여 위험

1. 실제 Jev API 요청은 비용과 외부 전송이 발생하므로 자동 실행하지 않았다.
2. native dialog 동작은 GUI 세션에서 수동 확인해야 한다.
3. 현재 `pnpm --version`이 일부 에이전트 세션에서 응답 없이 정지한다.
4. pnpm 정지로 인해 검증은 설치된 `tsc`, `eslint`, `electron-vite` 바이너리를 직접 실행했다.
5. ESLint 실행 시 루트 `package.json`의 module type 관련 성능 경고가 발생하지만 lint 오류는 없다.

### 판정

Phase 0의 종료 조건은 충족됐다. 실제 TypeSafe API를 사용하는 Jev 성공 호출은 비용과 외부
전송이 발생하고 사용자의 명시적 요청이 필요하므로 완료 조건과 분리한 운영 검증으로 남긴다.

## 3. EL-G001 검증 기록

현재 목표인 파일 가져오기 및 변환 기반 구축의 검증 결과를 이 절에 누적한다.

### 현재 상태

- 상태: 완료
- 구현 범위: 폴더 탐색, 다중 CSV 스트림 변환, NDJSON 작업본, IPC 진행/취소, 결과 UI
- 다음 검증 대상: Phase 2 validation 및 작업본 계약

### 구현 결과

- 변환 계약은 main, preload, renderer가 함께 사용하는 `src/shared/data-import.ts`에 정의했다.
- CSV는 `csv-parse`, JSON 최상위 배열은 `stream-json`으로 전체 파일 로딩 없이 처리한다.
- UTF-8 바이트열, CSV 헤더 중복, 열 개수, 따옴표, JSON 구조와 객체 레코드를 검증한다.
- 원본 SHA-256을 계산하고 파일별 작업본을 세션의 `files/<relativePath>.ndjson`에 저장한다.
- 선택한 폴더를 재귀 탐색하며 CSV만 정렬해 포함하고 심볼릭 링크는 따라가지 않는다.
- 여러 CSV는 하나의 세션으로 처리하며 하나라도 실패하거나 취소되면 전체 세션을 정리한다.
- 폴더 가져오기는 결정론적 CSV 탐색과 변환만 수행하며 Jev 외부 호출에 의존하지 않는다.
- 폴더명의 버전을 로컬 변환 대상으로 사용하므로 DB ready 목록에 없는 새 버전도 변환할 수 있다.
- 변환 성공 시 원본 CSV와 JSON 배열, manifest를 `data/<environment>/<version>`에 영구 보관한다.
- test와 production은 동일한 파일 수명 정책을 사용하며 환경만 버전 patch 범위로 구분한다.
- 게임사 업데이트 날짜는 선택 사항이며 미입력 시 manifest와 DB에 `null`로 기록한다.
- 폴더 선택 시 업데이트 날짜를 오늘로 초기화하고 연·월·일 목록에서 마우스와 키보드로 변경할 수 있다.
- native dialog에서 선택한 경로만 변환 IPC에서 허용하고 대상 버전 형식과 환경을 main process에서 검증한다.
- 진행 상태는 IPC event로 전달하고 취소 요청은 renderer별 세션에 한정한다.
- 성공 요약, 미리보기, 실패 위치와 취소 상태를 업로드 화면에 표시한다.
- 앱 상단 버튼과 `Ctrl+Shift+S`는 스크롤 전체 페이지를 `screenshots/manual/electron`, 자동 캡처는 `screenshots/playwright/electron`에 저장한다.
- 최소 글자 크기 토큰을 9px로 올리고 본문, 보조 문구, 사이드바와 상단바 글자를 각각 1px 확대했다.
- 다크·라이트 테마를 의미 기반 색상 토큰으로 구성하고 선택값을 `localStorage`에 유지한다.
- 다크 모드 보조 텍스트를 밝게 조정하고 라이트 모드에는 별도 텍스트·표면·상태 대비를 적용한다.
- 버전 선택 목록은 `ready`와 `importing`을 표시하고 `failed`를 제외한다.
- 폴더 변환 성공 후 목록을 다시 조회하여 새 버전을 현재 작업 버전으로 선택한다.

### 자동 검증 결과

| 검증               | 결과 | 근거                                                              |
| ------------------ | ---- | ----------------------------------------------------------------- |
| 단위 테스트        | 통과 | Vitest 48개 테스트                                                |
| 정상 입력          | 통과 | CSV 및 JSON 객체 배열을 동일한 레코드/NDJSON 구조로 변환          |
| 문자열 ID          | 통과 | CSV ID `000`, `100` 보존                                          |
| 입력 오류          | 통과 | 빈 파일, 열 불일치, 따옴표, 헤더 중복, JSON 구문/구조, UTF-8 오류 |
| 원본 불변성        | 통과 | 내용, 크기, 수정 시각 유지                                        |
| 결정론             | 통과 | 동일 입력의 SHA-256과 작업본 내용 일치                            |
| 대용량 입력        | 통과 | CSV 25,000개 레코드 스트림 변환 및 출력 건수 확인                 |
| 취소 정리          | 통과 | 처리 중 취소 후 세션 작업 디렉터리 제거 확인                      |
| 세션 충돌          | 통과 | 같은 세션 ID의 기존 작업 결과 보존 확인                           |
| 폴더 탐색          | 통과 | 중첩 CSV 정렬, JSON 제외, 심볼릭 링크 무시                        |
| 폴더 배치          | 통과 | 상대 경로 보존, 파일/레코드 집계, 실패 및 취소 시 전체 정리       |
| 환경별 경로        | 통과 | production과 test 버전을 각각 환경 하위 디렉터리에 저장           |
| 실제 데이터 탐색   | 통과 | `data/production/1.2.419`의 CSV 6개와 27,332,459바이트 확인       |
| 실제 데이터 변환   | 통과 | `data/production/1.2.419` CSV 6개, 254,206레코드 변환, 제외 0건   |
| Node/Web typecheck | 통과 | 양쪽 TypeScript 프로젝트 오류 없음                                |
| ESLint             | 통과 | Electron 앱 전체 lint 오류 없음                                   |
| Production build   | 통과 | main, preload, renderer 번들 생성                                 |
| renderer 경계      | 통과 | DB/TypeSafe 의존성과 비밀 환경변수 문자열 미검출                  |
| 버전 선택 정책     | 통과 | importing/ready 포함, failed 제외 및 새 버전 선택 단위 테스트     |
| DB 등록 경계       | 통과 | 버전, 출시일 등록과 실패 상태 전환 호출 테스트                    |
| Playwright 화면    | 통과 | Electron 6개 화면의 다크·라이트 전체 페이지 캡처                  |
| 테마 유지          | 통과 | 격리 프로필에서 라이트 전환 후 앱 재실행 시 선택값 유지           |
| DB 조회 실패       | 통과 | 오류 안내, 버전 없음 상태와 앱 프로세스 유지 확인                 |
| 변환 취소          | 통과 | 10만 레코드 진행 중 취소, 취소 결과와 재시도 버튼 복구            |
| DB 등록 실패       | 통과 | 원본 보존, 부분 표준 디렉터리 정리와 재시도 상태 확인             |

### 수동 검증 필요

- [x] 앱 상단 스크린샷 버튼이 현재 화면을 `screenshots/manual/electron`에 저장하는지 확인한다.
- [x] Playwright가 지정 화면을 `screenshots/playwright/electron`에 저장하는지 확인한다.
- [x] 다크·라이트 모드에서 본문, 보조 문구, 입력 필드와 상태 메시지의 대비를 확인한다.
- [x] 선택한 테마가 앱 재시작 후에도 유지되는지 확인한다.
- [x] 변환된 `1.2.419`가 현재 버전과 버전 비교 선택기에 표시되는지 확인한다.
- [x] Electron 창에서 버전 폴더 선택, CSV 목록과 파일별 결과를 확인한다.
- [x] 실제 대용량 파일 변환 중 화면이 응답 가능한지 확인한다.
- [x] 변환 중 취소 버튼으로 작업이 종료되고 재시도할 수 있는지 확인한다.
- [x] DB 연결 실패가 구조화된 오류로 표시되고 앱과 기존 버전이 유지되는지 확인한다.

### 잔여 위험

1. 폴더 배치는 레코드별 부분 성공이 아닌 전체 성공/실패 방식이므로 성공 시 제외 건수는 항상 0이다.
2. 폴더 입력은 CSV만 처리하고 UTF-8로 제한한다. 단일 JSON 변환 서비스는 내부에 유지된다.
3. 작업 디렉터리의 만료와 앱 재시작 후 복구 정책은 아직 없다.
4. 파일 해시는 기록하지만 같은 버전의 중복 원본 감지는 아직 구현하지 않았다.
5. DB에는 `importing` 버전 메타데이터만 등록하며 도메인 데이터 적재와 `ready` 전환은 아직 연결되지 않았다.
6. 실제 TypeSafe API를 사용하는 Jev 성공 호출은 비용과 외부 전송 때문에 자동 실행하지 않는다.

### 판정

EL-G001의 구현과 자동·GUI 통합 검증을 완료했다. Roadmap Phase 1을 `완료`로 전환하고
다음 목표는 Phase 2의 validation 및 작업본 계약으로 이동한다.

## 4. 초기 기반 감사

### 검토 정보

| 항목   | 내용                                                       |
| ------ | ---------------------------------------------------------- |
| 검토일 | 2026-10-08                                                 |
| 범위   | `SPEC.md`, `ROADMAP.md`, `GOAL.md`, `REVIEW.md`, 현재 소스 |
| 판정   | Phase 0과 Phase 1 완료, Phase 2 시작 가능                  |

### 확인된 기반

- Electron, React, Vite, TailwindCSS와 main/preload/renderer 경계가 구성되어 있다.
- 버전 폴더 선택부터 CSV 탐색, JSON 변환, 표준 경로 저장과 importing 버전 등록까지 연결되어 있다.
- ready/importing 버전 선택, 변환 후 목록 갱신, 다크·라이트 테마와 스크린샷 기반이 구현되어 있다.
- `data/production/1.2.419`에서 CSV 6개, JSON 6개와 manifest 산출물을 확인했다.
- Vitest 48개, node/web typecheck, ESLint와 production build가 통과한다.

### 운영 검증으로 남은 항목

1. 실제 TypeSafe API 키를 사용한 Jev 성공 호출
2. Windows 패키징 및 설치 환경 실행

### 다음 단계 판정

Phase 0과 Phase 1을 완료 처리하고 `GOAL.md`를 Phase 2의 검증 및 작업본 구축으로
교체한다. 버전 diff와 장비·직업 CRUD는 검증된 작업본 계약 이후에 진행한다.
