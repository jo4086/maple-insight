# ERD App 현재 상태 평가

작성일: 2026-04-18
대상: `apps/erd`
기준: 현재 로컬 구현 상태 기준 코드 리뷰

**Check List**:

- [ ] 저장 UX와 실제 저장 방식 불일치
- [x] 존재하지 않는 문서 ID 진입시 로딩 화면 고정
  - 404 not-found 페이지로 분기
- [ ] 관계 기능은 노출되어 있지만 실제 동작이 없음
- [ ] 엔티티 삭제 시 relation 정리가 되지 않음

## 요약

현재 구현은 다음 범위까지는 충분히 확인되었습니다.

- ERD 문서 목록 화면
- 로컬 스토리지 기반 문서 저장/복제/삭제
- ERD 편집 캔버스
- 엔티티/컬럼 편집
- 미니맵
- DDL 미리보기

즉, "로컬에서 쓰는 ERD 프로토타입"으로는 이미 데모 가능한 수준입니다.  
다만 저장 UX, 잘못된 진입 경로 처리, 관계 기능 노출 방식에서 사용자 기대와 실제 동작이 어긋나는 부분이 있습니다.

## 주요 문제점

### 1. 저장 UX와 실제 저장 방식이 일치하지 않음

심각도: High

현재 기존 문서는 편집 시점에 바로 `localStorage`에 반영됩니다.  
하지만 상단에는 별도의 Save 버튼과 dirty 상태 표시가 있어서 사용자는 "명시적으로 저장해야 반영된다"고 오해하기 쉽습니다.

관련 코드:

- [src/pages/erd/editor/Page.tsx](/home/rice/projects/maple_repo/apps/erd/src/pages/erd/editor/Page.tsx:292)
- [src/pages/erd/editor/Page.tsx](/home/rice/projects/maple_repo/apps/erd/src/pages/erd/editor/Page.tsx:303)
- [src/pages/erd/editor/Page.tsx](/home/rice/projects/maple_repo/apps/erd/src/pages/erd/editor/Page.tsx:363)

영향:

- 사용자가 저장 시점을 신뢰하기 어려움
- 자동 저장인지 수동 저장인지 제품 의도가 불명확함
- 이후 동기화, 버전 관리, 임시 저장 기능 확장 시 설계 충돌 가능

권장 대응:

- 둘 중 하나로 명확히 정리
- 완전 자동 저장으로 갈 경우 Save 버튼 의미를 변경
- 수동 저장으로 갈 경우 편집 중에는 메모리 상태만 유지하고 Save 시점에만 저장

### 2. 존재하지 않는 문서 ID 진입 시 로딩 화면에 고정됨

심각도: Medium

`/erd/:erdId` 경로로 들어왔을 때 해당 문서가 없으면 `document`가 `null`이 되지만, 화면에서는 이를 "불러오는 중" 상태로만 처리합니다.

관련 코드:

- [src/pages/erd/editor/Page.tsx](/home/rice/projects/maple_repo/apps/erd/src/pages/erd/editor/Page.tsx:231)
- [src/pages/erd/editor/Page.tsx](/home/rice/projects/maple_repo/apps/erd/src/pages/erd/editor/Page.tsx:480)

영향:

- 잘못된 URL 접근 시 사용자가 원인을 알 수 없음
- 새로고침이나 오래된 북마크 사용 시 UX 저하
- 실제 오류와 로딩 상태가 구분되지 않음

권장 대응:

- 문서를 찾지 못한 경우 404 화면으로 이동
- 또는 `/erd` 목록으로 리다이렉트
- 최소한 "존재하지 않는 문서" 안내 메시지 제공

### 3. 관계 기능은 노출되어 있지만 실제 동작이 없음

심각도: Medium

툴바에서 non-identifying / identifying relation 버튼이 보이지만 실제로 relation을 생성하거나 선을 연결하는 동작은 없습니다. 현재는 `relationMode` 상태만 토글됩니다.

관련 코드:

- [src/pages/erd/editor/Page.tsx](/home/rice/projects/maple_repo/apps/erd/src/pages/erd/editor/Page.tsx:195)
- [src/pages/erd/editor/Page.tsx](/home/rice/projects/maple_repo/apps/erd/src/pages/erd/editor/Page.tsx:735)

영향:

- 사용자가 핵심 기능이 구현된 것으로 오해함
- 제품 신뢰도 저하
- 이후 relation 데이터 모델과 UI가 분리된 채 누적될 위험

권장 대응:

- 구현 전까지 버튼을 숨기거나 비활성화
- 또는 "준비 중" 상태를 명시
- 실제 relation 작성 플로우를 붙일 경우:
- 엔티티 선택
- 참조 컬럼 선택
- relation 데이터 생성
- 캔버스 시각화
- 삭제/수정/DDL 반영까지 연결

### 4. 엔티티 삭제 시 relation 정리가 되지 않음

심각도: Medium

엔티티를 삭제할 때 현재는 `entities`만 제거하고 relation 정리는 하지 않습니다. relation이 본격적으로 활성화되면 삭제된 엔티티를 참조하는 relation이 남을 수 있습니다.

관련 코드:

- [src/pages/erd/editor/Page.tsx](/home/rice/projects/maple_repo/apps/erd/src/pages/erd/editor/Page.tsx:669)
- [src/features/erd/sql.ts](/home/rice/projects/maple_repo/apps/erd/src/features/erd/sql.ts:66)

영향:

- 고아 relation 데이터 발생 가능
- DDL 생성 결과가 조용히 일부 누락될 수 있음
- 나중에 버그 원인 추적이 어려워짐

권장 대응:

- 엔티티 삭제 시 관련 relation도 함께 제거
- 컬럼 삭제 시 연결된 relation도 함께 정리
- 저장 전 relation 무결성 검사 추가

## 좋은 점

현재 구조에서 좋게 본 부분도 분명합니다.

- 목록, 편집기, DDL 프리뷰까지 흐름이 이어져 있음
- `localStorage` 기반 문서 관리가 빠르게 확인 가능함
- 타입 정의가 비교적 분명함
- `storage.ts`에서 정규화 로직을 두고 있어 이후 마이그레이션 대응이 쉬움
- 에디터 관련 UI가 기능 단위로 적절히 분리되어 있음
- 빌드와 린트가 현재 기준으로 통과함

## 권장 우선순위

### 1차

- 저장 정책 정리
- 잘못된 문서 진입 처리
- relation 버튼 비노출 또는 비활성화

### 2차

- relation 생성/삭제/시각화 설계
- 엔티티/컬럼 삭제 시 relation 무결성 정리

### 3차

- SQL dialect 선택 기능
- 문서 메타데이터 확장
- 썸네일/미리보기 개선

## 현재 판단

지금 상태는 "기초 구조가 괜찮은 로컬 ERD 프로토타입"입니다.  
핵심 구조를 다시 엎어야 하는 수준은 아니고, UX와 상태 모델을 먼저 정리하면 다음 단계로 넘어갈 수 있습니다.

가장 먼저 손봐야 할 것은 기능 추가보다도 "사용자가 지금 무엇이 저장되고, 무엇이 아직 미완성인지 정확히 알 수 있게 만드는 것"입니다.
