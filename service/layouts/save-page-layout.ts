import * as Sentry from "@sentry/nextjs";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { PageId } from "@/types/profile";
import type { LayoutMutationResult, PageLayout } from "@/types/layout";

export type SavePageLayoutParams = {
  supabase: SupabaseClient;
  userId: string | null;
  pageId: PageId;
  layout: PageLayout;
};

const DEFAULT_ERROR_MESSAGE = "페이지 레이아웃을 저장하지 못했습니다.";

/**
 * 전달된 layout 스냅샷 전체를 그대로 저장한다.
 * - layout 병합/재조회 없이 입력값만 사용한다.
 */
export const requestSavePageLayout = async (
  params: SavePageLayoutParams
): Promise<LayoutMutationResult> => {
  const { supabase, userId, pageId, layout } = params;

  if (!userId) {
    return { status: "error", message: "로그인이 필요합니다." };
  }

  try {
    return await Sentry.startSpan(
      { op: "db.mutation", name: "Save page layout" },
      async (span) => {
        span.setAttribute("page.id", pageId);

        const { error } = await supabase.rpc("update_page_layout", {
          p_page_id: pageId,
          p_layout: layout,
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
