import { auth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { prefetchPageListByOwner } from "@/service/pages/page-query-options";
import HeaderClient from "./header-client";
import { HydrationBoundary } from "@tanstack/react-query";
import { createServerSupabaseClient } from "@/config/supabase";

export default async function Header() {
  const { userId, sessionClaims } = await auth();
  // 서버에서 sessionClaims를 확인하여 프리페치 여부 결정
  // 주의: sessionClaims는 세션 갱신 지연으로 인해 온보딩 완료 직후 즉시 반영되지 않을 수 있음
  // 따라서 이 값은 프리페치 최적화(성능) 목적으로만 사용하고,
  // 실제 렌더링 결정은 클라이언트의 publicMetadata를 사용함 (UX)
  const isOnboardingComplete =
    sessionClaims?.metadata?.onboardingComplete === true;
  const shouldPrefetchPages = Boolean(userId && isOnboardingComplete);

  let dehydrated;

  // 온보딩 완료된 사용자만 프리페치
  // 온보딩 미완료 사용자는 페칭하지 않음 (불필요한 서버 요청 방지)
  if (shouldPrefetchPages) {
    try {
      const supabase = await createServerSupabaseClient();
      dehydrated = (
        await prefetchPageListByOwner(userId!, supabase, userId!)
      ).dehydrated;
    } catch (error) {
      Sentry.captureException(error);
    }
  }

  return (
    <HydrationBoundary state={dehydrated}>
      <HeaderClient userId={userId ?? null} />
    </HydrationBoundary>
  );
}
