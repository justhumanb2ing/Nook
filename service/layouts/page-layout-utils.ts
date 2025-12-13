import { LAYOUT_SIZE_SCALE } from "@/service/blocks/block-layout";
import type { Json } from "@/types/database.types";
import type { LayoutBlock, LayoutItem, LayoutSize } from "@/types/layout";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const resolveArrayProperty = (
  record: Record<string, unknown>,
  key: string
): LayoutBlock[] | null => {
  const value = record[key];
  return Array.isArray(value) ? (value as LayoutBlock[]) : null;
};

const toJsonValue = (value: unknown): Json | undefined => {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value as Json;
  }

  if (Array.isArray(value)) {
    const normalized = value
      .map((entry) => toJsonValue(entry))
      .filter((entry): entry is Json => entry !== undefined);
    return normalized as Json;
  }

  if (isRecord(value)) {
    const normalized: Record<string, Json> = {};
    Object.entries(value).forEach(([key, entryValue]) => {
      const entry = toJsonValue(entryValue);
      if (entry !== undefined) {
        normalized[key] = entry;
      }
    });
    return normalized as Json;
  }

  return undefined;
};

const toJsonItems = (items: LayoutBlock[]): Json[] =>
  items.map((item) => {
    const normalized: Record<string, unknown> = {
      ...item,
      data: toJsonValue(item.data) ?? null,
      style: toJsonValue(item.style) ?? null,
      position: toJsonValue(item.position) ?? null,
    };
    return normalized as unknown as Json;
  });

/**
 * layout payload에서 items 배열을 추출한다.
 * - items / blocks / layout.blocks 형태를 모두 지원해 마이그레이션 중 호환성을 유지한다.
 */
export const extractLayoutItems = (payload: Json | null): LayoutBlock[] => {
  if (Array.isArray(payload)) {
    return payload as LayoutBlock[];
  }
  if (!isRecord(payload)) return [];

  const fromItems = resolveArrayProperty(payload, "items");
  if (fromItems) return fromItems;

  const fromBlocks = resolveArrayProperty(payload, "blocks");
  if (fromBlocks) return fromBlocks;

  const layout = payload.layout;
  if (isRecord(layout)) {
    const nestedItems = resolveArrayProperty(layout, "items");
    if (nestedItems) return nestedItems;

    const nestedBlocks = resolveArrayProperty(layout, "blocks");
    if (nestedBlocks) return nestedBlocks;
  }

  return [];
};

/**
 * 추출된 items 배열을 기존 layout payload 형태에 맞춰 다시 삽입한다.
 * - items / blocks / layout.blocks 모두 갱신한다.
 */
export const applyItemsToLayoutPayload = (
  payload: Json | null,
  items: LayoutBlock[]
): Json => {
  if (Array.isArray(payload)) {
    return { items: toJsonItems(items) };
  }

  if (isRecord(payload)) {
    const normalizedItems = toJsonItems(items);
    const next: Record<string, unknown> = {
      ...payload,
      items: normalizedItems,
    };

    if (Array.isArray((payload as { blocks?: unknown }).blocks)) {
      next.blocks = normalizedItems;
    }

    if (isRecord(payload.layout)) {
      const nextLayout: Record<string, unknown> = {
        ...payload.layout,
        items: normalizedItems,
      };

      if (Array.isArray((payload.layout as { blocks?: unknown }).blocks)) {
        nextLayout.blocks = normalizedItems;
      }

      next.layout = nextLayout;
    }

    return next as Json;
  }

  return { items: toJsonItems(items) };
};

const toStyleSize = (value: number): number =>
  Math.max(1, Math.round(Number.isFinite(value) ? value : 1));

export const toStyleString = (w: number, h: number): string =>
  `${toStyleSize(w)}x${toStyleSize(h)}`;

const mergeStyle = (
  style: LayoutSize | null | undefined,
  desktopSize: { w: number; h: number },
  mobileSize: { w: number; h: number }
): LayoutSize => {
  const desktop = toStyleString(
    desktopSize.w * LAYOUT_SIZE_SCALE,
    desktopSize.h * LAYOUT_SIZE_SCALE
  );
  const mobile = toStyleString(
    mobileSize.w * LAYOUT_SIZE_SCALE,
    mobileSize.h * LAYOUT_SIZE_SCALE
  );
  return {
    // 모바일 사이즈도 항상 최신 입력값을 반영한다.
    mobile,
    desktop,
  };
};

/**
 * BlockLayout 정보를 layout item(style/position)에 반영한다.
 */
export const applyMetricsToLayoutItem = (
  item: LayoutItem,
  layout: {
    desktop: { x: number; y: number; w: number; h: number };
    mobile: { x: number; y: number; w: number; h: number };
  }
): LayoutItem => ({
  ...item,
  style: mergeStyle(item.style, layout.desktop, layout.mobile),
  position: {
    ...item.position,
    desktop: {
      ...(item.position?.desktop ?? {}),
      x: layout.desktop.x,
      y: layout.desktop.y,
    },
    mobile: {
      ...(item.position?.mobile ?? {}),
      x: layout.mobile.x,
      y: layout.mobile.y,
    },
  },
});
