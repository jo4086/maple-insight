# Git Status 정리

기준 명령:

```bash
git status --short
```

## 요약

현재 변경사항은 총 `726`개입니다.

| 상태 | 개수 | 의미 |
| --- | ---: | --- |
| `M` | 66 | 수정된 tracked 파일 |
| `D` | 617 | 삭제된 tracked 파일 |
| `??` | 43 | 신규 untracked 파일/디렉터리 |

## 영역별 분포

| 영역 | 개수 | 비고 |
| --- | ---: | --- |
| `apps/front` | 243 | 기존 프론트 앱 대량 삭제 |
| `apps/back` | 161 | 백엔드 수정/삭제/신규 auth 등 |
| `apps/note` | 71 | 기존 note 앱 삭제 |
| `packages/mapleInsight-types` | 58 | 기존 타입 패키지 삭제 |
| `apps/frontend` | 51 | 현재 프론트 앱 수정/신규 |
| `apps/ricemc` | 42 | 기존 ricemc 앱 삭제 |
| `packages/css-conponents` | 37 | 기존 UI 패키지 삭제 |
| `packages/mapleInsight-ui` | 28 | 기존 UI 패키지 삭제 |
| `packages/mapleInsight-utils` | 10 | 기존 유틸 패키지 삭제 |
| 기타 루트/신규 패키지 | 68 | workspace, docs, packages, scripts 등 |

## 수정된 파일

### 루트

