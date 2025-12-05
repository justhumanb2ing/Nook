import type { BlockType } from "@/config/block-registry";
import type { BlockWithDetails } from "@/types/block";

const toStringOrNull = (value: unknown): string | null =>
  typeof value === "string" ? value : null;

const toNumberOrNull = (value: unknown): number | null =>
  typeof value === "number" ? value : null;

/**
 * BlockWithDetails 배열의 ordering을 0부터 연속된 값으로 재정렬한다.
 * - ordering이 없거나 null인 경우 배열 위치를 기반으로 채운다.
 */
export const resequenceBlocks = (
  blocks: BlockWithDetails[]
): BlockWithDetails[] => {
  const sorted = [...blocks].sort((a, b) => {
    const aOrder = typeof a.ordering === "number" ? a.ordering : Number.MAX_SAFE_INTEGER;
    const bOrder = typeof b.ordering === "number" ? b.ordering : Number.MAX_SAFE_INTEGER;
    if (aOrder !== bOrder) return aOrder - bOrder;
    const aCreated = a.created_at ?? "";
    const bCreated = b.created_at ?? "";
    return aCreated.localeCompare(bCreated);
  });

  return sorted.map((block, index) => ({ ...block, ordering: index }));
};

type RawBlock = Partial<BlockWithDetails> & Record<string, unknown>;

/**
 * Supabase RPC 결과 등 Raw 데이터를 BlockWithDetails로 평탄화한다.
 */
export const toBlockWithDetails = (
  block: RawBlock,
  fallbackOrdering: number
): BlockWithDetails => ({
  id: String(block.id),
  type: block.type as BlockWithDetails["type"],
  ordering:
    typeof block.ordering === "number" ? block.ordering : fallbackOrdering,
  created_at:
    typeof block.created_at === "string"
      ? block.created_at
      : new Date().toISOString(),
  content: toStringOrNull(block.content),
  url: toStringOrNull(block.url),
  title: toStringOrNull(block.title),
  description: toStringOrNull(block.description),
  image_url: toStringOrNull(block.image_url),
  icon_url: toStringOrNull(block.icon_url),
  link_url: toStringOrNull(block.link_url),
  aspect_ratio: toNumberOrNull(block.aspect_ratio),
  thumbnail: toStringOrNull(block.thumbnail),
  lat: toNumberOrNull(block.lat),
  lng: toNumberOrNull(block.lng),
  zoom: toNumberOrNull(block.zoom),
});

/**
 * Block 배열을 BlockWithDetails로 변환하고 ordering을 정규화한다.
 */
export const normalizeBlocks = (
  blocks: RawBlock[]
): BlockWithDetails[] => resequenceBlocks(blocks.map((block, index) => toBlockWithDetails(block, index)));

const pickBlockDataFields = (
  data: Record<string, unknown>
): Partial<BlockWithDetails> => ({
  content: toStringOrNull(data.content),
  url: toStringOrNull(data.url),
  title: toStringOrNull(data.title),
  description: toStringOrNull(data.description),
  image_url: toStringOrNull(data.image_url),
  icon_url: toStringOrNull(data.icon_url),
  link_url: toStringOrNull(data.link_url),
  aspect_ratio: toNumberOrNull(data.aspect_ratio),
  thumbnail: toStringOrNull(data.thumbnail),
  lat: toNumberOrNull(data.lat),
  lng: toNumberOrNull(data.lng),
  zoom: toNumberOrNull(data.zoom),
});

/**
 * 낙관적 UI용 BlockWithDetails를 생성한다.
 */
export const createOptimisticBlock = (
  params: {
    type: BlockType;
    data: Record<string, unknown>;
    currentLength: number;
  }
): BlockWithDetails => ({
  id: crypto.randomUUID(),
  type: params.type,
  ordering: params.currentLength,
  created_at: new Date().toISOString(),
  ...pickBlockDataFields(params.data),
});

/**
 * ordering payload를 기존 블록 목록에 적용하고 정규화한다.
 */
export const applyOrderingPatch = (
  blocks: BlockWithDetails[],
  payload: { id: string; ordering: number }[]
): BlockWithDetails[] => {
  const orderingMap = new Map(payload.map(({ id, ordering }) => [id, ordering]));
  const patched = blocks.map((block) =>
    orderingMap.has(block.id)
      ? { ...block, ordering: orderingMap.get(block.id) ?? block.ordering }
      : block
  );

  return resequenceBlocks(patched);
};

/**
 * 콘텐츠 업데이트 payload를 기존 블록에 병합하고 ordering을 유지한다.
 */
export const applyContentPatch = (
  blocks: BlockWithDetails[],
  params:
    | { type: "text"; blockId: string; content: string }
    | { type: "link"; blockId: string; url: string; title: string }
): BlockWithDetails[] =>
  blocks.map((block) => {
    if (block.id !== params.blockId) return block;
    if (params.type === "text") {
      return { ...block, content: params.content };
    }
    return { ...block, url: params.url, title: params.title };
  });
