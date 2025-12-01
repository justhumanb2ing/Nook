import * as Sentry from "@sentry/nextjs";
import type { BlockType } from "@/config/block-registry";
import type { BlockWithDetails } from "@/types/block";
import type { PageHandle, PageId } from "@/types/profile";

export type CreateBlockParams = {
  pageId: PageId;
  handle: PageHandle;
  type: BlockType;
  data: Record<string, unknown>;
};

export type CreateBlockResult =
  | { status: "success"; block: BlockWithDetails }
  | { status: "error"; message: string };

type BlockApiResponse = {
  status?: "success" | "error";
  block?: BlockWithDetails;
  reason?: string;
  message?: string;
};

const DEFAULT_ERROR_MESSAGE = "블록을 생성하지 못했습니다.";

const resolveErrorMessage = (body: BlockApiResponse): string =>
  body.message ?? body.reason ?? DEFAULT_ERROR_MESSAGE;

/**
 * 프로필 페이지에 새로운 블록을 생성한다.
 * - API 요청/응답을 Sentry span으로 추적한다.
 * - 실패 시 사용자 친화적인 메시지를 반환하고 예외를 캡처한다.
 */
export const requestCreateBlock = async (
  params: CreateBlockParams
): Promise<CreateBlockResult> => {
  const { pageId, handle, type, data } = params;

  try {
    return await Sentry.startSpan(
      { op: "http.client", name: "Create profile block" },
      async (span) => {
        span.setAttribute("block.type", type);
        span.setAttribute("page.id", pageId);
        span.setAttribute("page.handle", handle);

        const response = await fetch("/api/profile/block", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pageId, handle, type, data }),
        });

        const body = (await response.json().catch(() => ({}))) as BlockApiResponse;

        if (!response.ok || body.status === "error") {
          const message = resolveErrorMessage(body);
          return { status: "error", message };
        }

        if (!body.block) {
          return { status: "error", message: DEFAULT_ERROR_MESSAGE };
        }

        return { status: "success", block: body.block };
      }
    );
  } catch (error) {
    Sentry.captureException(error);
    const message =
      error instanceof Error ? error.message : DEFAULT_ERROR_MESSAGE;
    return { status: "error", message };
  }
};
