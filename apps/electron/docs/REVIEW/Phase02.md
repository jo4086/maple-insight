## 5. EL-G002 기반 검증 기록

Phase 2의 검증 계약, 검증 엔진과 작업본 저장 기반에 대한 중간 검증 기록이다.

### 검증 정보

| 항목   | 내용                                                          |
| ------ | ------------------------------------------------------------- |
| 검증일 | 2026-10-08                                                    |
| 브랜치 | `feature/electron-validation`                                 |
| 범위   | validation 계약, validator pipeline, 작업본 생성 및 충돌 정책 |
| 결과   | 기반 구현 통과, IPC·UI와 경고 확인 영구 저장은 미구현         |

### 구현 결과

- main, preload와 renderer가 공유할 validation issue, 위치, 값 변경과 상태 계약을 정의했다.
- 공통 validator 실행 후 정규화된 레코드를 도메인 validator에 전달한다.
- 도메인 validator는 registry에 등록하며 같은 도메인의 중복 key를 거부한다.
- issue ID는 validator, 위치, 코드와 값으로 결정론적으로 생성한다.
- 오류와 미확인 경고를 집계하여 `invalid`, `review`, `ready` 상태와 publish 가능 여부를 계산한다.
- 작업본은 변환 결과와 분리된 `data/.workspaces/<environment>/<version>`에 생성한다.
- 작업본 입력 해시는 변환 manifest와 모든 JSON 파일의 SHA-256으로 계산한다.
- JSON은 전체 파일을 메모리에 적재하지 않고 스트림 복사와 동시에 해시한다.
- 기존 작업본은 `error`, `reuse`, `replace` 정책으로 명시적으로 처리한다.
- 취소, manifest 불일치와 세션 충돌 시 현재 실행이 소유한 staging만 정리한다.

### 자동 검증 결과

| 검증                      | 결과 | 근거                                                  |
| ------------------------- | ---- | ----------------------------------------------------- |
| 전체 Electron 단위 테스트 | 통과 | Vitest 58개 테스트                                    |
| 공통·도메인 검증 순서     | 통과 | 공통 정규화 결과를 등록된 도메인 validator가 입력받음 |
| 오류와 경고 집계          | 통과 | 오류, 경고, 미확인 경고 수와 상태 계산 확인           |
| publish 차단              | 통과 | 오류 또는 미확인 경고가 있으면 publishable false      |
| 경고 확인                 | 통과 | 결정론적 issue ID로 확인 상태를 재적용하고 ready 전환 |
| 작업본 분리               | 통과 | 변환 JSON 보존과 `.workspaces` 복제 확인              |
| 입력 동일성               | 통과 | manifest와 JSON 해시가 같은 작업본만 reuse            |
| 충돌 정책                 | 통과 | error, reuse, replace 및 다른 세션 staging 보존       |
| 취소·실패 정리            | 통과 | 취소와 manifest 불일치 후 부분 staging 제거           |
| Node/Web typecheck        | 통과 | 양쪽 TypeScript 프로젝트 오류 없음                    |
| Electron 전체 ESLint      | 통과 | 앱 전체 파일 오류 및 경고 없음                        |
| Production build          | 통과 | main, preload와 renderer 번들 생성                    |

### 남은 범위

1. 작업본 생성과 검증 실행을 main IPC에 연결해야 한다.
2. 경고 확인 및 예외 사유는 현재 실행 입력으로만 재적용되며 파일 또는 DB에 영구 저장하지 않는다.
3. 검증 결과 탐색, 정규화 전후 비교와 publish 상태 UI가 필요하다.
4. 실제 도메인 파일을 판별하는 resolver와 첫 production validator가 필요하다.
5. 대용량 작업본 생성과 검증 중 renderer 응답성을 GUI에서 확인해야 한다.

### 판정

EL-G002의 계약, 검증 엔진과 작업본 저장 기반은 통과했다. Phase 2는 진행 중이며 IPC,
UI, 실제 도메인 validator와 대용량 검증을 완료하기 전에는 종료하지 않는다.

## 6. EL-G002 진행 검증 기록 (2026-10-14)

### 구현 현황

- 구현 작업자는 validation 실행, 진행, 취소 IPC와 preload 경계를 추가했다.
- class 파일 resolver와 class validator를 등록했다.
- report와 workspace manifest에 경고 확인 및 예외 사유를 저장하고 다시 읽는 round-trip을 구현했다.
- 결과 UI에 정규화 전후 값 비교와 publish 가능 상태를 표시했다.
- `AppShell`에서 발견한 모바일 sidebar 겹침을 수정했다.

### 검증 결과

| 검증 | 결과 | 근거 |
| ---- | ---- | ---- |
| Electron 전체 테스트 | 통과 | 14개 파일, 71개 테스트; 경고 복원·저장 실패 복구 및 미지원 도메인 차단 포함 |
| Node typecheck | 통과 | 구현 작업자 보고 |
| Web typecheck | 통과 | 구현 작업자 보고 |
| Electron ESLint | 통과 | 구현 작업자 보고 |
| Production build | 통과 | 구현 작업자 보고 |
| 독립 Playwright Chromium | 통과 | built renderer와 mock preload, desktop `1480x920` 및 mobile `390x844` |

- 독립 Playwright는 desktop에서 경고 확인/해제, 정규화 값, 버전 전환, 실패 및 route 복귀를 확인했다.
- mobile에서는 검증 결과, 정규화 값과 issue 확장을 확인했다. 여섯 화면의 탐색과 390px 화면에서 가로 넘침이 없는지도 확인했다.
- Playwright 검증은 실제 Electron/native IPC가 아닌 built renderer와 mock preload를 사용했다.

### 판정과 다음 검증

- §5는 2026-10-08 기준의 역사적 snapshot으로 유지한다.
- 2026-10-14 구현과 검증은 구분한다. IPC, resolver/validator, 저장 round-trip과 결과 UI는 구현됐고, service 및 mock-preload UI 근거가 있다.
- 실제 Electron/native IPC, 실제 데이터와 대용량 renderer 응답성, 전체 도메인 coverage는 아직 검증하지 않았다.
- 미지원·미확인 도메인은 오류로 차단한다. class 외 도메인은 validator를 구현하기 전 publish 가능 상태가 될 수 없다.
- report와 workspace manifest는 별도 파일이다. manifest 저장 실패 시 report 복구를 시도하지만, 복구까지 실패하면 불일치가 남을 수 있다.
- 정규화된 레코드는 workspace JSON에 기록하지 않는다.
- 실제 DB publish는 Phase 5 범위로 아직 없다.
- 다음 테스트는 실제 Electron에서 native IPC run/progress/cancel과 경고 저장을 확인하고, 실제 대용량 데이터와 지원하지 않는 파일에서 publish 상태와 renderer 응답성을 검증한다.

Phase 2는 진행 중이다. 위 미검증 항목과 전체 도메인 coverage가 남아 완료로 선언하지 않는다.
