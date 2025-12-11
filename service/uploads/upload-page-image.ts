import { normalizeHandle } from "@/lib/handle";

type UploadPageImageParams = {
  file: File;
  handle: string;
};

type UploadPageImageResponse = { url?: string };

/**
 * 페이지 이미지 업로드를 수행한다.
 * - `/api/uploads/page-image` 엔드포인트에 FormData로 파일과 핸들을 전송한다.
 * - 업로드 성공 시 공개 URL을 반환한다.
 */
export const uploadPageImage = async (
  params: UploadPageImageParams
): Promise<string> => {
  const { file, handle } = params;
  const normalizedHandle = normalizeHandle(handle);
  const formData = new FormData();

  formData.set("file", file);
  formData.set("handle", normalizedHandle);

  const response = await fetch("/api/uploads/page-image", {
    method: "POST",
    body: formData,
  });

  const body = (await response.json().catch(() => ({}))) as UploadPageImageResponse & {
    error?: string;
  };
  if (!response.ok || !body.url) {
    throw new Error(body?.error ?? "이미지 업로드에 실패했습니다.");
  }

  return body.url;
};
