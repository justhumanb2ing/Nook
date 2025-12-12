import * as Sentry from "@sentry/nextjs";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { PageId } from "@/types/profile";
import {
  applyItemsToLayoutPayload,
  extractLayoutItems,
} from "./page-layout-utils";
import type {
  LayoutItem,
  LayoutMutationResult,
  PageLayout,
} from "@/types/layout";

export type AddLayoutItemParams = {
  supabase: SupabaseClient;
  userId: string | null;
  pageId: PageId;
  layout: PageLayout;
  newItem: LayoutItem;
};

const DEFAULT_ERROR_MESSAGE = "레이아웃 아이템을 추가하지 못했습니다.";

/**
 * layout.items 배열에 새 아이템을 추가하고 전체 layout을 저장한다.
 * - layout 재조회 없이 전달받은 스냅샷만 사용한다.
 * - id/position/style 생성 책임은 클라이언트에 있다.
 */
export const requestAddLayoutItem = async (
  params: AddLayoutItemParams
): Promise<LayoutMutationResult> => {
  const { supabase, userId, pageId, layout, newItem } = params;

  if (!userId) {
    return { status: "error", message: "로그인이 필요합니다." };
  }

  try {
    return await Sentry.startSpan(
      { op: "db.mutation", name: "Add layout item" },
      async (span) => {
        span.setAttribute("page.id", pageId);

        const items = extractLayoutItems(layout);
        const nextItems = (() => {
          if (!newItem.id) return [...items, newItem];
          const targetId = String(newItem.id);
          const withoutDup = items.filter(
            (item) => !item.id || String(item.id) !== targetId
          );
          return [...withoutDup, newItem];
        })();
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
