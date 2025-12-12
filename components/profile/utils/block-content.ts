import type { LayoutBlock } from "@/types/layout";

export const extractLinkData = (
  block?: LayoutBlock
): { url?: string | null; title?: string | null } => {
  const data = block?.data as Record<string, unknown> | null | undefined;
  if (!data) return {};
  return {
    url: typeof data.url === "string" ? data.url : null,
    title: typeof data.title === "string" ? data.title : null,
  };
};

export const extractTextData = (
  block?: LayoutBlock
): { content?: string | null } => {
  const data = block?.data as Record<string, unknown> | null | undefined;
  if (!data) return {};
  return {
    content: typeof data.content === "string" ? data.content : null,
  };
};

export const extractImageData = (
  block?: LayoutBlock
): {
  imageUrl?: string | null;
  linkUrl?: string | null;
  aspectRatio?: number | null;
} => {
  const data = block?.data as Record<string, unknown> | null | undefined;
  if (!data) return {};
  return {
    imageUrl: typeof data.image_url === "string" ? data.image_url : null,
    linkUrl: typeof data.link_url === "string" ? data.link_url : null,
    aspectRatio:
      typeof data.aspect_ratio === "number" ? data.aspect_ratio : null,
  };
};

export const extractSectionData = (
  block?: LayoutBlock
): { title?: string | null } => {
  const data = block?.data as Record<string, unknown> | null | undefined;
  if (!data) return {};
  return {
    title: typeof data.title === "string" ? data.title : null,
  };
};
