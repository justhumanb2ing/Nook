"use client";

import { useActionState } from "react";
import {
  updateProfileAction,
  type UpdateProfileActionState,
} from "@/app/profile/_actions";
import { toastManager } from "@/components/ui/toast";
import Image from "next/image";

type ProfileFormProps = {
  defaultUsername: string;
  currentAvatarUrl?: string;
};

const initialState: UpdateProfileActionState = { status: "idle" };

const SubmitButton = ({ pending }: { pending: boolean }) => (
  <button
    type="submit"
    disabled={pending}
    className="inline-flex items-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
  >
    {pending ? "변경 중..." : "변경"}
  </button>
);

export const ProfileForm = ({
  defaultUsername,
  currentAvatarUrl,
}: ProfileFormProps) => {
  const actionWithToast = async (
    prevState: UpdateProfileActionState,
    formData: FormData
  ) => {
    const result = await toastManager
      .promise(
        (async () => {
          const response = await updateProfileAction(prevState, formData);

          if (response.status === "error") {
            throw new Error(response.reason ?? response.message);
          }

          return response;
        })(),
        {
          loading: {
            title: "프로필 저장 중…",
            description: "잠시만 기다려 주세요.",
          },
          success: (response: UpdateProfileActionState) => ({
            title: "프로필 업데이트 완료",
            description: response.message ?? "프로필이 저장되었습니다.",
          }),
          error: (error: Error) => ({
            title: "업데이트 실패",
            description: error.message || "잠시 후 다시 시도해 주세요.",
          }),
        }
      )
      .catch((error: Error) => error);

    if (result instanceof Error) {
      return {
        status: "error",
        message: "프로필 업데이트에 실패했어요.",
        reason: result.message,
      } as UpdateProfileActionState;
    }

    return result as UpdateProfileActionState;
  };

  const [state, formAction, isPending] = useActionState(
    actionWithToast,
    initialState
  );

  return (
    <form
      action={formAction}
      className="space-y-5"
      encType="multipart/form-data"
    >
      <div className="space-y-2">
        <label htmlFor="username" className="text-sm font-medium text-zinc-900">
          사용자명
        </label>
        <input
          id="username"
          name="username"
          type="text"
          defaultValue={defaultUsername}
          placeholder="새로운 사용자명"
          className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900 shadow-sm transition focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200"
        />
        <p className="text-xs text-zinc-500">최소 2자 이상 입력하세요.</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="avatar" className="text-sm font-medium text-zinc-900">
          아바타 이미지
        </label>
        <div className="flex items-center gap-3">
          <input
            id="avatar"
            name="avatar"
            type="file"
            accept="image/*"
            className="block w-full text-sm text-zinc-600 file:mr-4 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-zinc-900 hover:file:bg-zinc-200"
          />
          <div className="size-20">
            {currentAvatarUrl ? (
              <Image
                src={currentAvatarUrl}
                alt="현재 아바타"
                width={100}
                height={100}
                className="aspect-square rounded-full border border-zinc-200 object-cover"
                unoptimized
              />
            ) : null}
          </div>
        </div>
        <p className="text-xs text-zinc-500">
          업로드 시 Clerk 프로필 이미지가 교체됩니다.
        </p>
      </div>
      <SubmitButton pending={isPending} />
    </form>
  );
};
