/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  useCallback,
  type ReactNode,
  type HTMLAttributes,
} from "react";
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Trash2 } from "lucide-react";
import type { BlockWithDetails } from "@/types/block";
import type { BlockType } from "@/config/block-registry";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Item } from "@/components/ui/item";
import {
  LinkBlockEditor,
  TextBlockEditor,
} from "@/components/profile/block-editors";
import { useSaveStatus } from "@/components/profile/save-status-context";
import { cn } from "@/lib/utils";

type PlaceholderBlock = { kind: "placeholder"; id: string; type: BlockType };
type PersistedBlock = { kind: "persisted"; block: BlockWithDetails };

type BlockItem = PlaceholderBlock | PersistedBlock;

type SortableRenderProps = {
  isDragging: boolean;
  isDraggable: boolean;
};

type DragGuardHandlers = Pick<
  HTMLAttributes<HTMLElement>,
  "onPointerDownCapture" | "onMouseDownCapture" | "onTouchStartCapture"
>;

type PageBlocksProps = {
  items: BlockItem[];
  handle: string;
  isOwner: boolean;
  onSavePlaceholder: (
    placeholderId: string,
    type: BlockType,
    data: Record<string, unknown>
  ) => void;
  onCancelPlaceholder: (placeholderId: string) => void;
  onDeleteBlock?: (blockId: BlockWithDetails["id"]) => void;
  deletingBlockIds?: Set<BlockWithDetails["id"]>;
  onReorder?: (event: DragEndEvent) => void;
  disableReorder?: boolean;
};

const extractLinkData = (
  block?: BlockWithDetails
): { url?: string | null; title?: string | null } => {
  if (!block) return {};
  return {
    url: block.url ?? null,
    title: block.title ?? null,
  };
};

const extractTextData = (
  block?: BlockWithDetails
): { content?: string | null } => {
  if (!block) return {};
  return {
    content: block.content ?? null,
  };
};

