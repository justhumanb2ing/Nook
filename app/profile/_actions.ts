"use server";

import { auth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { revalidatePath } from "next/cache";
import { updateProfile } from "@/service/profile/update-profile";

export type UpdateProfileActionState =
  | { status: "idle"; message?: string; reason?: string }
  | { status: "success"; message: string }
  | { status: "error"; message: string; reason?: string };

export const updateProfileAction = async (
  _prevState: UpdateProfileActionState,
  formData: FormData,
): Promise<UpdateProfileActionState> => {
  const { userId } = await auth();

  if (!userId) {
    return { status: "error", message: "로그인이 필요합니다.", reason: "UNAUTHORIZED" };
  }

  const username = formData.get("username");
  const avatarFile = formData.get("avatar");

  const result = await updateProfile({
    userId,
    username: typeof username === "string" ? username : undefined,
    avatarFile: avatarFile instanceof File ? avatarFile : null,
  });

  if (!result.ok) {
    Sentry.captureMessage("프로필 업데이트 실패", {
      level: "error",
      extra: { reason: result.reason },
    });
    return { status: "error", message: "프로필 업데이트에 실패했어요.", reason: result.reason };
  }

  revalidatePath("/profile");
  return { status: "success", message: "프로필이 업데이트되었습니다." };
};
