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
  return (
    <div className="container mx-auto space-y-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8 max-w-4xl">
      <div className="space-y-4">
        <Heading
          title="Nova Transação"
          description="Adicione uma nova transação ao seu controle financeiro"
        />
        <Separator />
      </div>
      <TransactionForm accountId={accountId} transactionId={transactionId} />
    </div>
  );
}
