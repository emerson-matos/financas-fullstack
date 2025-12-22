"use client";

import { BanknoteIcon, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

import { Heading } from "@/components/heading";
import { Separator } from "@/components/ui/separator";
import { TransactionForm } from "@/components/layout/transactions/transaction-form";

interface TransactionNewProps {
  transactionId?: string;
  accountId?: string;
}

export function TransactionNew({
  transactionId,
  accountId,
}: TransactionNewProps) {
  const router = useRouter();

  return (
    <div className="mx-auto space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Heading
            title="Nova Transação"
            description="Adicione uma nova transação ao seu controle financeiro"
          >
            <BanknoteIcon className="h-8 w-8 text-primary" />
          </Heading>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>
      <Separator />
      <TransactionForm accountId={accountId} transactionId={transactionId} />
    </div>
  );
}
