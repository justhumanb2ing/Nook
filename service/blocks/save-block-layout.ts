import * as Sentry from "@sentry/nextjs";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { BlockLayout } from "./block-layout";
import type { PageHandle, PageId } from "@/types/profile";

export type SaveBlockLayoutPayload = BlockLayout[];

export type SaveBlockLayoutParams = {
  supabase: SupabaseClient;
  userId: string | null;
  pageId: PageId;
  handle: PageHandle;
  blocks: SaveBlockLayoutPayload;
};

export type SaveBlockLayoutResult =
  | { status: "success" }
  | { status: "error"; message: string };

const DEFAULT_ERROR_MESSAGE = "블록 레이아웃을 저장하지 못했습니다.";

/**
 * 블록 레이아웃(x, y, w, h)을 Supabase RPC로 일괄 저장한다.
 * - Owner RLS에 의존하지만, 추가로 페이지 소유자 검증을 수행한다.
 */
export const requestSaveBlockLayout = async (
  params: SaveBlockLayoutParams
): Promise<SaveBlockLayoutResult> => {
  const { supabase, userId, pageId, handle, blocks } = params;

  if (!userId) {
    return { status: "error", message: "로그인이 필요합니다." };
  }

  try {
    return await Sentry.startSpan(
      { op: "db.mutation", name: "Save block layout" },
      async (span) => {
        span.setAttribute("page.id", pageId);
        span.setAttribute("block.count", blocks.length);

        const { data: page, error: pageLookupError } = await supabase
          .from("pages")
          .select("id, handle, owner_id")
          .eq("id", pageId)
          .maybeSingle();

        if (pageLookupError) throw pageLookupError;
        if (!page) {
          return { status: "error", message: "페이지를 찾을 수 없습니다." };
        }

        if (page.owner_id !== userId) {
          return { status: "error", message: "블록을 수정할 권한이 없습니다." };
        }

        const { error: rpcError } = await supabase.rpc("save_block_layout", {
          p_page_id: pageId,
          p_blocks: blocks,
        });

        if (rpcError) throw rpcError;

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
