import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TransactionList } from "@/components/layout/transactions/transaction-list";
import { cn } from "@/lib/utils";
import { ArrowRightIcon, ForwardIcon } from "lucide-react";
export function RecentTransactions({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6 pt-8", className)}>
      <div className="flex items-end justify-between border-b border-border/50 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Transações Recentes
          </h2>
          <p className="text-sm text-muted-foreground">
            Acompanhe o fluxo das suas finanças em tempo real
          </p>
        </div>
        <Button>
          <Link
            href="/dashboard/transactions"
            className="flex items-center gap-1"
          >
            Ver todas <ArrowRightIcon />
          </Link>
        </Button>
      </div>
      <TransactionList />
    </div>
  );
}
