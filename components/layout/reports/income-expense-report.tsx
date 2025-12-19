import { LucideBarChart2, TrendingUp, TrendingDown } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useTransactionsForChart } from "@/hooks/use-transactions";
import { Button } from "@/components/ui/button";

const chartConfig = {
  income: {
    label: "Receitas",
    color: "hsl(var(--chart-1))",
    icon: TrendingUp,
  },
  expense: {
    label: "Despesas",
    color: "hsl(var(--chart-2))",
    icon: TrendingDown,
  },
} satisfies ChartConfig;

export function IncomeExpenseReport() {
  const { data: transactions, isLoading, isError, refetch } = useTransactionsForChart();

  if (isLoading) {
    return <Skeleton className="h-[350px] w-full" />;
  }

  if (isError) {
    return (
      <div className="flex h-[350px] w-full flex-col items-center justify-center gap-4 text-muted-foreground">
        <p>Ocorreu um erro ao carregar os dados.</p>
        <Button onClick={() => refetch()}>Tentar Novamente</Button>
      </div>
    );
  }

  const monthlyData =
    transactions?.reduce((acc, transaction) => {
      const month = new Date(transaction.transacted_at).toLocaleString("default", {
        month: "short",
      });
      const monthData = acc.find((item) => item.name === month) || {
        name: month,
        income: 0,
        expense: 0,
      };

      if (transaction.amount > 0) {
        monthData.income += transaction.amount;
      } else {
        monthData.expense += Math.abs(transaction.amount);
      }

      if (!acc.find((item) => item.name === month)) {
        acc.push(monthData);
      }

      return acc;
    }, [] as Array<{ name: string; income: number; expense: number }>) || [];

  const isEmpty = !monthlyData.length;

  const currency = transactions?.[0]?.account?.currency || "BRL";
  const currencyFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency,
  });

  return (
    <div className="grow">
      {isEmpty ? (
        <div className="flex h-[350px] w-full flex-col items-center justify-center gap-2 text-muted-foreground">
          <LucideBarChart2 className="w-8 h-8" />
          <p className="text-sm sm:text-lg font-medium text-center">
            Não há dados de receitas ou despesas para o período selecionado
          </p>
          <p className="text-xs sm:text-sm text-center px-4">
            Tente alterar os filtros ou adicionar novas transações.
          </p>
        </div>
      ) : (
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <BarChart data={monthlyData} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={10} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => currencyFormatter.format(value).replace(/\s/g, "")}
              width={80}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend />
            <Bar dataKey="income" fill={chartConfig.income.color} radius={[4, 4, 0, 0]} name="Receitas" />
            <Bar dataKey="expense" fill={chartConfig.expense.color} radius={[4, 4, 0, 0]} name="Despesas" />
          </BarChart>
        </ChartContainer>
      )}
    </div>
  );
}