- `.gitignore`
- `eslint.config.js`
- `package.json`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`
- `tsconfig.base.json`

### 백엔드

- `apps/back/package.json`
- `apps/back/src/config/api-config.ts`
- `apps/back/src/config/index.ts`
- `apps/back/src/domain/character/character.constants.ts`
- `apps/back/src/domain/character/character.controller.ts`
- `apps/back/src/domain/character/character.raw.test.ts`
- `apps/back/src/domain/character/character.route.ts`
- `apps/back/src/domain/character/character.service.ts`
- `apps/back/src/domain/character/constants/classMetaMap.ts`
- `apps/back/src/domain/character/mappers/ability.mapper.ts`
- `apps/back/src/domain/character/mappers/basic.mapper.ts`
- `apps/back/src/domain/character/mappers/beauty-equipment.mapper.ts`
- `apps/back/src/domain/character/mappers/cashitem-equipment.mapper.ts`
- `apps/back/src/domain/character/mappers/dojang.mapper.ts`
- `apps/back/src/domain/character/mappers/hexamatrix-stat.mapper.ts`
- `apps/back/src/domain/character/mappers/hexamatrix.mapper.ts`
- `apps/back/src/domain/character/mappers/hyper-stat.mapper.ts`
- `apps/back/src/domain/character/mappers/index.ts`
- `apps/back/src/domain/character/mappers/item-equipment.mapper.ts`
- `apps/back/src/domain/character/mappers/link-skill.mapper.ts`
- `apps/back/src/domain/character/mappers/other-stat.mapper.ts`
- `apps/back/src/domain/character/mappers/pet-equipment.mapper.ts`
- `apps/back/src/domain/character/mappers/popularity.mapper.ts`
- `apps/back/src/domain/character/mappers/propensity.mapper.ts`
- `apps/back/src/domain/character/mappers/ring-reserve-skill-equipment.mapper.ts`
- `apps/back/src/domain/character/mappers/set-effect.mapper.ts`
- `apps/back/src/domain/character/mappers/skill.mapper.ts`
- `apps/back/src/domain/character/mappers/stat.mapper.ts`
- `apps/back/src/domain/character/mappers/symbol-equipment.mapper.ts`
- `apps/back/src/domain/character/mappers/vmatrix.mapper.ts`
- `apps/back/src/domain/character/utils/getStatUnit.ts`
- `apps/back/src/domain/character/utils/grade.ts`
- `apps/back/src/domain/equipment/equipment-slot-meta.ts`
- `apps/back/src/loaders/express.loader.ts`
- `apps/back/src/loaders/router.loader.ts`
- `apps/back/src/middlewares/error-handler.ts`
- `apps/back/src/types/index.ts`
- `apps/back/tsconfig.json`
- `apps/back/tsup.config.ts`

### 현재 프론트 앱

- `apps/frontend/package.json`
- `apps/frontend/src/features/auth/components/LoginModal.tsx`
- `apps/frontend/src/features/character/api.ts`
- `apps/frontend/src/features/character/components/CharacterBanner.tsx`
- `apps/frontend/src/features/character/components/CharacterSearchInput.tsx`
- `apps/frontend/src/features/character/components/equipment/EquipmentContainer.tsx`
- `apps/frontend/src/features/character/components/equipment/EquipmentGrid.tsx`
- `apps/frontend/src/features/character/components/equipment/EquipmentSlot.tsx`
- `apps/frontend/src/features/character/hooks/useCharacterRefresh.ts`
- `apps/frontend/src/features/character/hooks/useSearchNick.ts`
- `apps/frontend/src/features/character/types.ts`
- `apps/frontend/src/layout/CharacterLayout.tsx`
- `apps/frontend/src/layout/Header.tsx`
- `apps/frontend/src/pages/CharacterPage/CharacterMainPage/index.tsx`
- `apps/frontend/src/pages/index.ts`
- `apps/frontend/src/router/config.tsx`
- `apps/frontend/src/types/worlds.ts`
- `apps/frontend/tsconfig.app.json`
- `apps/frontend/tsconfig.json`
- `apps/frontend/tsconfig.node.json`
- `apps/frontend/vite.config.ts`

## 신규 파일/디렉터리

### 백엔드

- `apps/back/src/config/api/`
- `apps/back/src/config/types.ts`
- `apps/back/src/domain/auth/`
- `apps/back/src/domain/character/character.validators.ts`
- `apps/back/src/domain/character/normalized.item-equipment.json`
- `apps/back/src/domain/character/raw.item-equipment.json`
- `apps/back/tsconfig.test.json`

### 현재 프론트 앱

- `apps/frontend/itemOptions.json`
- `apps/frontend/src/components/index.ts`
- `apps/frontend/src/components/navigations/LinkButton.tsx`
- `apps/frontend/src/components/navigations/index.ts`
- `apps/frontend/src/features/auth/components/index.ts`
- `apps/frontend/src/features/auth/index.ts`
- `apps/frontend/src/features/character/components/.equipment.legacy/`
- `apps/frontend/src/features/character/components/equipment/EquipmentCard.tsx`
- `apps/frontend/src/features/character/components/equipment/ItemOptionList.tsx`
- `apps/frontend/src/features/character/components/equipment/StarForceSlot.tsx`
- `apps/frontend/src/features/character/components/equipment/index.ts`
- `apps/frontend/src/features/character/components/equipment/itemOptionMeta.ts`
- `apps/frontend/src/features/character/components/index.ts`
- `apps/frontend/src/features/character/hooks/index.ts`
- `apps/frontend/src/features/character/index.ts`
- `apps/frontend/src/features/character/queryKeys.ts`
- `apps/frontend/src/pages/admin/`
- `apps/frontend/src/pages/html.tsx`
- `apps/frontend/src/types/theme.ts`
- `apps/frontend/tsconfig.app.legacy`
- `apps/frontend/tsconfig.node.legacy`

### 신규 앱/패키지/문서

- `apps/erd/`
- `apps/ingestor/`
- `apps/roadmap.md`
- `docs/Architecture.md`
- `docs/Project-Structure.md`
- `packages/api-types/`
- `packages/contracts/`
- `packages/database/`
- `packages/game-data-legacy/`
- `packages/game-data/`
- `packages/generator/`
- `packages/package.json`
- `packages/simulator/`
- `scripts/`
- `git-status.md`

## 삭제된 파일/디렉터리

삭제 항목은 `617`개로, 대부분 기존 앱/패키지 정리로 보입니다.

### 루트 삭제

- `.workmux.yaml`
- `__eslint.config.js`
- `eslint.md`
- `package_20251021.json`

### 백엔드 삭제

- `apps/back/evaluator-guide.md`
- `apps/back/generator-guide.md`
- `apps/back/planner-guide.md`
- `apps/back/src/config/config.type.ts`
- `apps/back/src/config/test.ts`
- `apps/back/src/domain/character/mappers/android-equipment.mapper.ts`
- `apps/back/src/domain/character/mappers/item-equipment.mapper2.ts`
- `apps/back/src/domain/character/types/` 하위 타입 파일 전체
- `apps/back/src/domain/symbol/` 하위 파일 전체
- `apps/back/src/jobs/` 하위 직업 데이터/코드 전체
- `apps/back/src/types/deep-nullable.ts`
- `apps/back/src/types/jops.type.ts`
- `apps/back/src/types/response.ts`
- `apps/back/src/types/skill.type.ts`

### 기존 앱 삭제

- `apps/front/` 하위 tracked 파일 대부분
- `apps/note/` 하위 tracked 파일 전체
- `apps/ricemc/` 하위 tracked 파일 전체

### 기존 패키지 삭제

- `packages/css-conponents/` 하위 tracked 파일 전체
- `packages/mapleInsight-types/` 하위 tracked 파일 전체
- `packages/mapleInsight-ui/` 하위 tracked 파일 대부분
- `packages/mapleInsight-utils/` 하위 tracked 파일 전체

### 현재 프론트 내부 삭제/이동 흔적

- `apps/frontend/src/features/character/components/RefreshButton.tsx`
- `apps/frontend/src/features/character/components/equipment/EquipmentCard/` 하위 기존 파일들
- `apps/frontend/src/features/character/types/equipment.ts`
- `apps/frontend/src/pages/MainPage/index.tsx`

## 해석

- 이번 상태는 단순 기능 수정이라기보다, 레거시 앱/패키지 제거와 새 workspace 구조 추가가 섞인 대규모 변경입니다.
- `D`가 압도적으로 많아, 커밋을 나눈다면 레거시 삭제 커밋과 신규 구조/기능 커밋을 분리하는 편이 좋습니다.
- `apps/frontend/src/features/character/components/.equipment.legacy/`는 untracked legacy 디렉터리라, 보관 목적이 아니면 정리 대상입니다.

## 커밋 분류안

### 1. 레거시 앱 정리

```txt
chore(workspace): 레거시 앱 디렉터리 정리

