import { extractLayoutBlocks, toNormalizableBlocks } from "@/lib/layout-block-parser";
import type { BlockWithDetails } from "@/types/block";
import type { LayoutPayload, PageLayout } from "@/types/layout";
import { normalizeBlocks } from "@/service/blocks/block-normalizer";

/**
 * Layout 스냅샷을 BlockWithDetails 배열로 파생한다.
 * - layout.items/blocks에 있는 id/type/x/y/w/h 및 data 필드를 정규화한다.
 */
export const deriveBlocksFromLayout = (
  layout: PageLayout
): BlockWithDetails[] => {
  const blocks = extractLayoutBlocks(layout as LayoutPayload);
  return normalizeBlocks(toNormalizableBlocks(blocks));
};
