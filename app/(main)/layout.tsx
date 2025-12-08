import Header from "@/components/layout/header";
import React from "react";

export default function WithHeaderLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="relative">
      <nav className="fixed top-0 left-0 right-0 z-20 bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-end px-4">
          <Header />
        </div>
      </nav>
      <div className="pt-16">{children}</div>
    </main>
  );
}