- `apps/front` 기존 앱 파일 제거
- `apps/note` 기존 실험/노트 앱 파일 제거
- `apps/ricemc` 기존 앱 파일 제거
- 루트의 오래된 백업 설정 파일 제거

keyword: `workspace`, `legacy`, `apps`, `cleanup`, `front`, `note`, `ricemc`
```

대상:

- `apps/front/`
- `apps/note/`
- `apps/ricemc/`
- `.workmux.yaml`
- `__eslint.config.js`
- `eslint.md`
- `package_20251021.json`

### 2. 레거시 패키지 정리

```txt
chore(packages): 레거시 패키지 디렉터리 정리

- `packages/css-conponents` 제거
- `packages/mapleInsight-types` 제거
- `packages/mapleInsight-ui` 제거
- `packages/mapleInsight-utils` 제거

keyword: `packages`, `legacy`, `cleanup`, `ui`, `types`, `utils`
```

대상:

- `packages/css-conponents/`
- `packages/mapleInsight-types/`
- `packages/mapleInsight-ui/`
- `packages/mapleInsight-utils/`

### 3. 워크스페이스 패키지 구조 추가

```txt
feat(workspace): 신규 데이터 패키지 워크스페이스 추가

- API 타입 패키지 추가
- contracts 패키지 추가
- database 패키지 추가
- game-data와 generator 패키지 추가
- simulator 패키지 추가
- workspace 설정 갱신

