"use client";
import { LucidePieChart } from "lucide-react";
import { Cell, Label, Pie, PieChart } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories } from "@/hooks/use-categories";
import { useTransactionsForChart } from "@/hooks/use-transactions";
export function CategoryBreakdownReport() {
  const { data: transactions, isLoading: isLoadingTransactions } =
    useTransactionsForChart();
  const { data: categories, isLoading: isLoadingCategories } = useCategories();
  if (isLoadingTransactions || isLoadingCategories) {
    return <Skeleton className="h-[250px] sm:h-[350px] w-full" />;
  }
  const categoryData =
    categories
      ?.map((category) => {
        const categoryTransactions =
          transactions?.filter(
            (t) => t.category?.id === category.id && t.amount < 0,
          ) || [];
        const total = categoryTransactions.reduce(
          (acc, t) => acc + t.amount,
          0,
        );
        return {
          id: category.id,
          name: category.name,
          value: Math.abs(total),
        };
      })
      .filter((c) => c.value > 0) || [];
  const COLORS = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
  ];
  // Create chart config from category data
  const chartConfig = categoryData.reduce((acc, category, index) => {
    const configKey = category.name.toLowerCase().replace(/\s+/g, "-");
    acc[configKey] = {
      label: category.name,
      color: COLORS[index % COLORS.length],
    };
    return acc;
  }, {} as ChartConfig);

  const updatedCategoryData = categoryData.map((c) => {
    const configKey = c.name.toLowerCase().replace(/\s+/g, "-");
    return {
      ...c,
      fill: `var(--color-${configKey})`,
    };
  });
  const isEmpty = !categoryData.length;
  return (
    <div className="grow w-full">
      {isEmpty ? (
        <div className="flex h-[250px] sm:h-[350px] w-full flex-col items-center justify-center gap-2 text-muted-foreground">
          <LucidePieChart className="w-8 h-8" />
          <p className="text-sm sm:text-lg font-medium text-center">
            Não há dados de despesas para o período selecionado
          </p>
          <p className="text-xs sm:text-sm text-center px-4">
            Tente alterar os filtros ou adicionar novas transações.
          </p>
        </div>
      ) : (
        <ChartContainer
          config={chartConfig}
          className="h-[250px] sm:h-[350px] w-full"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent />} />
            <Pie
              data={updatedCategoryData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              dataKey="value"
            >
              {updatedCategoryData.map((category) => (
                <Cell key={category.id} fill={category.fill} />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {categoryData.length}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Categorias
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
            <ChartLegend content={<ChartLegendContent />} />
          </PieChart>
        </ChartContainer>
      )}
    </div>
  );
}
