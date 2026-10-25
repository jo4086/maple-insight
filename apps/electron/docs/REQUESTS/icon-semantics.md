# 아이콘 의미 정책 요청

- 상태: **완료 — 현재 UI 사용 범위 구현 및 검증 완료**
- 완료일: 2026-10-15
- 범위: Electron renderer에서 앱이 제어하는 방향·탐색 Lucide 아이콘의 의미, 표시, 접근성
- 기준: [SPEC §8.1 `APP-010`·`APP-011`](../SPEC/01-foundation.md#icon-semantics) · [요청 목차](./README.md)
- 기존 Phase 03 완료 기록은 이 요청의 완료 근거로 사용하지 않았다. `APP-010`의 대시보드 비교 방향 아이콘 세로 중앙 배치는 유지했다.

## 요청 및 수용 계약

1. `ChevronRight`는 계층 진입 또는 단계 진행에만 사용한다.
2. `ArrowRight`는 데이터 흐름 방향에만 사용한다.
3. `ArrowUpRight`는 앱 내부의 다른 화면으로 이동하는 탐색에만 사용한다.
4. `ExternalLink`는 외부 목적지 또는 새 창 열기에만 사용하며 내부 탐색과 구분한다.
5. `ChevronDown`과 `ChevronUp`은 같은 영역의 펼침과 접힘 상태에만 사용한다.
6. `ArrowLeft`는 이전 화면이나 이전 단계로 돌아가기에만 사용한다.
7. `ArrowLeftRight`는 두 대상의 실제 교환에만 사용하며 비교 방향이나 단순 양방향 가능성을 나타내는 데 사용하지 않는다.
8. 앱이 제어하는 위 8개 Lucide 아이콘은 `14`, `16`, `18`, `20` 크기와 `strokeWidth={1.75}`만 사용한다. 이 정밀 기준은 기존 `APP-011`의 포괄적인 "굵은 glyph" 기준을 대체한다. native control이 직접 그려 앱이 제어할 수 없는 glyph는 범위에서 제외한다.
9. 아이콘 기본색은 muted로 표시하고 hover와 keyboard focus에서 충분한 대비를 제공한다. 상태 변화 전후에도 아이콘과 label의 고정 위치·영역을 유지하여 layout shift를 만들지 않는다.
10. 아이콘 전용 button과 link는 동작을 설명하는 `aria-label` 또는 동등한 접근 가능한 이름을 제공한다. 장식 아이콘은 중복 이름을 노출하지 않는다.
11. 이 요청은 아이콘 선택과 표시·접근성만 변경한다. 기존 click·keyboard event 동작, 탐색 대상, IPC, 상태 변경, 데이터 계약은 변경하지 않는다.

<a id="roadmap"></a>
## ROADMAP — 적용 결과

1. 기존 `ArrowIcon`을 삭제하고 `lucide-react` 1.61을 설치했다.
2. 처리 workflow 단계는 `ChevronRight` 16, 빠른 작업의 내부 화면 이동은 `ArrowUpRight` 18로 교체했다.
3. dashboard와 diff의 기준→대상 데이터 흐름은 `ArrowRight` 18을 사용했다. 작은 버전·변환 흐름 표시는 허용 크기 14 또는 16을 사용했다.
4. 모든 `VersionSelect`, `ReleaseDateSelect`, diff 파일 select는 `ChevronDown` 16을 사용하고 sidebar accordion은 `ChevronDown`·`ChevronUp` 16을 사용했다.
5. 모든 현재 UI 방향 아이콘은 `strokeWidth={1.75}`를 사용한다. 기존 이벤트·탐색·데이터 계약은 변경하지 않았다.
6. 현재 renderer에는 외부 목적지·새 창 control, 뒤로가기 control, 실제 swap action이 없다. 따라서 `ExternalLink`, `ArrowLeft`, `ArrowLeftRight` 정책은 유지하지만 사용 인스턴스 검증 대상으로 주장하지 않는다.

<a id="goal"></a>
## GOAL — 현재 UI 범위 완료

- [x] 현재 UI에 존재하는 방향 아이콘 사용 위치를 의미 정책에 맞췄다.
- [x] 현재 사용 아이콘이 크기 `14`·`16`·`18`과 `strokeWidth={1.75}`를 사용함을 확인했다.
- [x] muted 기본색, hover·keyboard focus 대비와 고정 위치를 native Electron에서 확인했다.
- [x] desktop 1480px와 mobile 390px의 light·dark 화면에서 아이콘 geometry와 layout shift 부재를 확인했다.
- [x] select keyboard 동작, 내부 탐색, 버전 비교와 기존 데이터 변경 흐름을 회귀 검증했다.
- [x] `ExternalLink`, `ArrowLeft`, `ArrowLeftRight`는 정책만 확정하고 현재 UI에 검증할 사용 인스턴스가 없음을 확인했다.

<a id="review"></a>
## REVIEW — 완료 (2026-10-15)

- Electron build가 통과했다.
- Vitest 20개 파일·157개 테스트가 통과했다.
- lint가 통과했다.
- native Electron `verify-version-ui`와 `verify-diff`가 desktop 1480px·mobile 390px의 light·dark에서 통과했다. 아이콘 geometry, hover·focus, select keyboard 동작, 내부 탐색과 비교 흐름을 확인했다.
- 격리된 임시 PostgreSQL에서 version-mutations 검증이 통과했고 DB를 폐기했다. 아이콘 변경 뒤 기존 event·IPC·데이터 변경 동작의 회귀가 없음을 확인했다.
- 정적 조사에서 `ArrowIcon` 파일과 참조가 제거되고 `lucide-react` 1.61이 연결되었음을 확인했다. renderer에는 `ExternalLink`, `ArrowLeft`, `ArrowLeftRight` 사용, 외부 목적지·새 창 control 또는 swap action이 없다.
- 이 완료는 현재 UI 사용 범위에 한정한다. 이후 외부 링크·새 창, 뒤로가기, swap UI가 추가되면 미사용 정책에 따른 별도 검증이 필요하다.
