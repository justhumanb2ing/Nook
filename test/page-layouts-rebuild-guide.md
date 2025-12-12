# blocks → page_layouts 전면 재작성 가이드 (간결판)

## 전제

- blocks / block_* 테이블 완전 폐기
- page_layouts가 레이아웃의 유일한 Source of Truth
- 프론트는 이미 layout을 보유
- 서버(Supabase)는 저장만 담당

---

## 삭제 대상 (전부)

```text
service/blocks/
  ├─ create-block.ts
  ├─ update-block-content.ts
  ├─ delete-block.ts
  ├─ reorder-blocks.ts
  └─ save-block-layout.ts
```

→ 전부 삭제

---

## 새로 만드는 파일 목록 (정답)

```text
service/layouts/
  ├─ add-layout-item.ts
  ├─ delete-layout-item.ts
  ├─ reorder-layout-items.ts
  └─ save-page-layout.ts
```

---

## 1. add-layout-item.ts

### 역할
- 새 블록 생성
- layout.items.push 후 전체 layout 저장

### 함수명
```ts
requestAddLayoutItem
```

### params
```ts
{
  supabase: SupabaseClient;
  userId: string | null;
  pageId: PageId;
  layout: PageLayout;
  newItem: LayoutItem;
}
```

### 유의사항
- layout 재조회 금지
- item id / position / style 생성 금지 (프론트 책임)
- block 단위 DB 개념 금지

---

## 2. delete-layout-item.ts

### 역할
- 블록 삭제
- layout.items.filter 후 저장

### 함수명
```ts
requestDeleteLayoutItem
```

### params
```ts
{
  supabase: SupabaseClient;
  userId: string | null;
  pageId: PageId;
  layout: PageLayout;
  itemId: string;
}
```

### 유의사항
- blockId 기반 DB 조회 금지
- handle 기반 page 조회 금지

---

## 3. reorder-layout-items.ts

### 역할
- 블록 순서 변경
- 이미 정렬된 items 배열을 그대로 저장

### 함수명
```ts
requestReorderLayoutItems
```

### params
```ts
{
  supabase: SupabaseClient;
  userId: string | null;
  pageId: PageId;
  layout: PageLayout;
  nextItems: LayoutItem[];
}
```

### 유의사항
- ordering 개념 금지
- 서버 정렬 금지

---

## 4. save-page-layout.ts

### 역할
- layout 전체 스냅샷 저장
- 모든 편집의 최종 도착지

### 함수명
```ts
requestSavePageLayout
```

### params
```ts
{
  supabase: SupabaseClient;
  userId: string | null;
  pageId: PageId;
  layout: PageLayout;
}
```

### 유의사항 (핵심)
- layout 병합 금지
- layout 재조회 금지
- pages 직접 조회 금지

---

## 공통 규칙

- layout은 항상 프론트에서 완성
- 서버 함수는 저장만 담당
- mutation 함수에서 fetch 금지
- 파일/함수명에서 "block" 용어 제거

---

## 최종 한 줄

> 계산은 프론트, 저장은 서버.  
> blocks 시대의 모든 파일은 삭제하고,  
> layout snapshot 기반 함수 4개만 다시 만든다.
