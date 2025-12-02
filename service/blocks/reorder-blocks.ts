import * as Sentry from "@sentry/nextjs";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { BlockWithDetails } from "@/types/block";
import type { PageId } from "@/types/profile";

export type ReorderBlockPayload = {
  id: BlockWithDetails["id"];
  ordering: number;
};

export type ReorderBlocksParams = {
  supabase: SupabaseClient;
  pageId: PageId;
  blocks: ReorderBlockPayload[];
};

export type ReorderBlocksResult =
  | { status: "success" }
  | { status: "error"; message: string };

const DEFAULT_ERROR_MESSAGE = "블록 순서를 변경하지 못했습니다.";

/**
 * Drag-and-drop 이후 프로필 블록 순서를 Supabase RPC로 일괄 업데이트한다.
 * - 클라이언트에서 `{ id, ordering }` 배열을 전달한다.
 * - 실패 시 사용자 친화적인 메시지를 반환하고 예외를 Sentry로 전파한다.
 */
export const requestReorderBlocks = async (
  params: ReorderBlocksParams
): Promise<ReorderBlocksResult> => {
  const { supabase, pageId, blocks } = params;

  try {
    return await Sentry.startSpan(
      { op: "rpc", name: "Reorder profile blocks" },
      async (span) => {
        span.setAttribute("page.id", pageId);
        span.setAttribute("block.count", blocks.length);

        const { error } = await supabase.rpc("reorder_blocks_after_dnd", {
          p_page_id: pageId,
          p_blocks: blocks,
        });

        if (error) {
          return {
            status: "error",
            message: error.message ?? DEFAULT_ERROR_MESSAGE,
          };
        }

        return { status: "success" };
      }
    );
  } catch (error) {
    Sentry.captureException(error);
    const message =
      error instanceof Error ? error.message : DEFAULT_ERROR_MESSAGE;
    return { status: "error", message };
  }
};
