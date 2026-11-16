# 앱별 분석

| 앱 | 사용자 또는 운영자에게 주는 가치 | 현재 상태 요약 |
| --- | --- | --- |
| `back` | 캐릭터 검색을 위한 서버 계약과 Nexon API 응답 정규화 | 검색 경로·mapper 구현. 계약·오류·캐시 검증 보강 필요 |
| `frontend` | 닉네임 검색과 캐릭터 장비 탐색 화면 | 이미지·장비 중심 일부 실데이터 표시. 화면의 빈 영역 존재 |
| `ingestor` | 랭킹 기반 수집 및 캐릭터·계정 그룹 데이터 적재 | 단계별 잡 존재. 기본 실행은 랭킹 전용 |
| `electron` | 버전별 원본 게임 데이터의 로컬 관리 | Phase 00~03 검증 완료, Phase 04 진행 중 |

## Back: 조회 API와 정규화

Express 서버는 [라우터](../../apps/back/src/loaders/router.loader.ts)에서 인증과 캐릭터 영역을 등록한다. `/api/character/search`는 닉네임을 검증하고 OCID를 해석한 다음 여러 Nexon 캐릭터 endpoint를 호출한다. `mappers/`는 raw 응답을 앱 계약으로 옮긴다. [캐릭터 컨트롤러](../../apps/back/src/domain/character/character.controller.ts), [mapper 목록](../../apps/back/src/domain/character/mappers/index.ts).

설계 포인트는 외부 API 타입과 화면용 계약을 나누고, 직업에 따라 skill 차수 요청을 만드는 점이다. [캐릭터 서비스](../../apps/back/src/domain/character/services/character.service.ts)에 요청 동시성 설정과 외부 오류 분류가 있다. 검색 이름·직업 캐시는 [메모리 캐시](../../apps/back/src/domain/character/character.cache.ts)이고 검색 이력은 [별도 Redis 경로](../../apps/back/src/domain/character/character.redis.ts)다. 둘을 하나의 분산 캐시라고 표현하지 않는다.

**남은 부분:** character 응답 계약 확정, frontend skill 타입 정렬, 대표 검색·캐시·Nexon 오류의 end-to-end 검증. 현재 검색 컨트롤러는 잡은 오류를 `statusCode: 500`으로 다시 전달하므로 서비스의 404·502·503 분류가 HTTP 응답에 유지되는지도 확인해야 한다. [API 정규화 계획](../../apps/back/docs/api-normalization-roadmap.md), [루트 목표](../../GOAL.md).

## Frontend: 검색과 장비 화면

React Router가 홈·캐릭터·로그인 화면을 구성하고 admin import 화면은 환경 플래그로 노출한다. [라우트 설정](../../apps/frontend/src/router/config.tsx). 검색 Hook은 TanStack Query를 사용하고 닉네임별 query key와 5분 stale time을 지정한다. [검색 Hook](../../apps/frontend/src/features/character/hooks/useSearchNick.ts).

[캐릭터 화면](../../apps/frontend/src/pages/CharacterPage/CharacterMainPage/index.tsx)은 loading·error·빈 검색 상태를 나누고 장비 그리드에서 선택한 아이템의 세부 정보를 보여준다. 현재 두 열은 `1`, `2` placeholder이고, stat·ability·skill·symbol 등 응답의 폭넓은 표현은 연결되지 않았다. [Admin Import New](../../apps/frontend/src/pages/admin/ImportNew/index.tsx)의 저장 버튼에는 제출 동작이 없어 실제 업로드 기능으로 소개하지 않는다. [프로젝트 명세](../../SPEC.md).

**포트폴리오 화면 후보:** 실제 검색 결과의 장비 그리드와 장비 상세. 화면 캡처를 사용한다면 당시 API 데이터의 출처·날짜와 미연결 영역을 같이 설명한다.

## Ingestor: 배치 수집과 계정 그룹화

[기본 진입점](../../apps/ingestor/src/index.ts)은 overall 랭킹 수집만 실행한다. 랭킹 raw page와 실행 상태를 DB에 저장하고, OCID·캐릭터 상세·그룹 생성은 별도 잡으로 나뉜다. [잡 스크립트](../../apps/ingestor/package.json), [랭킹 서비스](../../apps/ingestor/src/services/ranking-ingestor.ts), [캐릭터 서비스](../../apps/ingestor/src/services/character-ingestor.ts).

그룹 빌더는 `accountKey`로 후보를 묶고, 기존 대표·멤버 snapshot과 비교해 그룹을 유지하거나 새 버전을 연결한다. [그룹 빌더](../../apps/ingestor/src/services/character-group-builder.ts), [그룹 규칙](../../apps/ingestor/docs/grouping-rules.md). 이 규칙의 의도는 닉네임 변경·재사용을 다루는 것이지만, 운영 데이터에서 잘못된 연결이 없다는 검증은 아직 없다.

**남은 부분:** 단계별 잡을 하나의 안정된 운영 파이프라인으로 묶는 스케줄, 재시도, 중복·품질 기준, 이력 소비 경로. [루트 로드맵](../../ROADMAP.md).

## Electron: Maple Insight Data Studio

Electron Main은 창·런타임, IPC 등록, 도메인 서비스로 나뉜다. Preload가 Renderer에 명명된 메서드만 노출하고 Renderer는 화면과 상태를 담당한다. [Main 진입점](../../apps/electron/src/main/index.ts), [Preload](../../apps/electron/src/preload/index.ts), [IPC 등록](../../apps/electron/src/main/ipc/register.ts), [구현 아키텍처](../../apps/electron/docs/ARCHITECTURE.md).

Phase 00~03에서 파일 가져오기·변환, 검증 작업본, 버전별 raw 비교의 구현과 종료 검증을 마쳤다. Phase 04의 edit workbench는 변경 집합과 revision을 두고, DB 등록 직업의 metadata 7개 필드 편집과 구 복구 초안의 읽기·선택 복사를 부분 제공한다. 직업·스킬·장비 전체 편집은 완료되지 않았다. [단계 상태](../../apps/electron/docs/GOAL/README.md), [Phase 04 목표](../../apps/electron/docs/GOAL/Phase04.md), [workbench 서비스](../../apps/electron/src/main/services/workbench/edit-workbench.ts).

**포트폴리오 화면 후보:** 업로드·버전 비교·검증 결과·직업/스킬 조회. 사용자 제공 [스킬 목록 화면](../../screenshots/manual/electron/electron-2026-11-14T11-23-27-234Z.png)은 실제 관리 UI 구성을 보여주지만 그 자체가 편집·publish 완료 근거는 아니다. 이미지 산출물은 [스크린샷 규칙](../../screenshots/README.md)에 따라 다룬다.
