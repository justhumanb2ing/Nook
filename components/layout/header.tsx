import { currentUser } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { prefetchPageListByOwner } from "@/service/pages/page-query-options";
import HeaderClient from "./header-client";
import { HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";

export default async function Header() {
  const user = await currentUser();
  const headerStore = await headers();
  const cookie = headerStore.get("cookie") ?? undefined;
  const forwardedHeaders = cookie ? { cookie } : undefined;

  let dehydrated;

  if (user?.id) {
    try {
      dehydrated = prefetchPageListByOwner(
        user.id,
        forwardedHeaders
      ).dehydrated;
    } catch (error) {
      Sentry.captureException(error);
    }
  }

  return (
    <HydrationBoundary state={dehydrated}>
      <HeaderClient userId={user?.id ?? null} headers={forwardedHeaders} />
    </HydrationBoundary>
  );
}
