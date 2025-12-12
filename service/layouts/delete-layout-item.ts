import * as Sentry from "@sentry/nextjs";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { PageId } from "@/types/profile";
import {
  applyItemsToLayoutPayload,
  extractLayoutItems,
} from "./page-layout-utils";
import type {
  LayoutMutationResult,
  PageLayout,
} from "@/types/layout";

export type DeleteLayoutItemParams = {
  supabase: SupabaseClient;
  userId: string | null;
  pageId: PageId;
  layout: PageLayout;
  itemId: string;
};

const DEFAULT_ERROR_MESSAGE = "레이아웃 아이템을 삭제하지 못했습니다.";

/**
 * layout.items에서 대상 아이템을 제거한 뒤 전체 layout을 저장한다.
 * - blockId/handle 기반 조회나 추가 fetch 없이 동작한다.
 */
export const requestDeleteLayoutItem = async (
  params: DeleteLayoutItemParams
): Promise<LayoutMutationResult> => {
  const { supabase, userId, pageId, layout, itemId } = params;

  if (!userId) {
    return { status: "error", message: "로그인이 필요합니다." };
  }

  try {
    return await Sentry.startSpan(
      { op: "db.mutation", name: "Delete layout item" },
      async (span) => {
        span.setAttribute("page.id", pageId);
        span.setAttribute("layout.itemId", itemId);

        const items = extractLayoutItems(layout);
        const nextItems = items.filter(
          (item) => (item.id ? String(item.id) : "") !== itemId
        );
        const nextLayout = applyItemsToLayoutPayload(layout, nextItems);

        const { error } = await supabase.rpc("update_page_layout", {
          p_page_id: pageId,
          p_layout: nextLayout,
        });

        if (error) throw error;

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
