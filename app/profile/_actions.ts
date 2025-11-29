"use server";

import { auth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { revalidatePath } from "next/cache";
import { updatePage } from "@/service/pages/update-page";

export type UpdatePageActionState =
  | { status: "success"; message: string }
  | { status: "error"; message: string; reason?: string };

export type UpdatePagePayload = {
  pageId: string;
  handle: string;
  title: string;
  description?: string;
  imageUrl?: string;
};

export const updatePageAction = async (payload: UpdatePagePayload): Promise<UpdatePageActionState> => {
  const { userId } = await auth();

  if (!userId) {
    return {
      status: "error",
      message: "로그인이 필요합니다.",
      reason: "UNAUTHORIZED",
    };
  }

  const { pageId, title, description, imageUrl, handle } = payload;

  if (!pageId) {
    return {
      status: "error",
      message: "페이지 정보를 찾을 수 없습니다.",
      reason: "INVALID_PAGE",
    };
  }

  const result = await updatePage({
    pageId,
    ownerId: userId,
    title,
    description,
    imageUrl,
  });

  if (!result.ok) {
    Sentry.captureMessage("페이지 업데이트 실패", {
      level: "error",
      extra: { reason: result.reason },
    });
    return {
      status: "error",
      message: "페이지 업데이트에 실패했어요.",
      reason: result.reason,
    };
  }

  if (typeof handle === "string" && handle.trim()) {
    revalidatePath(`/profile/${handle.trim()}`);
  } else {
    revalidatePath("/profile");
  }

  return { status: "success", message: "페이지가 업데이트되었습니다." };
};
