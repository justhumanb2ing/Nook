"use client";

import Link from "next/link";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
  useAuth,
  useUser,
} from "@clerk/nextjs";
import { useMemo } from "react";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { SuspenseQuery } from "@suspensive/react-query";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createBrowserSupabaseClient } from "@/config/supabase-browser";
import { Item } from "@/components/ui/item";
import { pageQueryOptions } from "@/service/pages/page-query-options";

type HeaderClientProps = {
  userId: string | null;
};

const normalizeHandle = (rawHandle: string): string =>
  rawHandle.trim().replace(/^@+/, "");

const buildProfilePath = (handle: string): string => {
  const normalized = normalizeHandle(handle);
  return normalized ? `/profile/@${normalized}` : "/profile";
};

export default function HeaderClient({ userId }: HeaderClientProps) {
  const { getToken } = useAuth();
  const { user } = useUser();
  const supabase: SupabaseClient = useMemo(
    () => createBrowserSupabaseClient(() => getToken()),
    [getToken]
  );

  // 클라이언트에서 onboardingComplete를 확인
  // user.publicMetadata는 user.reload() 호출 시 즉시 업데이트되므로
  // 온보딩 완료 직후 새로고침 없이도 즉시 반영됨 (UX)
  // 서버의 sessionClaims와 달리 실시간으로 반영되므로 렌더링 결정에 사용
  // 온보딩 미완료 사용자는 핸들 목록을 페칭/표시하지 않음
  const isOnboardingComplete =
    user?.publicMetadata?.onboardingComplete === true && !!userId;

  return (
    <Item
      asChild
      className="flex justify-end items-center p-4 gap-4 h-16 border-none bg-transparent shadow-none"
    >
      <header>
        <SignedOut>
          <SignInButton />
          <SignUpButton>
            <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
              Sign Up
            </button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <div className="flex items-center gap-3">
            {/* 온보딩 완료된 사용자만 핸들 목록 표시 */}
            {isOnboardingComplete && userId ? (
              <QueryErrorResetBoundary>
                {({ reset }) => (
                  <ErrorBoundary onReset={reset} fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading</div>}>
                      <SuspenseQuery
                        {...pageQueryOptions.byOwner(userId, supabase, userId)}
                        select={(pages) =>
                          pages.map((page) => {
                            const href = buildProfilePath(page.handle);
                            const label = page.handle

                            return { id: page.id, href, label };
                          })
                        }
                      >
                        {({ data: pageLinks }) =>
                          pageLinks.map((page) => (
                            <Link
                              key={page.id}
                              href={page.href}
                              className="px-3 py-1 text-sm text-zinc-900 transition hover:bg-zinc-100"
                            >
                              {page.label}
                            </Link>
                          ))
                        }
                      </SuspenseQuery>
                    </Suspense>
                  </ErrorBoundary>
                )}
              </QueryErrorResetBoundary>
            ) : null}

            <UserButton />
          </div>
        </SignedIn>
      </header>
    </Item>
  );
}
