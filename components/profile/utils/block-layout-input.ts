import type { BlockKey } from "@/config/block-registry";
import {
  DESKTOP_BREAKPOINT,
  LAYOUT_SIZE_SCALE,
  MIN_SIZE,
  MOBILE_BREAKPOINT,
  type LayoutInput,
  type ResponsiveLayoutInputs,
} from "@/service/blocks/block-layout";
import { getDefaultBlockLayout } from "@/service/blocks/block-layout-presets";
import { resolveLayoutStyle } from "@/lib/layout-block-parser";
import type { LayoutBlock } from "@/types/layout";
import type { ProfileBlockItem } from "../types/block-item";

const resolveDefaultLayout = (type?: string | null) => {
  if (type && ["link", "text", "image", "map", "section"].includes(type)) {
    return getDefaultBlockLayout(type as BlockKey);
  }
  return { w: MIN_SIZE, h: MIN_SIZE };
};

const resolveLayoutPosition = (
  block: LayoutBlock,
  fallbackIndex: number,
  breakpoint: typeof DESKTOP_BREAKPOINT | typeof MOBILE_BREAKPOINT
): { x: number; y: number } => {
  const position =
    breakpoint === DESKTOP_BREAKPOINT
      ? block.position?.desktop ?? block.position?.mobile ?? { x: null, y: null }
      : block.position?.mobile ?? block.position?.desktop ?? { x: null, y: null };
  const x =
    typeof position.x === "number" && Number.isFinite(position.x)
      ? position.x
      : fallbackIndex;
  const y =
    typeof position.y === "number" && Number.isFinite(position.y)
      ? position.y
      : 0;
  return { x, y };
};

export const toLayoutInputs = (
  items: ProfileBlockItem[]
): ResponsiveLayoutInputs => {
  const desktop: LayoutInput[] = [];
  const mobile: LayoutInput[] = [];

  items.forEach((item, index) => {
    if (item.kind === "persisted") {
      const { block } = item;
      const defaultLayout = resolveDefaultLayout(
        (block.type as string | undefined) ?? null
      );
      const desktopStyle = resolveLayoutStyle(block.style, "desktop");
      const mobileStyle = resolveLayoutStyle(block.style, "mobile");
      const desktopWidth = Math.max(
        desktopStyle.w ?? defaultLayout.w,
        defaultLayout.w
      );
      const desktopHeight = Math.max(
        desktopStyle.h ?? defaultLayout.h,
        defaultLayout.h
      );
      const mobileWidth = Math.max(
        mobileStyle.w ?? defaultLayout.w,
        defaultLayout.w
      );
      const mobileHeight = Math.max(
        mobileStyle.h ?? defaultLayout.h,
        defaultLayout.h
      );
      const desktopDisplayWidth = Math.max(
        Math.ceil(desktopWidth / LAYOUT_SIZE_SCALE),
        MIN_SIZE
      );
      const desktopDisplayHeight = Math.max(
        Math.ceil(desktopHeight / LAYOUT_SIZE_SCALE),
        MIN_SIZE
      );
      const mobileDisplayWidth = Math.max(
        Math.ceil(mobileWidth / LAYOUT_SIZE_SCALE),
        MIN_SIZE
      );
      const mobileDisplayHeight = Math.max(
        Math.ceil(mobileHeight / LAYOUT_SIZE_SCALE),
        MIN_SIZE
      );
      const desktopPosition = resolveLayoutPosition(
        block,
        index,
        DESKTOP_BREAKPOINT
      );
      const mobilePosition = resolveLayoutPosition(
        block,
        index,
        MOBILE_BREAKPOINT
      );

      const id = block.id ? String(block.id) : String(index);
      desktop.push({
        id,
        x: desktopPosition.x,
        y: desktopPosition.y,
        w: desktopDisplayWidth,
        h: desktopDisplayHeight,
      });
      mobile.push({
        id,
        x: mobilePosition.x,
        y: mobilePosition.y,
        w: mobileDisplayWidth,
        h: mobileDisplayHeight,
      });
      return;
    }

    const defaultLayout = getDefaultBlockLayout(item.type);
    const displayWidth = Math.max(
      Math.ceil(defaultLayout.w / LAYOUT_SIZE_SCALE),
      MIN_SIZE
    );
    const displayHeight = Math.max(
      Math.ceil(defaultLayout.h / LAYOUT_SIZE_SCALE),
      MIN_SIZE
    );

    desktop.push({
      id: item.id,
      x: index,
      y: 0,
      w: displayWidth,
      h: displayHeight,
    });
    mobile.push({
      id: item.id,
      x: index,
      y: 0,
      w: displayWidth,
      h: displayHeight,
    });
  });

  return {
    [DESKTOP_BREAKPOINT]: desktop,
    [MOBILE_BREAKPOINT]: mobile,
  };
};
