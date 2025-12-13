import Logo from "@/components/layout/logo";
import Link from "next/link";
import React from "react";

export default function WithHeaderLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="relative flex flex-col xl:flex-row">
      <aside className="p-2">
        <Link href={"/"}>
          <Logo className="size-12" />
        </Link>
      </aside>
      <div className="grow">{children}</div>
    </main>
  );
}
