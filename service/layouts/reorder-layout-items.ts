import * as Sentry from "@sentry/nextjs";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { PageId } from "@/types/profile";
import { applyItemsToLayoutPayload } from "./page-layout-utils";
import type {
  LayoutItem,
  LayoutMutationResult,
  PageLayout,
} from "@/types/layout";

export type ReorderLayoutItemsParams = {
  supabase: SupabaseClient;
  userId: string | null;
  pageId: PageId;
  layout: PageLayout;
  nextItems: LayoutItem[];
};

const DEFAULT_ERROR_MESSAGE = "레이아웃 순서를 저장하지 못했습니다.";

/**
 * 정렬된 items 배열을 그대로 layout에 반영하고 저장한다.
 * - 서버 측 정렬/ordering 개념 없이 입력 순서를 신뢰한다.
 */
export const requestReorderLayoutItems = async (
  params: ReorderLayoutItemsParams
): Promise<LayoutMutationResult> => {
  const { supabase, userId, pageId, layout, nextItems } = params;

  if (!userId) {
    return { status: "error", message: "로그인이 필요합니다." };
  }

  try {
    return await Sentry.startSpan(
      { op: "db.mutation", name: "Reorder layout items" },
      async (span) => {
        span.setAttribute("page.id", pageId);
        span.setAttribute("layout.itemCount", nextItems.length);

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
