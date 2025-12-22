import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TransactionList } from "@/components/layout/transactions/transaction-list";
import { cn } from "@/lib/utils";
export function RecentTransactions({ className }: { className?: string }) {
  return (
    <Card className={cn("mt-4", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Transações Recentes</CardTitle>
            <CardDescription>
              Sua atividade financeira mais recente
            </CardDescription>
          </div>
          <Button variant="outline" asChild>
            <Link href="/dashboard/transactions">Ver Todas</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <TransactionList limit={5} />
      </CardContent>
    </Card>
  );
}
