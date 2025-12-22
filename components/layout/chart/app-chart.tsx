"use client";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useChartData } from "@/hooks/use-chart-data";
const chartConfig = {
  debit: {
    label: "Débito",
    color: "var(--chart-1)",
  },
  credit: {
    label: "Crédito",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;
export function AppChart({ accountId }: { accountId?: string }) {
  const { data: transactions, isLoading, error } = useChartData(accountId);
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-destructive">
        Erro ao carregar dados do gráfico
      </div>
    );
  }
  if (!transactions) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-muted">
        Não encontramos dados
      </div>
    );
  }
  return (
    <div className="grow">
      <ChartContainer
        config={chartConfig}
        className="h-[650px] min-h-[200px] w-full"
      >
        <BarChart accessibilityLayer data={transactions}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => value.slice(0, 3)}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent payload={undefined} />} />
          <Bar dataKey="debit" fill="var(--color-debit)" radius={4} />
          <Bar dataKey="credit" fill="var(--color-credit)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
