import * as Sentry from "@sentry/nextjs";
import { createServerSupabaseClient } from "@/config/supabase";

export type UpdatePageParams = {
  pageId: string;
  ownerId: string;
  title?: string;
  description?: string;
  imageUrl?: string;
};

export type UpdatePageResult =
  | { ok: true }
  | { ok: false; reason: string };

export const updatePage = async (
  params: UpdatePageParams
): Promise<UpdatePageResult> => {
  const { pageId, ownerId, title, description, imageUrl } = params;

  try {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
      .from("pages")
      .update({
        title: title?.trim() || null,
        description: description?.trim() || null,
        image_url: imageUrl?.trim() || null,
      })
      .eq("id", pageId)
      .eq("owner_id", ownerId);

    if (error) {
      Sentry.captureException(error);
      return { ok: false, reason: error.message };
    }

    return { ok: true };
  } catch (error) {
    Sentry.captureException(error);
    const reason = error instanceof Error ? error.message : "Unknown error";
    return { ok: false, reason };
  }
};
