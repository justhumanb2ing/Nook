import type { BlockKey } from "@/config/block-registry";
import type { LayoutBlock } from "@/types/layout";

export type PlaceholderBlock = { kind: "placeholder"; id: string; type: BlockKey };
export type PersistedBlock = { kind: "persisted"; block: LayoutBlock };

export type ProfileBlockItem = PlaceholderBlock | PersistedBlock;

export const isPersistedBlock = (
  item: ProfileBlockItem
): item is PersistedBlock => item.kind === "persisted";
