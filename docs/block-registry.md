# Block Registry

- `components/layout/block-registry.tsx`에서 블록 버튼 클릭 시 `overlay.open`으로 Popover를 띄웁니다. 클릭한 버튼 엘리먼트를 `anchor`로 전달해 위치를 고정하며, `overlayId`를 키로 모듈 전역 `Map`에 payload(아이템/앵커/키)를 저장해 React Compiler의 “render 중 컴포넌트 생성” 제약을 피합니다.
- Popover 콘텐츠는 블록 라벨과 UI 타입 설명(`BLOCK_UI_HINT`)을 노출하고, 추후 생성 워크플로우가 연결될 CTA 영역을 남겨둡니다.
- Base UI Popover를 사용하므로 `PopoverPopup`에 `anchor`를 넘기면 버튼 위치에 맞춰 표시됩니다. 닫힘 시에는 `onOpenChange`와 `onOpenChangeComplete`에서 `close` → `unmount` 순서로 정리됩니다.
- 블록 유형이나 설명을 추가하려면 `BLOCK_REGISTRY`와 `BLOCK_UI_HINT`를 함께 업데이트하세요.
