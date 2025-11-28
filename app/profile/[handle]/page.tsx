import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { ProfileForm } from "@/components/profile/profile-form";
import type { Tables } from "@/types/database.types";
import { createServerSupabaseClient } from "@/config/supabase";

type ProfilePageProps = {
  params: Promise<{ handle: string }>;
};

const fetchProfile = async (
  handle: string
): Promise<Pick<
  Tables<"profile">,
  "user_id" | "display_name" | "avatar_url" | "handle"
> | null> => {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("profile")
    .select("user_id, display_name, avatar_url, handle")
    .eq("handle", handle)
    .maybeSingle<
      Pick<
        Tables<"profile">,
        "user_id" | "display_name" | "avatar_url" | "handle"
      >
    >();

  if (error) {
    throw error;
  }

  return data ?? null;
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { handle } = await params;
  const user = await currentUser();
  const profile = await fetchProfile(handle);

  if (!profile) {
    notFound();
  }

  const userHandle =
    typeof user?.publicMetadata?.handle === "string"
      ? user.publicMetadata.handle.trim()
      : "";
  const isOwner = Boolean(
    user?.id && userHandle && userHandle === profile.handle
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <ProfileForm
        handle={profile.handle}
        isOwner={isOwner}
        profileDisplayName={profile.display_name ?? undefined}
        profileAvatarUrl={profile.avatar_url ?? undefined}
      />
    </div>
  );
}
