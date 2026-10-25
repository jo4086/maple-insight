## 9. 아키텍처 요구사항

### 9.1 프로세스 경계

```text
Renderer
  -> Preload API
  -> IPC Handler
  -> Main Process Service
  -> File System / Database / External API
```

- `ARC-001` `MUST`: renderer는 Node.js, 파일 시스템, DB에 직접 접근하지 않아야 한다.
- `ARC-002` `MUST`: `contextIsolation`을 활성화하고 `nodeIntegration`을 비활성화해야 한다.
- `ARC-003` `MUST`: preload는 필요한 기능만 명시적으로 노출해야 한다.
- `ARC-004` `MUST`: IPC 입력은 main process에서 런타임 검증해야 한다.
- `ARC-005` `MUST`: 파일 경로는 native dialog에서 승인한 범위 안에서만 사용해야 한다.
- `ARC-006` `SHOULD`: 파일, DB, Jev, 생성기 기능은 main process 서비스로 분리해야 한다.
- `ARC-007` `MUST`: 외부 URL은 Electron 창 안에서 임의로 열지 않아야 한다.

### 9.2 데이터 소유권

- `OWN-001` `MUST`: 원본 파일은 불변 입력으로 취급해야 한다.
- `OWN-002` `MUST`: DB는 서비스에서 사용하는 버전 데이터의 최종 소유자가 되어야 한다.
- `OWN-003` `MUST`: 패키지의 생성 파일은 DB 또는 승인된 작업본에서 재생성 가능해야 한다.
- `OWN-004` `MUST`: 앱 UI 상태를 DB의 영구 데이터와 혼동하지 않아야 한다.

## 10. 보안 요구사항

- `SEC-001` `MUST`: `DATABASE_URL`, `TYPESAFE_API_KEY` 등 비밀값을 renderer에 전달하지 않아야 한다.
- `SEC-002` `MUST`: 비밀값을 소스 코드, 로그, Git 추적 파일에 저장하지 않아야 한다.
- `SEC-003` `MUST`: 모든 DB 변경 작업은 대상 버전과 변경 범위를 사용자에게 표시해야 한다.
- `SEC-004` `MUST`: 삭제와 publish는 일반 탐색 동작과 분리된 명시적 승인 절차를 가져야 한다.
- `SEC-005` `SHOULD`: 외부 API로 전송될 데이터의 크기와 내용을 제한해야 한다.
- `SEC-006` `SHOULD`: 패키징된 앱에서 개발자 도구와 새 창 열기 동작을 제한해야 한다.

## 11. 비기능 요구사항

### 11.1 성능

- `NFR-PERF-001`: 대용량 파일은 가능한 한 스트리밍 또는 청크 단위로 처리해야 한다.
- `NFR-PERF-002`: 긴 작업이 renderer의 UI 스레드를 차단하지 않아야 한다.
- `NFR-PERF-003`: 목록은 데이터 증가에 대비해 페이지네이션 또는 가상화를 지원할 수 있어야 한다.

### 11.2 안정성

- `NFR-REL-001`: 외부 API나 DB 연결 실패가 앱 프로세스 전체 종료로 이어지지 않아야 한다.
- `NFR-REL-002`: 실패한 작업은 원본과 기존 ready 버전을 손상시키지 않아야 한다.
- `NFR-REL-003`: 동일 입력을 다시 처리해도 중복 데이터가 생기지 않아야 한다.

### 11.3 사용성

- `NFR-UX-001`: 사용자는 항상 현재 버전과 비교 버전을 확인할 수 있어야 한다.
- `NFR-UX-002`: 실행 버튼에는 대상, 영향, 현재 상태가 드러나야 한다.
- `NFR-UX-003`: 오류 메시지는 실패 원인과 다음 조치를 포함해야 한다.
- `NFR-UX-004`: 색상만으로 상태를 구분하지 않아야 한다.

### 11.4 호환성

- `NFR-COMP-001`: Windows 실행 파일 배포를 우선 지원해야 한다.
- `NFR-COMP-002`: Linux/WSL 개발 환경에서 typecheck, lint, build가 가능해야 한다.
- `NFR-COMP-003`: 플랫폼별 경로 구분자를 직접 조합하지 않고 Node.js path API를 사용해야 한다.

### 11.5 관측 가능성

- `NFR-OBS-001`: 각 작업은 상태, 시작 시각, 종료 시각, 처리 건수, 오류를 보고해야 한다.
- `NFR-OBS-002`: 외부 API 결과는 모델과 사용량 정보를 함께 기록할 수 있어야 한다.
- `NFR-OBS-003`: 사용자 표시 로그와 개발 진단 로그를 구분해야 한다.

## 12. 화면 요구사항

