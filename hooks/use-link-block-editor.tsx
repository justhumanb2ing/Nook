import { useState, useMemo } from "react";
import { layoutMutationOptions } from "@/service/layouts/layout-mutation-options";
import { useMutation } from "@tanstack/react-query";
import { useDebouncedMutation } from "./use-debounced-mutation";
import { useBlockEnv } from "./use-block-env";
import type {
  
  LinkBlockParams,
  LinkBlockState,
} from "@/types/block-editor";

export const useLinkBlockEditor = (params: LinkBlockParams) => {
  const { supabase, userId } = useBlockEnv();
  const [values, setValues] = useState<LinkBlockState>({
    url: params.data.url ?? "",
    title: params.data.title ?? "",
  });
  const updateBlockMutation = useMutation(
    layoutMutationOptions.updateContent({ supabase, userId })
  );

  const getValues = useMemo(
    () => () => ({
      url: values.url.trim(),
      title: values.title.trim(),
    }),
    [values.url, values.title]
  );

  const save = (v: LinkBlockState) => {
    if (params.mode === "placeholder" && params.onSavePlaceholder) {
      params.onSavePlaceholder(v);
      return Promise.resolve();
    }

    const blockId = params.blockId;
    if (params.mode === "persisted" && blockId) {
      return new Promise<void>((resolve, reject) => {
        updateBlockMutation.mutate(
          {
            type: "link",
            blockId,
            handle: params.handle,
            url: v.url,
            title: v.title,
          },
          {
            onSuccess: () => resolve(),
            onError: (error) => reject(error),
          }
        );
      });
    }

    return Promise.resolve();
  };

  useDebouncedMutation<LinkBlockState>({
    initial: getValues(),
    getValues,
    save,
    enabled: params.isOwner,
    mode: params.mode,
  });

  return {
    values,
    setUrl: (value: string) =>
      setValues((prev) => ({ ...prev, url: value })),
    setTitle: (value: string) =>
      setValues((prev) => ({ ...prev, title: value })),
  };
};
