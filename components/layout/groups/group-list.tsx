"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/datatable/app-datatable";
import { Button } from "@/components/ui/button";
import { defaultGroupColumns } from "@/components/layout/groups/columns";
import { GroupInviteDialog } from "@/components/layout/groups/group-invite-dialog";

export function GroupList() {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>();

  const handleRowClick = (id: string) => {
    setSelectedGroupId(id);
    setIsInviteOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsInviteOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Grupo
        </Button>
      </div>

      <DataTable
        queryKey="groups"
        columns={defaultGroupColumns}
        onRowClick={handleRowClick}
        emptyMessage="Nenhum grupo encontrado"
      />

      {isInviteOpen && (
        <GroupInviteDialog
          open={isInviteOpen}
          onOpenChange={setIsInviteOpen}
          groupId={selectedGroupId}
        />
      )}
    </div>
  );
}
