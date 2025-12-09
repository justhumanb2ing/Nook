"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLinkBlockEditor } from "@/hooks/use-link-block-editor";
import { useTextBlockEditor } from "@/hooks/use-text-block-editor";
import { cn } from "@/lib/utils";
import type {
  LinkBlockEditorParams,
  TextBlockEditorParams,
} from "@/types/block-editor";

export type LinkBlockEditorProps = LinkBlockEditorParams & {
  onCancelPlaceholder?: () => void;
  className?: string;
};

export const LinkBlockEditor = ({
  mode,
  blockId,
  handle,
  isOwner,
  data,
  onSavePlaceholder,
  onCancelPlaceholder,
  className,
}: LinkBlockEditorProps) => {
  const { values, setUrl, setTitle } = useLinkBlockEditor({
    mode,
    blockId,
    handle,
    isOwner,
    data,
    onSavePlaceholder,
  });

  const isPlaceholder = mode === "placeholder";

  return (
    <div className={cn("space-y-2 h-full flex flex-col", className)}>
      <Input
        placeholder="https://example.com"
        value={values.url}
        onChange={(e) => setUrl(e.target.value)}
        disabled={!isOwner}
        className={cn(
          "shadow-none border-none",
          "focus-visible:ring-0 focus-visible:border-none focus-visible:bg-muted transition-colors duration-200",
          "hover:bg-muted"
        )}
      />

      <Input
        placeholder="링크 제목"
        value={values.title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={!isOwner}
        className={cn(
          "shadow-none border-none",
          "focus-visible:ring-0 focus-visible:border-none focus-visible:bg-muted transition-colors duration-200",
          "hover:bg-muted"
        )}
      />
    </div>
  );
};

export type TextBlockEditorProps = TextBlockEditorParams & {
  onCancelPlaceholder?: () => void;
  className?: string;
};

export const TextBlockEditor = ({
  mode,
  blockId,
  handle,
  isOwner,
  data,
  onSavePlaceholder,
  onCancelPlaceholder,
  className,
}: TextBlockEditorProps) => {
  const { values, setContent } = useTextBlockEditor({
    mode,
    blockId,
    handle,
    isOwner,
    data,
    onSavePlaceholder,
  });

  const isPlaceholder = mode === "placeholder";

  return (
    <Textarea
      placeholder="내용을 입력하세요"
      value={values.content}
      onChange={(e) => setContent(e.target.value)}
      disabled={!isOwner}
      className={cn(
        "resize-none border-none shadow-none h-full flex-1",
        "focus-visible:border-none focus-visible:ring-0 focus-visible:bg-muted transition-colors duration-200",
        "hover:bg-muted",
        className
      )}
    />
  );
};
