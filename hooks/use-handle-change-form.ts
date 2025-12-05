"use client";

import { useRef } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { pageQueryOptions } from "@/service/pages/page-query-options";
import { useSaveStatus } from "@/components/profile/save-status-context";
import { normalizeHandle, validateHandle } from "@/lib/handle";
import type { SupabaseClient } from "@supabase/supabase-js";

const HandleSchema = z.object({
  pageId: z.string(),
  ownerId: z.string(),
  handle: z
    .string()
    .min(1, "핸들을 입력하세요.")
    .trim()
    .superRefine((value, ctx) => {
      if (value.includes("@")) {
        ctx.addIssue({
          code: "custom",
          message: "@ 없이 입력해 주세요.",
        });
        return;
      }

      const result = validateHandle(value);
      if (!result.ok) {
        const message =
          result.reason === "RESERVED"
            ? "사용할 수 없는 핸들입니다."
            : result.reason === "INVALID_CASE"
            ? "소문자만 사용할 수 있습니다."
            : "3~20자의 영문 소문자와 숫자만 사용할 수 있습니다.";

        ctx.addIssue({
          code: "custom",
          message,
        });
      }
    })
    .transform((value) => normalizeHandle(value)),
});

type HandleSchemaType = z.infer<typeof HandleSchema>;

type UseHandleChangeFormParams = {
  pageId: string;
  ownerId: string;
  handle: string;
  supabase: SupabaseClient;
  userId: string | null;
};

export const useHandleChangeForm = ({
  pageId,
  ownerId,
  handle,
  supabase,
  userId,
}: UseHandleChangeFormParams) => {
  const { setStatus } = useSaveStatus();
  const queryClient = useQueryClient();
  const normalizedInitialHandle = normalizeHandle(handle);
  const currentHandleRef = useRef<string>(normalizedInitialHandle);

  const changeHandleMutation = useMutation(
    pageQueryOptions.changeHandle({
      pageId,
      ownerId,
      handle: normalizedInitialHandle,
      queryClient,
      supabase,
      userId,
    })
  );

  const form = useForm<HandleSchemaType>({
    resolver: zodResolver(HandleSchema),
    defaultValues: {
      pageId,
      ownerId,
      handle: normalizedInitialHandle,
    },
  });

  const onSubmit = async (data: HandleSchemaType) => {
    return await changeHandleMutation.mutateAsync(
      {
        pageId: data.pageId,
        ownerId: data.ownerId,
        currentHandle: currentHandleRef.current,
        nextHandle: data.handle,
      },
      {
        onSettled: () => {
          setStatus("saving");
        },
        onSuccess: () => {
          setStatus("saved");
        },
        onError: (error) => {
          setStatus("error");
          console.error("[HANDLE_CHANGE_FAILED]", error);
        },
      }
    );
  };

  return {
    form,
    onSubmit,
    isPending: changeHandleMutation.isPending,
  };
};
