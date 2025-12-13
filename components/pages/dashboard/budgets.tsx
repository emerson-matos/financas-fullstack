"use client";

import { useState } from "react";
import { Heading } from "@/components/heading";
import { Separator } from "@/components/ui/separator";
import { BudgetCreate } from "@/components/layout/budget/budget-create";
import { BudgetForm } from "@/components/layout/budget/budget-form";
import { BudgetList } from "@/components/layout/budget/budget-list";

export function Budgets({ action }: { action?: "create" }) {
  const [isFormOpen, setIsFormOpen] = useState(() => action === "create");
  const [editingBudgetId, setEditingBudgetId] = useState<string | undefined>(
    undefined,
  );

  const handleCreateClick = () => {
    setEditingBudgetId(undefined);
    setIsFormOpen(true);
  };
  const handleEdit = (id: string) => {
    setEditingBudgetId(id);
    setIsFormOpen(true);
  };
  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingBudgetId(undefined);
  };
  const handleFormClose = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setEditingBudgetId(undefined);
    }
  };
  return (
    <div className="mx-auto space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Heading
          className="space-y-1"
          title="Orçamentos"
          description="Crie e gerencie seus orçamentos para rastrear seus gastos em categorias."
        />
        <BudgetCreate onCreateClick={handleCreateClick} />
      </div>
      <Separator />
      <BudgetList
        onEdit={(budget) => handleEdit(budget.id)}
        onFormSuccess={handleFormSuccess}
      />
      <BudgetForm
        open={isFormOpen}
        onOpenChange={handleFormClose}
        budgetId={editingBudgetId}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}
