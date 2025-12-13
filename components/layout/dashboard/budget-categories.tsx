import Link from "next/link";
import { LucideWallet, Plus } from "lucide-react";
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
export function BudgetCategories({ className }: { className?: string }) {
  const { data: budgets, isLoading } = useBudgets();
  if (isLoading) {
    const skeletonKeys = ["skel-1", "skel-2", "skel-3"];
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Categorias do Orçamento</CardTitle>
          <CardDescription>
            Visão geral das categorias do seu orçamento ativo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {skeletonKeys.map((key) => (
            <Card key={key}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-1/3" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                  <div className="flex justify-between text-sm">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    );
  }
  const activeBudget = budgets?.find((budget) => budget.is_active);
  if (!activeBudget) {
    return (
      <Card className={className}>
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>Categorias do Orçamento</CardTitle>
            <CardDescription>
              O detalhamento das categorias do seu orçamento ativo.
            </CardDescription>
          </div>
          <Link href="/dashboard/budgets" search={{ action: "create" }}>
            <Button variant="outline">
              <Plus className="h-4 w-4" />
              Criar Orçamento
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="flex h-[350px] flex-col items-center justify-center gap-2 text-muted-foreground">
            <span className="text-4xl">
              <LucideWallet className="w-8 h-8" />
            </span>
            <p className="text-lg font-medium text-center">
              Nenhum orçamento ativo encontrado
            </p>
            <p className="text-sm text-center">
              Crie ou ative um orçamento para visualizar o detalhamento por
              categoria.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className={className}>
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle>Categorias do Orçamento</CardTitle>
          <CardDescription>
            O detalhamento das categorias do seu orçamento ativo.
          </CardDescription>
        </div>
        <Link href="/dashboard/budgets" search={{ action: "create" }}>
          <Button variant="outline">
            <Plus className="h-4 w-4" />
            Criar Orçamento
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeBudget.budget_items?.length ? (
          activeBudget.budget_items.map((item) => {
            const spent = item.spent ?? 0;
            const amount = item.amount ?? 0;
            return (
              <Card key={item.id}>
                <CardHeader>
                  <CardTitle className="text-sm">
                    {item.category.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Gasto</span>
                      <span>R${spent}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Orçamento</span>
                      <span>R${item.amount}</span>
                    </div>
                    <Progress value={(spent / amount) * 100} />
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="text-center text-muted-foreground py-4">
            Nenhum item de orçamento encontrado
          </div>
        )}
      </CardContent>
    </Card>
  );
}