keyword: `workspace`, `packages`, `contracts`, `database`, `game-data`, `generator`, `simulator`
```

대상:

- `packages/api-types/`
- `packages/contracts/`
- `packages/database/`
- `packages/game-data/`
- `packages/game-data-legacy/`
- `packages/generator/`
- `packages/simulator/`
- `packages/package.json`
- `pnpm-workspace.yaml`
- `pnpm-lock.yaml`
- `package.json`
- `tsconfig.base.json`

### 4. 백엔드 캐릭터 도메인 개편

```txt
refactor(back-character): 캐릭터 조회 응답 매핑 구조 개편

- 캐릭터 도메인 constants와 service 수정
- 캐릭터 조회 controller와 route 수정
- 장비/스탯/스킬 등 mapper 파일 갱신
- 기존 raw 타입 파일 제거
- 캐릭터 조회 validator 추가

keyword: `backend`, `character`, `mapper`, `service`, `validator`, `contracts`
```

대상:

- `apps/back/src/domain/character/character.constants.ts`
- `apps/back/src/domain/character/character.controller.ts`
- `apps/back/src/domain/character/character.raw.test.ts`
- `apps/back/src/domain/character/character.route.ts`
- `apps/back/src/domain/character/character.service.ts`
- `apps/back/src/domain/character/character.validators.ts`
- `apps/back/src/domain/character/constants/classMetaMap.ts`
- `apps/back/src/domain/character/mappers/`
- `apps/back/src/domain/character/types/`
- `apps/back/src/domain/character/utils/getStatUnit.ts`
- `apps/back/src/domain/character/utils/grade.ts`
- `apps/back/src/domain/character/normalized.item-equipment.json`
- `apps/back/src/domain/character/raw.item-equipment.json`

### 5. 백엔드 레거시 도메인 제거

```txt
chore(back): 백엔드 레거시 심볼과 직업 모듈 제거

- 기존 symbol 도메인 제거
- 기존 jobs 디렉터리 제거
- 사용하지 않는 백엔드 타입 파일 제거
- 오래된 가이드 문서 제거

keyword: `backend`, `legacy`, `symbol`, `jobs`, `cleanup`, `types`
```

대상:

- `apps/back/evaluator-guide.md`
- `apps/back/generator-guide.md`
- `apps/back/planner-guide.md`
- `apps/back/src/domain/symbol/`
- `apps/back/src/jobs/`
- `apps/back/src/types/deep-nullable.ts`
- `apps/back/src/types/jops.type.ts`
- `apps/back/src/types/response.ts`
- `apps/back/src/types/skill.type.ts`

### 6. 백엔드 인증 도메인 추가

```txt
feat(back-auth): Nexon API Key 세션 인증 도메인 추가

- auth 도메인 route/controller/service/types 추가
- API Key 등록 엔드포인트 추가
- 현재 인증 상태 조회와 로그아웃 엔드포인트 추가
- auth 라우터를 router loader에 연결
- 세션/CORS 설정 보강

keyword: `backend`, `auth`, `session`, `api-key`, `nexon`, `express`
```

대상:

- `apps/back/src/domain/auth/`
- `apps/back/src/loaders/express.loader.ts`
- `apps/back/src/loaders/router.loader.ts`

### 7. 백엔드 설정 구조 정리

```txt
refactor(back-config): 백엔드 설정과 API config 구조 정리

- config 타입 파일 위치 정리
- API endpoint 설정 디렉터리 추가
- tsconfig와 tsup 설정 갱신
- 백엔드 package 설정 갱신

keyword: `backend`, `config`, `api`, `tsconfig`, `tsup`, `package`
```

대상:

- `apps/back/package.json`
- `apps/back/src/config/api-config.ts`
- `apps/back/src/config/index.ts`
- `apps/back/src/config/api/`
- `apps/back/src/config/types.ts`
- `apps/back/src/config/config.type.ts`
- `apps/back/src/config/test.ts`
- `apps/back/tsconfig.json`
- `apps/back/tsconfig.test.json`
- `apps/back/tsup.config.ts`
- `apps/back/src/middlewares/error-handler.ts`
- `apps/back/src/types/index.ts`

### 8. 프론트 공용 네비게이션 컴포넌트 추가

```txt
feat(front-ui): LinkButton 네비게이션 컴포넌트 추가

