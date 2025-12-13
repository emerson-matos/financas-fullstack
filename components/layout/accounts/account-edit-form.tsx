"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccount, useUpdateAccount } from "@/hooks/use-accounts";
import { useToast } from "@/hooks/use-toast";
import { AccountForm } from "@/components/layout/accounts/account-create";

interface AccountEditFormProps {
  accountId: string;
}

export function AccountEditForm({ accountId }: AccountEditFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const { data: account, isLoading } = useAccount(accountId);
  const updateAccountMutation = useUpdateAccount();

  const handleSubmit = (values: {
    identification: string;
    currency: string;
    kind?: string;
  }) => {
    startTransition(async () => {
      try {
        await updateAccountMutation.mutateAsync({
          id: accountId,
          data: values,
        });
        toast({
          title: "Conta atualizada",
          description: "As alterações foram salvas com sucesso.",
        });
        router.push(`/dashboard/accounts/details/${accountId}`);
      } catch (error) {
        console.error("Failed to update account:", error);
        toast({
          title: "Erro ao atualizar",
          description: "Não foi possível salvar as alterações.",
          variant: "destructive",
        });
      }
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-48" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!account) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Conta não encontrada
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editar Conta</CardTitle>
      </CardHeader>
      <CardContent>
        <AccountForm
          onSubmit={handleSubmit}
          isLoading={isPending || updateAccountMutation.isPending}
          onClose={() => router.back()}
          mode="edit"
          defaultValues={{
            identification: account.identification || "",
            currency: account.currency || "BRL",
            kind: account.kind || "",
          }}
        />
      </CardContent>
    </Card>
  );
}
