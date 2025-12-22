"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heading } from "@/components/heading";
import { cn } from "@/lib/utils";
import { useAccount, useDeleteAccount } from "@/hooks/use-accounts";
import { useToast } from "@/hooks/use-toast";
import { TransactionList } from "@/components/layout/transactions/transaction-list";
import { AppChart } from "@/components/layout/chart/app-chart";
import { Coins, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export function AccountDetails({ id }: { id: string }) {
  const { toast } = useToast();
  const router = useRouter();
  const { data: account, isLoading } = useAccount(id);
  const { mutate: deleteAccount } = useDeleteAccount();

  const handleDelete = async () => {
    deleteAccount(id);
    toast({
      title: "Conta excluída",
      description: "A conta foi excluída com sucesso.",
    });
    router.push("/dashboard/accounts");
  };

  const currency = account?.currency ?? "BRL";
  const formatted = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency,
  }).format(account?.current_amount || 0);

  if (isLoading) {
    return (
      <div className="mx-auto mt-8 max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              <Skeleton className="h-5 w-4/8" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              Moeda: <Skeleton className="h-5 w-2/5" />
            </div>
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              Saldo: <Skeleton className="h-5 w-2/5" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Heading
          title={account?.identification || "Conta"}
          description={
            account?.deactivated_at ? "Esta conta está desativada" : undefined
          }
        />
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/accounts/${id}/edit`)}
          >
            Editar
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Excluir
          </Button>
        </div>
      </div>

      {/* Summary Card - Mimicking AccountsSummary style */}
      <Card className="bg-linear-to-br from-primary/5 via-background to-background border-primary/10">
        <CardContent className="p-6">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Coins className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  Saldo Atual
                </p>
                <p
                  className={cn(
                    "text-3xl font-bold tracking-tight",
                    (account?.current_amount || 0) < 0
                      ? "text-red-600 dark:text-red-400"
                      : "text-foreground",
                  )}
                >
                  {formatted}
                </p>
              </div>
            </div>

            {account?.kind === "CREDIT_CARD" && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 border-t pt-4">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">
                    Limite Total
                  </div>
                  <div className="text-xl font-semibold">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: currency,
                    }).format(account.credit_limit || 0)}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">
                    Limite Disponível
                  </div>
                  <div className="text-xl font-semibold text-emerald-600">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: currency,
                    }).format(
                      (account.credit_limit || 0) +
                        (account.current_amount || 0),
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">
                    Fechamento
                  </div>
                  <div className="text-lg font-medium">
                    Dia {account.bill_closing_day}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">
                    Vencimento
                  </div>
                  <div className="text-lg font-medium">
                    Dia {account.bill_due_day}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="transactions" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="transactions">Transações</TabsTrigger>
            <TabsTrigger value="analysis">Análise</TabsTrigger>
          </TabsList>
          <Button
            onClick={() =>
              router.push(`/dashboard/transactions/new?accountId=${id}`)
            }
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Nova Transação
          </Button>
        </div>

        <TabsContent value="transactions" className="space-y-4">
          <TransactionList accountId={id} />
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fluxo de Caixa (Últimos 6 meses)</CardTitle>
            </CardHeader>
            <CardContent>
              <AppChart accountId={id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
