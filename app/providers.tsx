"use client";

import { OverlayProvider } from "overlay-kit";
import { AnchoredToastProvider, ToastProvider } from "@/components/ui/toast";

export default function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <OverlayProvider>
      <ToastProvider position="bottom-center">
        <AnchoredToastProvider>{children}</AnchoredToastProvider>
      </ToastProvider>
    </OverlayProvider>
  );
}
