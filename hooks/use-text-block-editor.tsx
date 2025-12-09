import { blockQueryOptions } from "@/service/blocks/block-query-options";
import { useMemo, useState } from "react";
import { useDebouncedMutation } from "./use-debounced-mutation";
import { useMutation } from "@tanstack/react-query";
import { useBlockEnv } from "./use-block-env";
import type {
  TextBlockParams,
  TextBlockState,
} from "@/types/block-editor";

export const useTextBlockEditor = (params: TextBlockParams) => {
  const { supabase, userId } = useBlockEnv();
  const [values, setValues] = useState<TextBlockState>({
    content: params.data.content ?? "",
  });
  const updateBlockMutation = useMutation(
    blockQueryOptions.updateContent({ supabase, userId })
  );
  const getValues = useMemo(
    () => () => ({ content: values.content.trim() }),
    [values.content]
  );

  const save = (v: TextBlockState) => {
    if (params.mode === "placeholder" && params.onSavePlaceholder) {
      params.onSavePlaceholder(v);
      return Promise.resolve();
    }

    const blockId = params.blockId;
    if (params.mode === "persisted" && blockId) {
      return new Promise<void>((resolve, reject) => {
        updateBlockMutation.mutate(
          {
            type: "text",
            blockId,
            handle: params.handle,
            content: v.content,
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

  useDebouncedMutation<TextBlockState>({
    initial: getValues(),
    getValues,
    save,
    enabled: params.isOwner,
    mode: params.mode,
  });

  return {
    values,
    setContent: (value: string) => setValues({ content: value }),
  };
};
