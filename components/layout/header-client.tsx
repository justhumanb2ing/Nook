"use client";

import Link from "next/link";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Item } from "@/components/ui/item";
import {
  QueryErrorResetBoundary,
} from "@tanstack/react-query";
import { pageQueryOptions } from "@/service/pages/page-query-options";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { SuspenseQuery } from "@suspensive/react-query";

type WithRequestHeaders = {
  headers?: HeadersInit;
};

type HeaderClientProps = {
  userId: string | null;
  canLoadPages: boolean;
} & WithRequestHeaders;

const normalizeHandle = (rawHandle: string): string =>
  rawHandle.trim().replace(/^@+/, "");

const buildProfilePath = (handle: string): string => {
  const normalized = normalizeHandle(handle);
  return normalized ? `/profile/@${normalized}` : "/profile";
};

export default function HeaderClient({
  userId,
  headers,
  canLoadPages,
}: HeaderClientProps) {
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
            {canLoadPages && userId ? (
              <QueryErrorResetBoundary>
                {({ reset }) => (
                  <ErrorBoundary onReset={reset} fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading</div>}>
                      <SuspenseQuery
                        {...pageQueryOptions.byOwner(userId, headers)}
                        select={(pages) => {
                          return pages.map((page) => {
                            const href = buildProfilePath(page.handle);
                            const label = page.title?.trim() || page.handle;

                            return { id: page.id, href, label };
                          });
                        }}
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