- LinkButton 컴포넌트 추가
- variant와 size 스타일 맵 추가
- components barrel export 추가
- theme 타입 추가

keyword: `frontend`, `component`, `link-button`, `navigation`, `theme`, `ui`
```

대상:

- `apps/frontend/src/components/index.ts`
- `apps/frontend/src/components/navigations/LinkButton.tsx`
- `apps/frontend/src/components/navigations/index.ts`
- `apps/frontend/src/types/theme.ts`

### 9. 프론트 홈과 로그인 모달 추가

```txt
feat(front-home): 홈 화면과 API Key 로그인 모달 추가

- 홈 화면 UI 추가
- 캐릭터 검색 중심의 메인 화면 구성
- 공지사항 영역 추가
- API Key 등록 모달 추가
- auth barrel export 추가

keyword: `frontend`, `home`, `auth`, `modal`, `api-key`, `notice`
```

대상:

- `apps/frontend/src/pages/html.tsx`
- `apps/frontend/src/features/auth/components/LoginModal.tsx`
- `apps/frontend/src/features/auth/components/index.ts`
- `apps/frontend/src/features/auth/index.ts`
- `apps/frontend/src/pages/index.ts`
- `apps/frontend/src/router/config.tsx`

### 10. 프론트 관리자 업로드 화면 추가

```txt
feat(front-admin): 관리자 대시보드와 CSV 업로드 화면 추가

- `/admin` 대시보드 추가
- 업로드 이력 목록 화면 추가
- 새 CSV 업로드 화면 추가
- 업로드 상세 화면 추가
- admin 라우트 연결

keyword: `frontend`, `admin`, `import`, `csv`, `upload`, `dashboard`
```

대상:

- `apps/frontend/src/pages/admin/`
- `apps/frontend/src/router/config.tsx`

### 11. 프론트 캐릭터 feature 구조 정리

```txt
refactor(front-character): 캐릭터 feature 구조와 import 경로 정리

- character feature barrel export 추가
- query key 상수 추가
- 캐릭터 검색 API 로그 제거
- 검색/새로고침 hook 정리
- 깊은 import 경로를 feature 루트 import로 변경

keyword: `frontend`, `character`, `feature`, `barrel`, `query-key`, `refactor`
```

대상:

- `apps/frontend/src/features/character/api.ts`
- `apps/frontend/src/features/character/index.ts`
- `apps/frontend/src/features/character/queryKeys.ts`
- `apps/frontend/src/features/character/components/index.ts`
- `apps/frontend/src/features/character/hooks/index.ts`
- `apps/frontend/src/features/character/hooks/useCharacterRefresh.ts`
- `apps/frontend/src/features/character/hooks/useSearchNick.ts`
- `apps/frontend/src/layout/CharacterLayout.tsx`
- `apps/frontend/src/layout/Header.tsx`
- `apps/frontend/src/pages/CharacterPage/CharacterMainPage/index.tsx`

### 12. 프론트 장비 카드 구조 평탄화

```txt
refactor(front-equipment): 장비 카드 컴포넌트 구조 평탄화

- EquipmentCard 하위 깊은 폴더 구조 제거
- ItemOptionList와 StarForceSlot을 equipment 루트로 이동
- item option 메타 파일 분리
- 기존 장비 카드 legacy 파일 제거
- 장비 레이아웃 타입 참조 경로 정리

keyword: `frontend`, `equipment`, `component`, `equipment-card`, `starforce`, `refactor`
```

대상:

- `apps/frontend/src/features/character/components/equipment/EquipmentCard.tsx`
- `apps/frontend/src/features/character/components/equipment/ItemOptionList.tsx`
- `apps/frontend/src/features/character/components/equipment/StarForceSlot.tsx`
- `apps/frontend/src/features/character/components/equipment/itemOptionMeta.ts`
- `apps/frontend/src/features/character/components/equipment/index.ts`
- `apps/frontend/src/features/character/components/equipment/EquipmentCard/`
- `apps/frontend/src/features/character/types/equipment.ts`
- `apps/frontend/src/features/character/components/RefreshButton.tsx`
- `apps/frontend/src/features/character/components/.equipment.legacy/`

### 13. 프론트 장비 화면 UI 조정

```txt
style(front-equipment): 장비 카드와 슬롯 UI 비율 조정

