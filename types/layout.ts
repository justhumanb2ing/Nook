import type { Json, Tables } from "@/types/database.types";

export type BlockType = Tables<"blocks">["type"];

export type LayoutSize = { mobile?: string | null; desktop?: string | null };
export type LayoutPosition = {
  mobile?: { x?: number | null; y?: number | null } | null;
  desktop?: { x?: number | null; y?: number | null } | null;
};
export type LayoutBlock = {
  id?: string;
  type?: BlockType;
  data?: Record<string, unknown> | null;
  style?: LayoutSize | null;
  position?: LayoutPosition | null;
  created_at?: string | null;
};

export type LayoutPayload =
  | LayoutBlock[]
  | {
      layout?: { blocks?: LayoutBlock[] } | null;
      blocks?: LayoutBlock[];
    }
  | null;

export type LayoutItem = LayoutBlock;
export type PageLayout = Json | null;

export type LayoutMutationResult =
  | { status: "success" }
  | { status: "error"; message: string };
