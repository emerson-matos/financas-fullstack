"use client";
import { LucideTrendingUp } from "lucide-react";
import { useId } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useReport } from "@/hooks/use-report";
import type { NetWorthDataPoint, NetWorthReportDTO } from "@/lib/types";
const chartConfig = {
  value: {
    label: "Patrimônio",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;
export function NetWorthReport() {
  const { data: report, isLoading } = useReport("net-worth");
  const gradientId = useId();
  if (isLoading) {
    return <Skeleton className="h-[250px] sm:h-[350px] w-full" />;
  }
  const netWorthData =
    (report as NetWorthReportDTO)?.data?.map((account: NetWorthDataPoint) => ({
      name: account.year,
      value: account.netWorth,
    })) || ([] as Array<{ name: number; value: number }>);
  const isEmpty = !netWorthData.length;
  return (
    <div className="grow">
      {isEmpty ? (
        <div className="flex h-[250px] sm:h-[350px] w-full flex-col items-center justify-center gap-2 text-muted-foreground">
          <LucideTrendingUp className="w-8 h-8" />
          <p className="text-sm sm:text-lg font-medium text-center">
            Não há dados de patrimônio para o período selecionado
          </p>
          <p className="text-xs sm:text-sm text-center px-4">
            Tente alterar os filtros ou adicionar novas contas.
          </p>
        </div>
      ) : (
        <ChartContainer
          config={chartConfig}
          className="h-[250px] sm:h-[350px] w-full"
        >
          <AreaChart
            data={netWorthData}
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
              tickFormatter={(value) =>
                new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                  maximumFractionDigits: 0,
                }).format(value)
              }
              width={80}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--color-value)"
              fill={`url(#${gradientId})`}
              strokeWidth={2}
            />
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-value)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-value)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
          </AreaChart>
        </ChartContainer>
      )}
    </div>
  );
}
