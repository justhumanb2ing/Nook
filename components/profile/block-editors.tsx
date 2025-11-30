"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toastManager } from "@/components/ui/toast";

type SaveResponse =
  | { status: "success"; blockId: string }
  | { status: "error"; reason?: string; message: string };

type SaveStatus = "idle" | "saving" | "saved";

const saveLinkBlock = async (params: {
  blockId: string;
  handle: string;
  url: string;
  title: string;
}): Promise<SaveResponse> => {
  const response = await fetch("/api/profile/block/link", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  const data = (await response.json().catch(() => ({}))) as SaveResponse;

  if (!response.ok || data.status === "error") {
    return {
      status: "error",
      reason: data.status === "error" ? data.reason : "REQUEST_FAILED",
      message:
        data.status === "error" ? data.message : "링크를 저장하지 못했습니다.",
    };
  }

  return data;
};

const saveTextBlock = async (params: {
  blockId: string;
  handle: string;
  content: string;
}): Promise<SaveResponse> => {
  const response = await fetch("/api/profile/block/text", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  const data = (await response.json().catch(() => ({}))) as SaveResponse;

  if (!response.ok || data.status === "error") {
    return {
      status: "error",
      reason: data.status === "error" ? data.reason : "REQUEST_FAILED",
      message:
        data.status === "error"
          ? data.message
          : "텍스트를 저장하지 못했습니다.",
    };
  }

  return data;
};

export type LinkBlockEditorProps = {
  mode: "placeholder" | "persisted";
  blockId?: string;
  placeholderId?: string;
  handle: string;
  isOwner: boolean;
  data: { url?: string | null; title?: string | null };
  onSavePlaceholder?: (data: { url: string; title: string }) => void;
  onCancelPlaceholder?: () => void;
  onStatusChange: (status: SaveStatus) => void;
};

export const LinkBlockEditor = ({
  mode,
  blockId,
  handle,
  isOwner,
  data,
  onSavePlaceholder,
  onCancelPlaceholder,
  onStatusChange,
}: LinkBlockEditorProps) => {
  const [url, setUrl] = useState(data.url ?? "");
  const [title, setTitle] = useState(data.title ?? "");
  const [lastSaved, setLastSaved] = useState({
    url: (data.url ?? "").trim(),
    title: (data.title ?? "").trim(),
  });
  const resetTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setUrl(data.url ?? "");
    setTitle(data.title ?? "");
    setLastSaved({
      url: (data.url ?? "").trim(),
      title: (data.title ?? "").trim(),
    });
    onStatusChange("idle");
  }, [data.url, data.title, onStatusChange]);

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!isOwner) return;

    const trimmedUrl = url.trim();
    const trimmedTitle = title.trim();
    const hasChanges =
      trimmedUrl !== lastSaved.url || trimmedTitle !== lastSaved.title;

    if (!hasChanges) {
      onStatusChange("idle");
      return;
    }

    const debounceTimer = setTimeout(async () => {
      onStatusChange("saving");

      try {
        if (mode === "placeholder" && onSavePlaceholder) {
          await onSavePlaceholder({ url: trimmedUrl, title: trimmedTitle });
        } else if (mode === "persisted" && blockId) {
          const result = await saveLinkBlock({
            blockId,
            handle,
            url: trimmedUrl,
            title: trimmedTitle,
          });
          if (result.status === "error") {
            throw new Error(result.message);
          }
        }

        setLastSaved({ url: trimmedUrl, title: trimmedTitle });
        onStatusChange("saved");

        if (resetTimer.current) clearTimeout(resetTimer.current);
        resetTimer.current = setTimeout(() => onStatusChange("idle"), 1500);
      } catch (error) {
        const description =
          error instanceof Error
            ? error.message
            : "잠시 후 다시 시도해 주세요.";
        toastManager.add({
          title: "저장 실패",
          description,
          type: "error",
        });
        onStatusChange("idle");
      }
    }, 1200);

    return () => clearTimeout(debounceTimer);
  }, [
    blockId,
    handle,
    isOwner,
    lastSaved.title,
    lastSaved.url,
    mode,
    onSavePlaceholder,
    onStatusChange,
    title,
    url,
  ]);

  return (
    <div className="space-y-2">
      <Input
        placeholder="https://example.com"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        disabled={!isOwner}
      />
      <Input
        placeholder="링크 제목"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={!isOwner}
      />
      {mode === "placeholder" ? (
        <div className="flex justify-end">
          <Button size="sm" variant="ghost" onClick={onCancelPlaceholder}>
            취소
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export type TextBlockEditorProps = {
  mode: "placeholder" | "persisted";
  blockId?: string;
  handle: string;
  isOwner: boolean;
  data: { content?: string | null };
  onSavePlaceholder?: (data: { content: string }) => void;
  onCancelPlaceholder?: () => void;
  onStatusChange: (status: SaveStatus) => void;
};

export const TextBlockEditor = ({
  mode,
  blockId,
  handle,
  isOwner,
  data,
  onSavePlaceholder,
  onCancelPlaceholder,
  onStatusChange,
}: TextBlockEditorProps) => {
  const [content, setContent] = useState(data.content ?? "");
  const [lastSaved, setLastSaved] = useState((data.content ?? "").trim());
  const resetTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setContent(data.content ?? "");
    setLastSaved((data.content ?? "").trim());
    onStatusChange("idle");
  }, [data.content, onStatusChange]);

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!isOwner) return;
    const trimmed = content.trim();
    const hasChanges = trimmed !== lastSaved;

    if (!hasChanges) {
      onStatusChange("idle");
      return;
    }

    const debounceTimer = setTimeout(async () => {
      onStatusChange("saving");
      try {
        if (mode === "placeholder" && onSavePlaceholder) {
          await onSavePlaceholder({ content: trimmed });
        } else if (mode === "persisted" && blockId) {
          const result = await saveTextBlock({
            blockId,
            handle,
            content: trimmed,
          });
          if (result.status === "error") {
            throw new Error(result.message);
          }
        }

        setLastSaved(trimmed);
        onStatusChange("saved");

        if (resetTimer.current) clearTimeout(resetTimer.current);
        resetTimer.current = setTimeout(() => onStatusChange("idle"), 1500);
      } catch (error) {
        const description =
          error instanceof Error
            ? error.message
            : "잠시 후 다시 시도해 주세요.";
        toastManager.add({
          title: "저장 실패",
          description,
          type: "error",
        });
        onStatusChange("idle");
      }
    }, 1200);

    return () => clearTimeout(debounceTimer);
  }, [
    blockId,
    content,
    handle,
    isOwner,
    lastSaved,
    mode,
    onSavePlaceholder,
    onStatusChange,
  ]);

  return (
    <div className="space-y-2">
      <Textarea
        placeholder="내용을 입력하세요"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={!isOwner}
        className="resize-none"
      />
      {mode === "placeholder" ? (
        <div className="flex justify-end">
          <Button size="sm" variant="ghost" onClick={onCancelPlaceholder}>
            취소
          </Button>
        </div>
      ) : null}
    </div>
  );
};
