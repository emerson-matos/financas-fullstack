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
import type { Budget } from "@/lib/types";
import { BudgetDelete } from "@/components/layout/budget/budget-delete";

interface BudgetListProps {
  onEdit?: (budget: Budget) => void;
  onFormSuccess?: () => void;
}
function BudgetListSkeleton() {
  const skeletonItems = Array.from({ length: 3 }, (_, index) => ({
    id: `skeleton-budget-${index}`,
    subItems: Array.from({ length: 2 }, (_, subIndex) => ({
      id: `skeleton-item-${index}-${subIndex}`,
    })),
  }));
  return (
    <div className="space-y-4">
      {skeletonItems.map((item) => (
        <Card key={item.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-48" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-16" />
                <Skeleton className="h-9 w-16" />
              </div>
            </div>
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {item.subItems.map((subItem) => (
                <div key={subItem.id}>
                  <div className="flex justify-between mb-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
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
            {new Date(budget.start_date).toLocaleDateString()} -{" "}
            {new Date(budget.end_date).toLocaleDateString()}
          </CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          {onEdit && (
            <Button variant="outline" size="sm" onClick={() => onEdit(budget)}>
              <Edit className="h-4 w-4" />
            </Button>
          )}
          <BudgetDelete budgetId={budget.id} onSuccess={onFormSuccess} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {budget.budget_items?.length ? (
            budget.budget_items.map((item) => {
              const spent = item.spent ?? 0;
              const amount = item.amount ?? 0;
              const percentage = (spent / amount) * 100;
              const isOverBudget = percentage > 100;
              return (
                <div key={item.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{item.category.name}</span>
                    <span
                      className={
                        isOverBudget
                          ? "text-destructive"
                          : "text-muted-foreground"
                      }
                    >
                      ${spent.toFixed(2)} / ${amount.toFixed(2)}
                    </span>
                  </div>
                  <Progress
                    value={Math.min(percentage, 100)}
                    className={`h-2 ${isOverBudget ? "bg-destructive/10" : ""}`}
                  />
                  {isOverBudget && (
                    <p className="text-xs text-destructive mt-1">
                      {(percentage - 100).toFixed(1)}% over budget
                    </p>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center text-muted-foreground py-4">
              Nenhum item de orçamento encontrado
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
export function BudgetList({ onEdit, onFormSuccess }: BudgetListProps) {
  const { data: budgets, isLoading, error, refetch } = useBudgets();
  if (isLoading) {
    return <BudgetListSkeleton />;
  }
  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4 mb-4">
            <p className="text-destructive text-sm">
              Houve um erro ao carregar os orçamentos. Tente novamente.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => refetch()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }
  if (!budgets?.length) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <h3 className="text-lg font-semibold mb-2">Nenhum orçamento ainda</h3>
          <p className="text-muted-foreground text-center mb-4">
            Crie seu primeiro orçamento para começar a rastrear seus objetivos
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
