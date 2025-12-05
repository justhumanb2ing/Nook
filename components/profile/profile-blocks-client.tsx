"use client";

import { useCallback, useMemo, useState } from "react";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import type { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import type { BlockWithDetails } from "@/types/block";
import type { BlockType } from "@/config/block-registry";
import type { PageHandle, PageId, ProfileOwnership } from "@/types/profile";
import type { SupabaseClient } from "@supabase/supabase-js";
import { BlockRegistryPanel } from "@/components/layout/block-registry";
import { PageBlocks } from "@/components/profile/page-blocks";
import { toastManager } from "@/components/ui/toast";
import { useSaveStatus } from "@/components/profile/save-status-context";
import { blockQueryOptions } from "@/service/blocks/block-query-options";
import { profileQueryOptions } from "@/service/profile/profile-query-options";
import { BlockEnvProvider } from "@/hooks/use-block-env";

type BlockItem =
  | { kind: "persisted"; block: BlockWithDetails }
  | { kind: "placeholder"; id: string; type: BlockType };

type ProfileBlocksClientProps = ProfileOwnership & {
  initialBlocks: BlockWithDetails[];
  handle: PageHandle;
  pageId: PageId;
  supabase: SupabaseClient;
  userId: string | null;
};

export const ProfileBlocksClient = ({
  initialBlocks: _initialBlocks,
  handle,
  pageId,
  supabase,
  userId,
}: ProfileBlocksClientProps) => {
  const [placeholders, setPlaceholders] = useState<
    { kind: "placeholder"; id: string; type: BlockType }[]
  >([]);
  const [deletingBlockIds, setDeletingBlockIds] = useState<Set<string>>(
    () => new Set()
  );
  const queryClient = useQueryClient();
  const { setStatus } = useSaveStatus();
  const { data: profile } = useSuspenseQuery(
    profileQueryOptions.byHandle({ supabase, handle, userId })
  );
  const isOwner = profile.isOwner;
  const persistedBlocks = profile.blocks;
  const blockEnvValue = useMemo(
    () => ({ supabase, userId }),
    [supabase, userId]
  );
  const createBlockMutation = useMutation(
    blockQueryOptions.create({
      pageId,
      handle,
      queryClient,
      supabase,
      userId,
      callbacks: {
        onMutate: () => setStatus("saving"),
        onError: () => setStatus("error"),
        onSuccess: () => setStatus("saved"),
      },
    })
  );
  const deleteBlockMutation = useMutation(
    blockQueryOptions.delete({
      handle,
      queryClient,
      supabase,
      userId,
      callbacks: {
        onMutate: () => setStatus("saving"),
        onError: () => setStatus("error"),
        onSuccess: () => setStatus("saved"),
      },
    })
  );
  const reorderBlocksMutation = useMutation(
    blockQueryOptions.reorder({
      pageId,
      handle,
      queryClient,
      supabase,
      userId,
      callbacks: {
        onMutate: () => setStatus("saving"),
        onError: () => setStatus("error"),
        onSuccess: () => setStatus("saved"),
      },
    })
  );
  const isReordering = reorderBlocksMutation.isPending;

  const handleAddPlaceholder = useCallback(
    (type: BlockType) => {
      if (!isOwner) return;
      const tempId = crypto.randomUUID();
      setPlaceholders((prev) => [
        ...prev,
        { kind: "placeholder", id: tempId, type },
      ]);
      setStatus("dirty");
    },
    [isOwner, setStatus]
  );

  const handleCancelPlaceholder = useCallback(
    (placeholderId: string) => {
      setPlaceholders((prev) =>
        prev.filter((item) => item.id !== placeholderId)
      );
      setStatus("idle");
    },
    [setStatus]
  );

  const handleDeleteBlock = useCallback(
    (blockId: string) => {
      if (!isOwner || deletingBlockIds.has(blockId)) return;

      setDeletingBlockIds((prev) => {
        const next = new Set(prev);
        next.add(blockId);
        return next;
      });
      setStatus("saving");

      const toastId = toastManager.add({
        title: "블록 삭제 중…",
        type: "loading",
        timeout: 0,
      });

      deleteBlockMutation.mutate(
        { blockId, handle },
        {
          onError: (error) => {
            const message =
              error instanceof Error
                ? error.message
                : "잠시 후 다시 시도해 주세요.";
            toastManager.update(toastId, {
              title: "블록 삭제 실패",
              description: message,
              type: "error",
            });
          },
          onSuccess: () => {
            toastManager.update(toastId, {
              title: "블록이 삭제되었습니다.",
              type: "success",
            });
          },
          onSettled: () => {
            setDeletingBlockIds((prev) => {
              const next = new Set(prev);
              next.delete(blockId);
              return next;
            });
          },
        }
      );
    },
    [deleteBlockMutation, deletingBlockIds, handle, isOwner, setStatus]
  );

  const handleReorderBlocks = useCallback(
    ({ active, over }: DragEndEvent) => {
      if (
        !isOwner ||
        !over ||
        active.id === over.id ||
        reorderBlocksMutation.isPending
      )
        return;

      const activeIndex = persistedBlocks.findIndex(
        (block) => block.id === active.id
      );
      const overIndex = persistedBlocks.findIndex(
        (block) => block.id === over.id
      );

      if (activeIndex === -1 || overIndex === -1) return;

      const reorderedPersisted = arrayMove(
        persistedBlocks,
        activeIndex,
        overIndex
      ).map((block, ordering) => ({
        id: block.id,
        ordering,
      }));

      reorderBlocksMutation.mutate(
        {
          pageId,
          handle,
          blocks: reorderedPersisted,
        },
        {
          onError: (error) => {
            const message =
              error instanceof Error
                ? error.message
                : "잠시 후 다시 시도해 주세요.";
            toastManager.add({
              title: "순서 변경 실패",
              description: message,
              type: "error",
            });
          },
        }
      );
    },
    [handle, isOwner, pageId, persistedBlocks, reorderBlocksMutation]
  );

  const handleSavePlaceholder = useCallback(
    (placeholderId: string, type: BlockType, data: Record<string, unknown>) => {
      if (!isOwner || createBlockMutation.isPending) return;

      const toastId = toastManager.add({
        title: "블록 생성 중…",
        type: "loading",
        timeout: 0,
      });

      const previousPlaceholders = placeholders;

      setPlaceholders((prev) =>
        prev.filter((item) => item.id !== placeholderId)
      );

      createBlockMutation.mutate(
        { pageId, handle, type, data },
        {
          onError: (error) => {
            setPlaceholders(previousPlaceholders);
            toastManager.update(toastId, {
              title: "블록 생성 실패",
              description:
                error instanceof Error
                  ? error.message
                  : "잠시 후 다시 시도해 주세요.",
              type: "error",
            });
          },
          onSuccess: () => {
            toastManager.update(toastId, {
              title: "블록이 생성되었습니다.",
              type: "success",
            });
          },
        }
      );
    },
    [createBlockMutation, handle, isOwner, pageId, placeholders]
  );

  const items: BlockItem[] = [
    ...persistedBlocks.map((block) => ({ kind: "persisted" as const, block })),
    ...placeholders,
  ];

  return (
    <BlockEnvProvider value={blockEnvValue}>
      <div className="space-y-3 flex flex-col items-center">
        {isOwner ? (
          <BlockRegistryPanel onSelectBlock={handleAddPlaceholder} />
        ) : null}
        <PageBlocks
          items={items}
          handle={handle}
          isOwner={isOwner}
          onSavePlaceholder={handleSavePlaceholder}
          onCancelPlaceholder={handleCancelPlaceholder}
          onDeleteBlock={handleDeleteBlock}
          deletingBlockIds={deletingBlockIds}
          onReorder={handleReorderBlocks}
          disableReorder={isReordering}
        />
      </div>
    </BlockEnvProvider>
  );
};
