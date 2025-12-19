"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Header } from "@/components/layout/header";
import { AppSidebar } from "@/components/layout/sidebar/app-sidebar";
import { useCookie } from "react-use";
import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [value] = useCookie("sidebar:state");
  const defaultOpen = value === "true";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <div className="mx-4 flex-1 py-2">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
