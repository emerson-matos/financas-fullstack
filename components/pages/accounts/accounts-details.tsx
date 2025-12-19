"use client";

import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccount, useDeleteAccount } from "@/hooks/use-accounts";
import { useToast } from "@/hooks/use-toast";
import { TransactionList } from "@/components/layout/transactions/transaction-list";
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
    <div className="grid gap-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            {account?.identification ?? ""}
          </CardTitle>
          <div className="flex gap-2">
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
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm text-muted-foreground">
            Moeda: <span className="font-medium">{currency}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Saldo atual:
            <span className="font-medium">{formatted}</span>
          </div>
          {account?.deactivated_at && (
            <div className="text-sm text-destructive">
              Esta conta está desativada
            </div>
          )}
          {account?.kind === "CREDIT_CARD" && (
            <div className="mt-4 grid grid-cols-1 gap-2 border-t pt-4 sm:grid-cols-2">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  Limite Total
                </div>
                <div className="font-medium">
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
                <div className="font-medium text-emerald-600">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: currency,
                  }).format(
                    (account.credit_limit || 0) + (account.current_amount || 0),
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  Fechamento da Fatura
                </div>
                <div className="font-medium">
                  Dia {account.bill_closing_day}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  Vencimento da Fatura
                </div>
                <div className="font-medium">Dia {account.bill_due_day}</div>
              </div>
            </div>
          )}
          <div className="pt-4">
            <Button
              onClick={() =>
                router.push(`/dashboard/transactions/new?accountId=${id}`)
              }
              className="w-full"
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Nova Transação
            </Button>
          </div>
        </CardContent>
      </Card>
      <Separator />
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Transações</h2>
      </div>
      <TransactionList accountId={id} />
    </div>
  );
}
