import { dehydrate, queryOptions } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/get-query-client";
import { fetchProfileFromBff, type FetchProfileParams } from "./fetch-profile";
import type { ProfileBffPayload } from "@/types/profile";

const profileQueryKey = ["profile"] as const;

/**
 * Profile 도메인의 쿼리 옵션 묶음.
 * - handle 기반 BFF 조회를 단일 진입점으로 제공한다.
 */
export const profileQueryOptions = {
  all: profileQueryKey,
  byHandle: (params: FetchProfileParams) =>
    queryOptions({
      queryKey: [...profileQueryKey, "bff", params.handle] as const,
      queryFn: () => fetchProfileFromBff(params) as Promise<ProfileBffPayload>,
    }),
};

export const prefetchProfileByHandle = async (params: FetchProfileParams) => {
  const queryClient = getQueryClient();
  const data = await queryClient.fetchQuery({
    ...profileQueryOptions.byHandle(params),
  });

  return {
    data,
    dehydrated: dehydrate(queryClient),
  };
};
