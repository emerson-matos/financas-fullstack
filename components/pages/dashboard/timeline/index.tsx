"use client";

import { DashboardShell } from "@/components/layout/dashboard/dashboard-shell";
import { Heading } from "@/components/heading";
import { Separator } from "@/components/ui/separator";
import { TimelineList } from "@/components/layout/timeline/timeline-list";
import { useRouter } from "next/navigation";
import type { TimelineEntry } from "@/lib/types";

export function Timeline() {
  const router = useRouter();

  const handleItemClick = (id: string, entry: TimelineEntry) => {
    if (entry.entry_type === "TRANSACTION") {
      router.push(`/dashboard/transactions/${id}`);
    } else if (entry.highlight_type === "ACCOUNT_CREATED") {
      router.push(`/dashboard/accounts/${entry.account_id}`);
    }
  };

  return (
    <DashboardShell className="mx-auto space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <Heading
        title="Linha do Tempo"
        description="Acompanhe cada marco da sua jornada financeira"
      />
      <Separator />

      <TimelineList onItemClick={handleItemClick} />
    </DashboardShell>
  );
}
