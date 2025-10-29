# 2024-02-14 DynamicFab 이슈 요약

- SelectBox3를 Fab 라벨로 감쌀 때 클릭 이벤트가 Fab 드래그/호버 로직에 흡수되어 `렌더링 중 상태 변환` 경고 및 SelectBox 단독 동작이 불가능했던 문제를 확인함.
- 해결 방안으로 Fab 내부에 `data-skip-fab="true"` 영역을 도입해 SelectBox 이벤트가 Fab 드래그 및 리스트 노출 로직에 영향을 주지 않도록 제안.
- `components/shared/Fab/index.tsx`에서 마우스 이벤트 핸들러가 `shouldSkipFab` 검사를 먼저 수행하도록 수정하고, `ui/interactive/DynamicFab/index.tsx`에서 라벨 래퍼에 `data-skip-fab`과 캡처 단계 `stopPropagation`을 추가하는 전체 코드 예시 제공.
- 사용하지 않는 Fab 상태(`_isFabListVisible`, `_isSelectOpen`) 제거 권장 및 향후 셀렉트 트리거에도 동일한 보호 로직을 고려하도록 안내.
