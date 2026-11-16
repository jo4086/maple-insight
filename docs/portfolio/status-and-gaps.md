# 구현 상태와 미완성 영역

이 표는 2026-11-16의 저장소 코드와 담당 문서의 **완료 판정**을 함께 읽은 결과다. 정적 분석이며 이번 문서 작성 과정에서 앱 실행, 외부 API, 실제 DB, 전체 테스트를 새로 검증하지 않았다.

| 영역 | 코드·문서에서 확인한 것 | 포트폴리오의 정확한 표현 | 남은 일 |
| --- | --- | --- | --- |
| Electron Phase 00~03 | import·변환, validation 작업본, raw 버전 diff. [앱 단계 상태](../../apps/electron/docs/GOAL/README.md), [검증 기록](../../apps/electron/docs/REVIEW.md) | **앱 문서상 검증 완료** | Phase 03의 `failed`·test DB 행에 대한 native 표시 검증은 잔여 조건 |
| Electron Phase 04 | edit workbench, 직업 metadata 7개 필드 저장·재열기, 복구 선택 복사, 스킬 읽기 UI. [Phase 04](../../apps/electron/docs/GOAL/Phase04.md) | **부분 구현·부분 검증** | 실제 DB·ready fixture의 native 유효 흐름, 스킬/장비 편집, Phase 4a~4c |
| Electron Phase 05·06 | 목표와 설계 문서 존재. [로드맵](../../apps/electron/docs/ROADMAP.md) | **대기** | dry-run·명시 승인 publish, ready 버전 기반 타입·정적 데이터 생성 |
| Back | 검색 라우트, Nexon 호출, mapper, 오류·캐시 코드. [컨트롤러](../../apps/back/src/domain/character/character.controller.ts) | **조회 API 경로 구현** | frontend와 응답 계약 정렬, 검색 오류의 HTTP 상태 보존, 실제 검색·캐시·외부 실패 검증 |
| Frontend | 검색 및 장비 화면, loading/error 상태. [캐릭터 화면](../../apps/frontend/src/pages/CharacterPage/CharacterMainPage/index.tsx) | **이미지·장비 중심 부분 UI** | stat·ability·skill·symbol 연결, placeholder 제거, end-to-end 검증 |
| Frontend Admin | import 화면 구조와 파일 선택 UI. [화면](../../apps/frontend/src/pages/admin/ImportNew/index.tsx) | **mock/비연결 UI** | 실제 업로드 구현을 제품 범위와 다시 맞춰야 함 |
| Ingestor | 랭킹 기본 잡, OCID·캐릭터·그룹 별도 잡. [진입점](../../apps/ingestor/src/index.ts), [스크립트](../../apps/ingestor/package.json) | **단계별 수집 코드 존재** | 자동 전체 실행, 주기·재시도·중복·품질 기준 및 운영 검증 |
| DB·데이터 패키지 | Prisma schema·repository, seed CLI, 정적 데이터·생성기. [DB README](../../packages/database/db/README.md), [패키지 README](../../packages/README.md) | **데이터 기반과 관리 도구 구현** | 소비자 전환, 생성 최신성 CI, 별도 publish 경계 검증 |
| 계산·시뮬레이션 | 스탯·심볼 계산 코드와 테스트. [simulator](../../packages/simulator/src/index.ts) | **계산 로직 일부 구현** | publish 버전과 연결, 결과 재현성, 보스 시뮬레이션 신규 설계·구현 |

## 포트폴리오에서 피할 과장

- `README.md`나 과거 설계 문서의 오래된 상태보다 앱별 현재 GOAL·ROADMAP·REVIEW를 우선한다. 예를 들어 루트 [SPEC](../../SPEC.md)의 일부 현재 상태 문장은 Electron Phase 02·03 완료 전 시점이다.
- “완성된 메이플 정보 서비스”, “운영 중인 수집 파이프라인”, “DB까지 자동 publish”, “보스 시뮬레이터 제공”은 현재 근거와 맞지 않는다.
- 코드 존재, 테스트 통과 기록, 실제 Electron UI 검증, 실제 DB 검증은 증거 수준이 다르다. 각 사례에서 어떤 수준인지 밝힌다.
- 이전 문서의 테스트 개수와 DB 행 수는 그 날짜·fixture·환경의 결과다. 현재 전체 프로젝트의 품질 지표로 바꾸지 않는다.

## 이어질 우선순위와 의존성

1. Electron Phase 04의 실제 native·DB 편집 흐름과 직업·스킬·장비의 공통 작업본을 완료한다.
2. 같은 작업본의 dry-run과 명시 승인 publish를 구현·검증하고, 성공한 ready 버전에서 생성한다.
3. 별도로 back/frontend의 character 계약과 실제 필드 표시를 완성한다. 이 작업은 Electron publish를 기다릴 필요가 없다.
4. Ingestor의 전체 수집 품질을 확인한 뒤 캐릭터 이력을 제공한다.
5. 신뢰된 버전 데이터와 계산 규칙을 연결해 시뮬레이션을 확장한다.

이 순서는 [루트 ROADMAP](../../ROADMAP.md)과 [GOAL](../../GOAL.md)의 현재 의존성을 요약한 것이다. 단계 상태의 원본은 각각의 담당 문서다.
