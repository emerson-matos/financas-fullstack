import { LucideBarChart2 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useTransactionsForChart } from "@/hooks/use-transactions";
const chartConfig = {
  income: {
    label: "Receitas",
    color: "var(--color-green-600)",
  },
  expense: {
    label: "Despesas",
    color: "var(--color-red-400)",
  },
} satisfies ChartConfig;
export function IncomeExpenseReport() {
  const { data: transactions, isLoading, isError } = useTransactionsForChart();
  if (isLoading) {
    return <Skeleton className="h-[250px] sm:h-[350px] w-full" />;
  }
  if (isError) {
    return <div>algo deu errado</div>;
  }
  const monthlyData =
    transactions?.reduce(
      (acc, transaction) => {
        const month = new Date(transaction.transacted_date).toLocaleString(
          "default",
          { month: "short" },
        );
        let monthData = acc.find((item) => item.name === month);
        if (!monthData) {
          monthData = { name: month, income: 0, expense: 0 };
          acc.push(monthData);
        }
        if (transaction.amount > 0) {
          monthData.income += transaction.amount;
        } else {
          monthData.expense += Math.abs(transaction.amount);
        }
        return acc;
      },
      [] as Array<{ name: string; income: number; expense: number }>,
    ) || [];
  const isEmpty = !monthlyData.length;
  // TODO: improve me
  return (
    <div className="grow">
      {isEmpty ? (
        <div className="flex h-[250px] sm:h-[350px] w-full flex-col items-center justify-center gap-2 text-muted-foreground">
          <LucideBarChart2 className="w-8 h-8" />
          <p className="text-sm sm:text-lg font-medium text-center">
            Não há dados de receitas ou despesas para o período selecionado
          </p>
          <p className="text-xs sm:text-sm text-center px-4">
            Tente alterar os filtros ou adicionar novas transações.
          </p>
        </div>
      ) : (
        <ChartContainer
          config={chartConfig}
          className="h-[650px] sm:h-[350px] w-full"
        >
          <BarChart
            data={monthlyData}
            margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `R$${value}`}
              width={40}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="income"
              fill="var(--color-income)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="expense"
              fill="var(--color-expense)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      )}
    </div>
  );
}
