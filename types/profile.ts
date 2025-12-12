import type { Tables } from "@/types/database.types";
import type { PageLayout } from "./layout";

export type PageId = Tables<"pages">["id"];
export type PageHandle = Tables<"pages">["handle"];

export type PagePayload = Pick<
  Tables<"pages">,
  | "id"
  | "handle"
  | "title"
  | "description"
  | "image_url"
  | "owner_id"
  | "is_public"
>;

export type ProfileOwnership = { isOwner: boolean };

export type ProfileBffPayload = ProfileOwnership & {
  page: PagePayload;
  layout: PageLayout;
};
