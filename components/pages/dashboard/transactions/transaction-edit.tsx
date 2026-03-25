"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/heading";
import { Separator } from "@/components/ui/separator";
import { TransactionForm } from "@/components/layout/transactions/transaction-form";

interface TransactionEditProps {
  transactionId: string;
}

export function TransactionEdit({ transactionId }: TransactionEditProps) {
  const router = useRouter();

  return (
    <div className="mx-auto space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="flex items-center justify-between">
        <Heading
          title="Editar Transação"
          description="Visualize e altere todas as informações desta transação"
        />
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>
      <Separator />
      <TransactionForm transactionId={transactionId} redirect />
    </div>
  );
}
