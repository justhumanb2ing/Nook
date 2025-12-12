import type { normalizeBlocks } from "@/service/blocks/block-normalizer";
import type {
  BlockType,
  LayoutBlock,
  LayoutPayload,
  LayoutSize,
} from "@/types/layout";

type NormalizableBlocksInput = Parameters<typeof normalizeBlocks>[0];

const STYLE_PATTERN = /^(\d+)x(\d+)$/;

export const extractLayoutBlocks = (payload: LayoutPayload): LayoutBlock[] => {
  const candidates = Array.isArray(payload) ? payload : [payload];

  for (const candidate of candidates) {
    if (!candidate) continue;
    if (Array.isArray(candidate)) {
      return candidate;
    }

    const layout = (candidate as { layout?: unknown }).layout ?? candidate;
    const blocks = (layout as { blocks?: unknown }).blocks ?? layout;
    if (Array.isArray(blocks)) {
      return blocks;
    }
  }

  return [];
};

export const toNormalizableBlocks = (
  blocks: LayoutBlock[]
): NormalizableBlocksInput =>
  blocks
    .filter(
      (block): block is LayoutBlock & { id: string; type: BlockType } =>
        Boolean(block?.id) && Boolean(block?.type)
    )
    .map((block) => {
      const position =
        block.position?.desktop ??
        block.position?.mobile ?? { x: undefined, y: undefined };
      const style = resolveLayoutStyle(block.style);

      return {
        id: block.id,
        type: block.type,
        created_at: block.created_at ?? undefined,
        x: position?.x ?? undefined,
        y: position?.y ?? undefined,
        w: style.w,
        h: style.h,
        ...normalizeBlockData(block.data),
      };
    });

export const resolveLayoutStyle = (
  style: LayoutSize | null | undefined,
  preferred: "desktop" | "mobile" = "desktop"
): { w?: number; h?: number } => {
  const sizeString =
    (preferred === "desktop" ? style?.desktop : style?.mobile) ??
    (preferred === "desktop" ? style?.mobile : style?.desktop);
  if (!sizeString) return {};

  const match = sizeString.match(STYLE_PATTERN);
  if (!match) return {};

  const [, width, height] = match;
  const w = Number(width);
  const h = Number(height);

  return {
    w: Number.isFinite(w) ? w : undefined,
    h: Number.isFinite(h) ? h : undefined,
  };
};

export const normalizeBlockData = (
  data: Record<string, unknown> | null | undefined
): Record<string, unknown> => {
  if (!data) return {};

  const normalized = { ...data };

  if (
    typeof normalized.url !== "string" &&
    typeof normalized.href === "string"
  ) {
    normalized.url = normalized.href;
  }

  return normalized;
};
