"use client";

import { RepeatIcon } from "lucide-react";
import { RecurringList } from "@/components/layout/recurring/recurring-list";

export function Recurring() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Recorrências</h2>
      </div>
      <div className="grid gap-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <RepeatIcon className="h-4 w-4" />
          <span>
            Gerencie suas transações automáticas e templates recorrentes
          </span>
        </div>
        <RecurringList />
      </div>
    </div>
  );
}
