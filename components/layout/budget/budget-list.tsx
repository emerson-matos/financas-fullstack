"use client";

import { Edit, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

import { useBudgets } from "@/hooks/use-budgets";
import type { Budget, BudgetItem, BudgetItemInput } from "@/lib/types";
import { BudgetDelete } from "@/components/layout/budget/budget-delete";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

interface BudgetListProps {
  onEdit?: (budget: Budget) => void;
  onFormSuccess?: () => void;
}

/* -------------------------------------------------------------------------- */
/* Skeleton                                                                   */
/* -------------------------------------------------------------------------- */

function BudgetListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-48" />
              <div className="flex gap-2">
                <Skeleton className="h-9 w-9" />
                <Skeleton className="h-9 w-9" />
              </div>
            </div>
            <Skeleton className="h-4 w-32" />
          </CardHeader>

          <CardContent className="space-y-3">
            {Array.from({ length: 2 }).map((_, subIndex) => (
              <div key={subIndex}>
                <div className="mb-1 flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Card                                                                       */
/* -------------------------------------------------------------------------- */
export function BudgetDetails(item: BudgetItem) {
  const spent = -(item.spent ?? 0);
  const amount = item.amount ?? 0;
  const percentage = amount > 0 ? (spent / amount) * 100 : 0;
  const isOverBudget = percentage > 100;

  return (
    <div key={item.id}>
      <div className="mb-1 flex justify-between text-sm">
        <span className="font-medium">{item.category.name}</span>

        <span
          className={
            isOverBudget ? "text-destructive" : "text-muted-foreground"
          }
        >
          ${spent.toFixed(2)} / ${amount.toFixed(2)}
        </span>
      </div>

      <Progress
        value={Math.min(percentage, 100)}
        className="bg-linear-to-r from-green-300 to-red-900"
      />

      <p
        className={cn(
          "mt-1 text-xs",
          isOverBudget ? "text-destructive" : "text-accent",
        )}
      >
        {percentage.toFixed(1)}% utilizado do orçamento
      </p>
    </div>
  );
}

function BudgetCard({
  budget,
  onEdit,
  onFormSuccess,
}: {
  budget: Budget;
  onEdit?: (budget: Budget) => void;
  onFormSuccess?: () => void;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg">{budget.name}</CardTitle>
          <CardDescription>
            {new Date(budget.start_date).toLocaleDateString()} —{" "}
            {new Date(budget.end_date).toLocaleDateString()}
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          {onEdit && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => onEdit(budget)}
              aria-label="Editar orçamento"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}

          <BudgetDelete budgetId={budget.id} onSuccess={onFormSuccess} />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {budget.budget_items?.length ? (
          budget.budget_items.map((item, index) => (
            <BudgetDetails key={index} {...item} />
          ))
        ) : (
          <div className="py-4 text-center text-muted-foreground">
            Nenhum item de orçamento encontrado
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/* List                                                                       */
/* -------------------------------------------------------------------------- */

export function BudgetList({ onEdit, onFormSuccess }: BudgetListProps) {
  const { data: budgets, isLoading, error, refetch } = useBudgets();

  if (isLoading) {
    return <BudgetListSkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <div className="mb-4 rounded-md border border-destructive/20 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">
              Houve um erro ao carregar os orçamentos.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => refetch()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!budgets?.length) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <h3 className="mb-2 text-lg font-semibold">Nenhum orçamento ainda</h3>
          <p className="text-center text-muted-foreground">
            Crie seu primeiro orçamento para começar a acompanhar seus objetivos
            de gastos.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {budgets.map((budget) => (
        <BudgetCard
          key={budget.id}
          budget={budget}
          onEdit={onEdit}
          onFormSuccess={onFormSuccess}
        />
      ))}
    </div>
  );
}