| 화면            | 필수 기능                                              |
| --------------- | ------------------------------------------------------ |
| 대시보드        | 현재/비교 버전, 최근 작업 상태, 처리 흐름, 빠른 작업   |
| 데이터 업로드   | 파일 선택, 메타 정보, 대상 버전, Jev 분류, 검증 시작   |
| 버전 비교       | 두 버전 선택, 도메인 필터, 추가/수정/삭제 요약 및 상세 |
| 장비 데이터     | 검색, 필터, 상세, 추가/수정/삭제 작업본 관리           |
| 직업 데이터     | 직업 코드, 계열, 전직 단계 조회 및 편집                |
| DB 및 타입 작업 | dry-run, 승인, publish, 타입 생성, 실행 로그           |

### 12.8 Phase 2 실제 IPC 수용 기준

실제 Electron 창에서 검증 run/progress/cancel과 경고 저장 round-trip을 확인한다. mock-preload UI 검증은 이 항목을 대체하지 않는다.

### 12.9 Phase 2 대용량 수용 기준

실제 production 크기 입력에서 진행 표시, 취소, renderer 응답성을 확인한다.

### 12.10 Phase 2 도메인 coverage 수용 기준

미지원 도메인은 publish 가능 상태가 되지 않음을 확인하고, 지원하는 새 validator마다 fixture coverage를 기록한다. Phase 2의 실행 검증은 [REVIEW](../REVIEW/Phase02.md)에 남긴다.

## 13. 완료 기준

초기 제품의 핵심 흐름은 다음 조건을 모두 만족할 때 완료로 본다.

1. 새 버전의 CSV/JSON 데이터 묶음을 선택할 수 있다.
2. 원본을 변경하지 않고 작업본을 생성한다.
3. 형식 및 도메인 검증 결과를 확인할 수 있다.
4. 이전 ready 버전과 추가, 수정, 삭제 차이를 확인할 수 있다.
5. 장비와 직업 작업본을 편집할 수 있다.
6. dry-run 결과를 확인하고 명시적으로 승인할 수 있다.
7. 실패 시 부분 반영 없이 복구되며 원인을 확인할 수 있다.
8. 성공 시 버전이 ready가 되고 해당 버전으로 데이터를 조회할 수 있다.
9. 타입과 정적 데이터 생성 결과를 Git diff로 검토할 수 있다.
10. renderer 번들에 DB 또는 TypeSafe 인증 정보가 포함되지 않는다.

## 14. 현재 구현 상태

이 절은 요구사항이 아니라 문서 작성 시점의 구현 스냅샷이다.

### 구현됨

- Electron, React, Vite, TailwindCSS 기반 애플리케이션 셸
- 대시보드와 주요 화면 탐색
- DB의 ready/importing 버전 목록 조회와 failed 버전 제외
- 현재 버전과 비교 버전 선택 상태
- OS native dialog 기반 버전 데이터 폴더 선택
- 폴더 아래 CSV 재귀 탐색과 파일 목록, 크기, 수정 시각 표시
- 여러 CSV의 단일 세션 스트림 변환과 파일별 NDJSON 작업본
- `data/<environment>/<version>/{csv,json}` 저장과 importing 버전 등록
- 변환 성공 후 버전 목록 갱신과 새 버전 선택
- 다크·라이트 테마와 전체 화면 스크린샷
- main/preload/renderer 보안 경계의 기본 구성
- main/preload의 Jev 파일 유형 분류 서비스 (폴더 가져오기 UI에서는 미사용)
- `GameDataVersion` 및 버전 연관 DB 구조
- 버전 묶음 seed의 importing/ready/failed 처리 기반
- Phase 2 검증 작업본, class 및 5개 skill 원본 파일과 PVP 공통 파일의 도메인 검증, 경고 확인·실행 이력 저장, 진행·취소 IPC와 결과 UI
- 실제 Electron/native IPC에서 production 크기 입력 검증·취소·재검증 확인 ([REVIEW](../REVIEW/Phase02.md))

### 부분 구현

- 버전 비교 화면과 도메인 관리 화면은 UI 골격만 존재
- DB 및 타입 작업 화면은 작업 항목만 표시
- 데이터 업로드의 실제 도메인 DB 반영은 연결되지 않음 (Phase 2 검증은 DB publish가 아님)
- 작업 상태는 일부 정적 표시이며 실제 실행 상태와 연결되지 않음

### 미구현

- 장비·몬스터 등 현재 변환 묶음에 없는 도메인의 validator (미등록 도메인은 publish 불가 오류)
- 버전 diff 계산과 상세 표시
- 장비 및 직업 CRUD 작업본
- dry-run, 승인, publish UI
- 타입 및 정적 데이터 생성 실행
- 전체 작업 이력, 단계별 재시도 및 앱 재시작 후 복구 (Phase 1/2 취소 기능은 일부 구현)
- Jev confidence 기반 수동 검토 정책

## 15. 관련 문서

- `apps/electron/README.md`
- `JEV_GUIDE.md`
- `apps/electron/docs/ROADMAP.md`
- `apps/electron/docs/GOAL/README.md`
- `apps/electron/docs/REVIEW.md`
