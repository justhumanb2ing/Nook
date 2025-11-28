"use client";

import React from "react";
import Link from "next/link";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";

export default function Header() {
  const { user } = useUser();
  const handle = typeof user?.publicMetadata?.handle === "string" ? user.publicMetadata.handle : null;
  const profileHref = handle ? `/profile/${handle}` : "/profile";

  return (
    <header className="flex justify-end items-center p-4 gap-4 h-16">
      <SignedOut>
        <SignInButton />
        <SignUpButton>
          <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
            Sign Up
          </button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <Link
          href={profileHref}
          className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-200"
        >
          내 프로필
        </Link>
        <UserButton />
      </SignedIn>
    </header>
  );
}
