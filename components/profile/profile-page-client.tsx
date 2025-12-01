"use client";

import {
  SaveStatusProvider,
  StatusBadge,
  useSaveStatus,
} from "@/components/profile/save-status-context";
import { ProfileForm } from "@/components/profile/profile-form";
import { ProfileBlocksClient } from "@/components/profile/profile-blocks-client";
import type { ProfileBffPayload } from "@/types/profile";

type ProfilePageClientProps = {
  page: ProfileBffPayload["page"];
  blocks: ProfileBffPayload["blocks"];
  isOwner: boolean;
};

export const ProfilePageClient = ({
  page,
  blocks,
  isOwner,
}: ProfilePageClientProps) => {
  
  const StatusSection = () => {
    const { status } = useSaveStatus();
    return <StatusBadge status={status} />;
  };

  return (
    <SaveStatusProvider>
      <div className="space-y-6">
        <StatusSection />
        <ProfileForm
          pageId={page.id}
          handle={page.handle}
          isOwner={isOwner}
          pageTitle={page.title ?? undefined}
          pageDescription={page.description ?? undefined}
          pageImageUrl={page.image_url ?? undefined}
        />
        <ProfileBlocksClient
          initialBlocks={blocks}
          handle={page.handle}
          pageId={page.id}
          isOwner={isOwner}
        />
      </div>
    </SaveStatusProvider>
  );
};
