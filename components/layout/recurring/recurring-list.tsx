"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/datatable/app-datatable";
import { Button } from "@/components/ui/button";
import { defaultRecurringColumns } from "@/components/layout/recurring/columns";
import { RecurringTemplateForm } from "@/components/layout/recurring/recurring-template-form";

export function RecurringList() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<
    string | undefined
  >();

  const handleRowClick = (id: string) => {
    setSelectedTemplateId(id);
    setIsFormOpen(true);
  };

  const handleCreateNew = () => {
    setSelectedTemplateId(undefined);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Template
        </Button>
      </div>

      <DataTable
        queryKey="recurring-templates"
        columns={defaultRecurringColumns}
        onRowClick={handleRowClick}
        emptyMessage="Nenhum template recorrente encontrado"
      />

      {isFormOpen && (
        <RecurringTemplateForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          templateId={selectedTemplateId}
        />
      )}
    </div>
  );
}
