"use client";

import { Heading } from "@/components/heading";
import { Separator } from "@/components/ui/separator";
import {
  AccountForm,
  FormValues,
} from "@/components/layout/accounts/account-create";
import { useCreateAccount } from "@/hooks/use-accounts";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { BackButton } from "@/components/back-button";

export default function CreateAccountPage() {
  const router = useRouter();
  const { toast } = useToast();
  const createAccountMutation = useCreateAccount();
  const [isPending, startTransition] = useTransition();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createdAccountName, setCreatedAccountName] = useState("");
  const [newAccountId, setNewAccountId] = useState("");
  const [formKey, setFormKey] = useState(0);

  const handleSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        const accountData = {
          identification: values.identification,
          initial_amount: values.initial_amount,
          currency: values.currency,
          kind: values.kind,
          credit_limit: values.credit_limit,
          bill_closing_day: values.bill_closing_day,
          bill_due_day: values.bill_due_day,
        };

        const newAccount = await createAccountMutation.mutateAsync(accountData);

        setCreatedAccountName(values.identification);
        setNewAccountId(newAccount.id);
        setCreateDialogOpen(true);

        toast({
          title: "Conta criada com sucesso",
          description: "A nova conta foi adicionada ao seu portfólio.",
        });
      } catch (error) {
        console.error(error);
        toast({
          title: "Erro ao criar conta",
          description: "Não foi possível criar a conta. Tente novamente.",
          variant: "destructive",
        });
      }
    });
  };

  const handleCreateAnother = () => {
    setCreateDialogOpen(false);
    setFormKey((prev) => prev + 1); // Force re-render to reset form
  };

  const handleViewAccount = () => {
    router.push(`/dashboard/accounts/${newAccountId}`);
  };

  const isLoading = isPending || createAccountMutation.isPending;

  return (
    <div className="mx-auto space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8 max-w-2xl">
      <div className="flex items-center justify-between">
        <Heading
          title="Nova Conta"
          description="Adicione uma nova conta financeira ao seu portfólio"
        />
        <BackButton />
      </div>
      <Separator />
      <AccountForm
        key={formKey}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        onClose={() => router.push("/dashboard/accounts")}
        mode="create"
      />

      <AlertDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conta criada com sucesso!</AlertDialogTitle>
            <AlertDialogDescription>
              A conta &quot;{createdAccountName}&quot; foi criada. O que você
              gostaria de fazer agora?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleViewAccount}>
              Ver nova conta
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleCreateAnother}>
              Criar outra conta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