- 장비 카드 최대 너비와 최소 너비 조정
- 스타포스 별 크기와 간격 조정
- 장비 슬롯과 컨테이너 스타일 조정
- 캐릭터 장비 페이지 레이아웃 조정

keyword: `frontend`, `equipment`, `ui`, `responsive`, `starforce`, `layout`
```

대상:

- `apps/frontend/src/features/character/components/equipment/EquipmentCard.tsx`
- `apps/frontend/src/features/character/components/equipment/StarForceSlot.tsx`
- `apps/frontend/src/features/character/components/equipment/EquipmentContainer.tsx`
- `apps/frontend/src/features/character/components/equipment/EquipmentGrid.tsx`
- `apps/frontend/src/features/character/components/equipment/EquipmentSlot.tsx`
- `apps/frontend/src/pages/CharacterPage/CharacterMainPage/index.tsx`

### 14. 프론트 설정 갱신

```txt
chore(front-config): 프론트 설정과 패키지 의존성 갱신

- frontend package 설정 갱신
- tsconfig 설정 갱신
- Vite 설정 갱신
- legacy tsconfig 백업 추가
- world 타입 갱신

keyword: `frontend`, `config`, `vite`, `tsconfig`, `package`, `types`
```

대상:

- `apps/frontend/package.json`
- `apps/frontend/tsconfig.app.json`
- `apps/frontend/tsconfig.json`
- `apps/frontend/tsconfig.node.json`
- `apps/frontend/tsconfig.app.legacy`
- `apps/frontend/tsconfig.node.legacy`
- `apps/frontend/vite.config.ts`
- `apps/frontend/src/types/worlds.ts`

### 15. 데이터 수집/ERD 앱 추가

```txt
feat(data-tools): ERD와 ingestor 앱 추가

- ERD 앱 추가
- ingestor 앱 추가
- 데이터 처리 로드맵 문서 추가

keyword: `erd`, `ingestor`, `data`, `app`, `roadmap`
```

대상:

- `apps/erd/`
- `apps/ingestor/`
- `apps/roadmap.md`

### 16. 프로젝트 문서 추가

```txt
docs(project): 프로젝트 구조와 아키텍처 문서 추가

- Architecture 문서 추가
- Project Structure 문서 추가
- git status 정리 문서 추가

keyword: `docs`, `architecture`, `project-structure`, `git-status`
```

대상:

- `docs/Architecture.md`
- `docs/Project-Structure.md`
- `git-status.md`

## 권장 커밋 순서

1. `chore(workspace): 레거시 앱 디렉터리 정리`
2. `chore(packages): 레거시 패키지 디렉터리 정리`
3. `feat(workspace): 신규 데이터 패키지 워크스페이스 추가`
4. `refactor(back-config): 백엔드 설정과 API config 구조 정리`
5. `refactor(back-character): 캐릭터 조회 응답 매핑 구조 개편`
6. `chore(back): 백엔드 레거시 심볼과 직업 모듈 제거`
7. `feat(back-auth): Nexon API Key 세션 인증 도메인 추가`
8. `feat(front-ui): LinkButton 네비게이션 컴포넌트 추가`
9. `feat(front-home): 홈 화면과 API Key 로그인 모달 추가`
10. `feat(front-admin): 관리자 대시보드와 CSV 업로드 화면 추가`
11. `refactor(front-character): 캐릭터 feature 구조와 import 경로 정리`
12. `refactor(front-equipment): 장비 카드 컴포넌트 구조 평탄화`
13. `style(front-equipment): 장비 카드와 슬롯 UI 비율 조정`
14. `chore(front-config): 프론트 설정과 패키지 의존성 갱신`
15. `feat(data-tools): ERD와 ingestor 앱 추가`
16. `docs(project): 프로젝트 구조와 아키텍처 문서 추가`
