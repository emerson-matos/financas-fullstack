import Link from "next/link";
import { Plus } from "lucide-react";
import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TransactionList } from "@/components/layout/transactions/transaction-list";
export function Transactions() {
  return (
    <div className="mx-auto space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="flex items-center justify-between">
        <Heading
          title={"Transações"}
          description="Aqui está uma lista de suas transações recentes!"
        />
        <Button>
          <Plus className="h-4 w-4" />
          <Link href="/dashboard/transactions/new">Criar Transação</Link>
        </Button>
      </div>
      <Separator />
      <TransactionList />
    </div>
  );
}