export const PageBlocks = ({
  items,
  handle,
  isOwner,
  onSavePlaceholder,
  onCancelPlaceholder,
  onDeleteBlock,
  deletingBlockIds,
  onReorder,
  disableReorder,
}: PageBlocksProps) => {
  const { setStatus } = useSaveStatus();
  const [isMounted, setIsMounted] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    })
  );
  const stopEventPropagation = useCallback(
    (event: { stopPropagation: () => void }) => {
      event.stopPropagation();
    },
    []
  );
  const dragGuardHandlers: DragGuardHandlers = useMemo(
    () => ({
      onPointerDownCapture: stopEventPropagation,
      onMouseDownCapture: stopEventPropagation,
      onTouchStartCapture: stopEventPropagation,
    }),
    [stopEventPropagation]
  );
  useEffect(() => {
    setIsMounted(true);
  }, []);
  const sortedBlocks = useMemo(
    () =>
      [...items].sort((a, b) => {
        if (a.kind === "persisted" && b.kind === "persisted") {
          const aOrder = a.block.ordering;
          const bOrder = b.block.ordering;
          if (aOrder === null && bOrder === null) {
            return (
              new Date(a.block.created_at ?? 0).getTime() -
              new Date(b.block.created_at ?? 0).getTime()
            );
          }
          if (aOrder === null) return 1;
          if (bOrder === null) return -1;
          return aOrder - bOrder;
        }
        if (a.kind === "persisted") return -1;
        if (b.kind === "persisted") return 1;
        return 0;
      }),
    [items]
  );
  const sortableBlocks = useMemo(
    () =>
      sortedBlocks.filter(
        (item): item is PersistedBlock => item.kind === "persisted"
      ),
    [sortedBlocks]
  );
  const canSort = Boolean(
    isMounted && isOwner && onReorder && sortableBlocks.length > 1
  );

  const renderBlockCard = (
    item: BlockItem,
    sortableProps?: SortableRenderProps
  ) => {
    const isPlaceholder = item.kind === "placeholder";
    const block = item.kind === "persisted" ? item.block : undefined;
    const type = item.kind === "persisted" ? item.block.type : item.type;
    const blockId = block?.id;
    const isDeleting = Boolean(blockId && deletingBlockIds?.has(blockId));
    const isDraggable = sortableProps?.isDraggable;

    return (
      <div
        className={cn(
          "group relative h-full rounded-2xl border bg-white p-2 shadow-xs min-h-32 flex flex-col",
          sortableProps?.isDragging ? "border-2 shadow-md" : "",
          isDraggable ? "cursor-grab active:cursor-grabbing" : ""
        )}
      >
        {isOwner && blockId ? (
          <Button
            type="button"
            size={"icon-sm"}
            variant={"outline"}
            className={cn(
              "absolute -right-3 -top-3 rounded-full transition-opacity",
              isDeleting ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}
            aria-label="블록 삭제"
            disabled={isDeleting}
            onClick={() => onDeleteBlock?.(blockId)}
          >
            {isDeleting ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Trash2 className="size-4" aria-hidden />
            )}
          </Button>
        ) : null}
        <div className="flex-1 space-y-3 h-full flex flex-col">
          {(() => {
            switch (type) {
              case "link":
                return (
                  <LinkBlockEditor
                    className="flex-1"
                    dragGuardHandlers={dragGuardHandlers}
                    mode={isPlaceholder ? "placeholder" : "persisted"}
                    blockId={blockId}
                    handle={handle}
                    isOwner={isOwner}
                    data={extractLinkData(block)}
                    onSavePlaceholder={
                      isPlaceholder
                        ? (data) => {
                            setStatus("dirty");
                            onSavePlaceholder(item.id, "link", data);
                          }
                        : undefined
                    }
                    onCancelPlaceholder={
                      isPlaceholder
                        ? () => onCancelPlaceholder(item.id)
                        : undefined
                    }
                  />
                );
              case "text":
                return (
                  <TextBlockEditor
                    className="flex-1"
                    dragGuardHandlers={dragGuardHandlers}
                    mode={isPlaceholder ? "placeholder" : "persisted"}
                    blockId={blockId}
                    handle={handle}
                    isOwner={isOwner}
                    data={extractTextData(block)}
                    onSavePlaceholder={
                      isPlaceholder
                        ? (data) => {
                            setStatus("dirty");
                            onSavePlaceholder(item.id, "text", data);
                          }
                        : undefined
                    }
                    onCancelPlaceholder={
                      isPlaceholder
                        ? () => onCancelPlaceholder(item.id)
                        : undefined
                    }
                  />
                );
              case "image":
                return (
                  <p className="text-xs text-muted-foreground">
                    이미지 블록은 업로드 이후에 렌더링됩니다.
                  </p>
                );
              case "video":
                return (
                  <p className="text-xs text-muted-foreground">
                    비디오 블록은 업로드 이후에 렌더링됩니다.
                  </p>
                );
              default:
                return (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      해당 블록 타입에 대한 UI가 아직 준비되지 않았습니다.
                    </p>
                    {isPlaceholder ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onCancelPlaceholder(item.id)}
                      >
                        취소
                      </Button>
                    ) : null}
                  </div>
                );
            }
          })()}
        </div>
      </div>
    );
  };

  const renderGrid = (withSortable: boolean) => (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {sortedBlocks.map((item) => {
        if (withSortable && item.kind === "persisted") {
          return (
            <SortableBlockCard
              key={item.block.id}
              id={item.block.id}
              disabled={disableReorder}
            >
              {(sortableProps) => renderBlockCard(item, sortableProps)}
            </SortableBlockCard>
          );
        }

        return (
          <div key={item.kind === "persisted" ? item.block.id : item.id}>
            {renderBlockCard(item)}
          </div>
        );
      })}
    </div>
  );

  if (!items.length) {
    return (
      <Item
        asChild
        className="flex flex-col items-center space-y-3 max-w-sm text-center font-medium p-0 border-none bg-transparent shadow-none"
      >
        <Empty>
          <EmptyHeader>
            <EmptyMedia>
              <div className="size-32 rounded-full overflow-hidden">
                <Image
                  src={"/sprite-animation.gif"}
                  alt="There's no data."
                  width={200}
                  height={200}
                  className="object-cover w-full h-full grayscale"
                  unoptimized
                />
              </div>
            </EmptyMedia>
            <EmptyTitle>이곳은 여전히 고요합니다.</EmptyTitle>
            <EmptyDescription>
              비어 있음은 결핍이 아니라, 당신이 채울 가능성들이 아직 이름을 얻지
              않았다는 신호일지 모릅니다.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild size={"sm"}>
              <Link href={"/"}>돌아가기</Link>
            </Button>
          </EmptyContent>
        </Empty>
      </Item>
    );
  }

  if (!canSort) {
    return <section className="space-y-3 w-full">{renderGrid(false)}</section>;
  }

  return (
    <section className="space-y-3 w-full">
      <DndContext sensors={sensors} onDragEnd={onReorder}>
        <SortableContext
          items={sortableBlocks.map((block) => block.block.id)}
          strategy={rectSortingStrategy}
        >
          {renderGrid(true)}
        </SortableContext>
      </DndContext>
    </section>
  );
};

type SortableBlockCardProps = {
  id: string;
  disabled?: boolean;
  children: (props: SortableRenderProps) => ReactNode;
};

const SortableBlockCard = ({
  id,
  disabled,
  children,
}: SortableBlockCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="h-full"
      {...(disabled ? {} : attributes)}
      {...(disabled ? {} : listeners)}
    >
      {children({ isDragging, isDraggable: !disabled })}
    </div>
  );
};
