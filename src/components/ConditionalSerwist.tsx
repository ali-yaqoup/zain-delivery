"use client";

import type { ReactNode } from "react";
import { SerwistProvider } from "@/components/SerwistProvider";

export function ConditionalSerwist({ children }: { children: ReactNode }) {
  return <SerwistProvider swUrl="/serwist/sw.js">{children}</SerwistProvider>;
}
