import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile/profile-form";

export default async function ProfilePage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Profile</p>
        <h1 className="text-3xl font-semibold text-zinc-900">프로필 관리</h1>
        <p className="text-sm text-zinc-600">사용자명과 아바타 이미지를 업데이트합니다.</p>
      </header>

      <ProfileForm defaultUsername={user.username ?? ""} currentAvatarUrl={user.imageUrl ?? undefined} />
    </div>
  );
}
