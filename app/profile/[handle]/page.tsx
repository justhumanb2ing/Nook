import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { ProfileBffPayload } from "@/types/profile";
import { ProfilePageClient } from "@/components/profile/profile-page-client";

type ProfilePageProps = {
  params: Promise<{ handle: string }>;
};

type BffResponse = ProfileBffPayload;

const buildApiUrl = (handle: string, headers: Headers): string => {
  const host = headers.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const encodedHandle = encodeURIComponent(handle);

  if (!host) {
    throw new Error("Missing host header");
  }

  return `${protocol}://${host}/api/profile/${encodedHandle}`;
};

const fetchProfileFromBff = async (
  handle: string
): Promise<BffResponse | null> => {
  const headerStore = await headers();
  const apiUrl = buildApiUrl(handle, headerStore);

  const response = await fetch(apiUrl, {
    headers: {
      cookie: headerStore.get("cookie") ?? "",
    },
  });

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Profile BFF fetch failed: ${response.status}`);
  }
  return (await response.json()) as BffResponse;
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { handle } = await params;
  const result = await fetchProfileFromBff(decodeURIComponent(handle));

  if (!result) {
    notFound();
  }

  const { page, isOwner, blocks } = result;

  return (
    <main className="min-h-dvh flex flex-col relative max-w-7xl mx-auto px-4">
      <ProfilePageClient page={page} blocks={blocks} isOwner={isOwner} />
    </main>
  );
}
