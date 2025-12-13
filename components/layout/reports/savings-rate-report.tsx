import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useTransactionsForChart } from "@/hooks/use-transactions";
export function SavingsRateReport() {
  const {
    data: transactions,
    isLoading,
    isFetching,
  } = useTransactionsForChart();
  if (isLoading || isFetching) {
    return <Skeleton className="h-[200px] sm:h-[250px] w-full" />;
  }
  const income =
    transactions
      ?.filter((t) => t.amount > 0)
      .reduce((acc, t) => acc + t.amount, 0) || 0;
  const expenses =
    transactions
      ?.filter((t) => t.amount < 0)
      .reduce((acc, t) => acc + t.amount, 0) || 0;
  const savingsRate = income > 0 ? ((income + expenses) / income) * 100 : 0;
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm sm:text-base font-medium">
            Taxa de Economia
          </span>
          <span className="text-sm sm:text-base font-bold text-primary">
            {savingsRate.toFixed(1)}%
          </span>
        </div>
        <Progress value={savingsRate} className="h-2 sm:h-3" />
      </div>
      <div className="space-y-3 sm:space-y-4">
        <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
          <span className="text-xs sm:text-sm text-muted-foreground">
            Receita Total
          </span>
          <span className="text-sm sm:text-base font-semibold text-green-600">
            ${income.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
          <span className="text-xs sm:text-sm text-muted-foreground">
            Despesas Totais
          </span>
          <span className="text-sm sm:text-base font-semibold text-red-600">
            ${Math.abs(expenses).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border">
          <span className="text-xs sm:text-sm font-medium">Economia</span>
          <span className="text-sm sm:text-base font-bold text-primary">
            ${(income + expenses).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
