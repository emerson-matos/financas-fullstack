"use client";

import { Heading } from "@/components/heading";
import { Separator } from "@/components/ui/separator";
import { TransactionForm } from "@/components/layout/transactions/transaction-form";
import { BackButton } from "@/components/back-button";

interface TransactionNewProps {
  transactionId?: string;
  accountId?: string;
}

export function TransactionNew({
  transactionId,
  accountId,
}: TransactionNewProps) {
  return (
    <div className="mx-auto space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="flex items-center justify-between">
        <Heading
          title="Nova Transação"
          description="Adicione uma nova transação ao seu controle financeiro"
        />
        <BackButton />
      </div>
      <Separator />
      <TransactionForm accountId={accountId} transactionId={transactionId} />
    </div>
  );
}
