"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SerwistProvider } from "@/components/SerwistProvider";

/**
 * Don't register the storefront service worker on /admin.
 * (An already-registered SW with scope "/" may still control the page.)
 */
export function ConditionalSerwist({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return <SerwistProvider swUrl="/serwist/sw.js">{children}</SerwistProvider>;
}
