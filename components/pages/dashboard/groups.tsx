"use client";

import { GroupList } from "@/components/layout/groups/group-list";

export function Groups() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Grupos</h2>
          <p className="text-muted-foreground">
            Gerencie seus grupos e compartilhe finanças com outras pessoas.
          </p>
        </div>
      </div>
      <div className="space-y-4">
        <GroupList />
      </div>
    </div>
  );
}
