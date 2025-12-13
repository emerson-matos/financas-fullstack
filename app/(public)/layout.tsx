"use client";

import { ReactNode } from "react";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-y-auto bg-background">
      <div className="w-full max-w-3xl">{children}</div>
    </div>
  );
}
