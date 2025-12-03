import * as Sentry from "@sentry/nextjs";
import type { ProfileBffPayload } from "@/types/profile";

export type FetchProfileParams = {
  handle: string;
  headers?: HeadersInit;
};

const buildBffUrl = (handle: string, headers?: HeadersInit): string => {
  const encodedHandle = encodeURIComponent(handle);

  // 브라우저에서는 상대경로로 호출해 동일 오리진 쿠키를 자연스럽게 포함한다.
  if (typeof window !== "undefined") {
    return `/api/profile/${encodedHandle}`;
  }

  const headerBag = new Headers(headers);
  const forwardedHost =
    headerBag.get("x-forwarded-host") ?? headerBag.get("host");
  const forwardedProto =
    headerBag.get("x-forwarded-proto") ??
    (forwardedHost?.includes("localhost") ? "http" : "https");

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}/api/profile/${encodedHandle}`;
  }

  // 요청 헤더가 없다면 환경 변수 기반으로 절대 경로를 구성한다.
  const envBase =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : process.env.NEXT_PUBLIC_VERCEL_URL
        ? process.env.NEXT_PUBLIC_VERCEL_URL.startsWith("http")
          ? process.env.NEXT_PUBLIC_VERCEL_URL
          : `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
        : "";

  return envBase ? `${envBase}/api/profile/${encodedHandle}` : `/api/profile/${encodedHandle}`;
};

/**
 * BFF(`/api/profile/[handle]`)를 호출해 페이지·블록 정보를 가져온다.
 * - 서버 컴포넌트에서 사용할 때는 `origin`과 `cookie`를 전달해 인증 헤더를 보존한다.
 * - 404는 null로 변환해 호출부에서 notFound 처리를 할 수 있게 한다.
 */
export const fetchProfileFromBff = async (
  params: FetchProfileParams
): Promise<ProfileBffPayload | null> => {
  const { handle, headers } = params;
  const targetUrl = buildBffUrl(handle, headers);

  try {
    return await Sentry.startSpan(
      { op: "http.client", name: "Fetch profile BFF" },
      async (span) => {
        span.setAttribute("profile.handle", handle);
        span.setAttribute("request.url", targetUrl);

        const response = await fetch(targetUrl, { headers });

        if (!response.ok) {
          if (response.status === 404) return null;
          throw new Error(`Profile BFF fetch failed: ${response.status}`);
        }
        
        return (await response.json()) as ProfileBffPayload;
      }
    );
  } catch (error) {
    Sentry.captureException(error);
    throw error;
  }
};
