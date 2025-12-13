"use client";

import { LucideWallet } from "lucide-react";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { normalizeCategory } from "@/components/category-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ChartConfig } from "@/components/ui/chart";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useMonthlySummary } from "@/hooks/use-monthly-summary";

interface MonthlyData {
  name: string;
  total: number;
  positiveCategories: Record<string, number>;
  negativeCategories: Record<string, number>;
  categories: Array<{
    name: string;
    amount: number;
    percentage: number;
  }>;
}
interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: MonthlyData;
    dataKey: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

const categoryChartColors: Record<string, string> = {
  supermercado: "var(--category-supermercado)",
  aluguel: "var(--category-aluguel)",
  contas: "var(--category-contas)",
  transporte: "var(--category-transporte)",
  entretenimento: "var(--category-entretenimento)",
  restaurantes: "var(--category-restaurantes)",
  salario: "var(--category-salario)",
  rendimentos_de_investimentos: "var(--category-rendimentos-de-investimentos)",
  parcelamento_de_emprestimo: "var(--category-parcelamento-de-emprestimo)",
  reembolso: "var(--category-reembolso)",
  rendimentos_de_juros: "var(--category-rendimentos-de-juros)",
  presente: "var(--category-presente)",
  despesas_medicas: "var(--category-despesas-medicas)",
  compras: "var(--category-compras)",
  seguro: "var(--category-seguro)",
  desconhecido: "var(--category-desconhecido)",
  inicial: "var(--category-inicial)",
};

// Componente de tooltip personalizado
const CustomTooltip = (props: TooltipProps) => {
  const { active, payload, label } = props;
  if (active && payload && payload.length) {
    // const data = payload[0].payload as MonthlyData;
    // Group the payload by positive and negative categories
    const positiveItems = payload.filter((item) =>
      item.dataKey.endsWith("-positive"),
    );
    const negativeItems = payload.filter((item) =>
      item.dataKey.endsWith("-negative"),
    );
    const totalPositive = positiveItems.reduce(
      (sum, item) => sum + item.value,
      0,
    );
    const totalNegative = negativeItems.reduce(
      (sum, item) => sum + item.value,
      0,
    );
    const netTotal = totalPositive - totalNegative;
    return (
      <div className="bg-background border border-border rounded-lg shadow-lg p-4 max-w-xs">
        <div className="font-semibold text-foreground mb-2">{label}</div>
        <div className="text-sm text-muted-foreground mb-3">
          Líquido:{" "}
          <span
            className={`font-medium ${netTotal >= 0 ? "text-green-600" : "text-destructive"}`}
          >
            R$ {Math.abs(netTotal).toFixed(2)}
          </span>
        </div>
        {positiveItems.length > 0 && (
          <div className="space-y-1 mb-3">
            <div className="text-xs font-medium text-green-600 mb-2">
              Receitas (R$ {totalPositive.toFixed(2)}):
            </div>
            {positiveItems.map((item) => {
              const categoryName = item.dataKey.replace("-positive", "");
              return (
                <div
                  key={item.dataKey}
                  className="flex justify-between items-center text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-foreground truncate max-w-[100px]">
                      {categoryName}
                    </span>
                  </div>
                  <span className="text-green-600 ml-2 font-medium">
                    R$ {item.value.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
        {negativeItems.length > 0 && (
          <div className="space-y-1">
            <div className="text-xs font-medium text-destructive mb-2">
              Despesas (R$ {totalNegative.toFixed(2)}):
            </div>
            {negativeItems.map((item) => {
              const categoryName = item.dataKey.replace("-negative", "");
              return (
                <div
                  key={item.dataKey}
                  className="flex justify-between items-center text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-foreground truncate max-w-[100px]">
                      {categoryName}
                    </span>
                  </div>
                  <span className="text-destructive ml-2 font-medium">
                    R$ {Math.abs(item.value).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }
  return null;
};

export function ExpenseOverview({ className }: { className?: string }) {
  // Use optimized server-side aggregated data
  const { data: monthlySummary, isLoading, isFetching } = useMonthlySummary({ months: 6 });

  // Transform server data to chart format
  const monthlyExpenses = useMemo(() => {
    if (!monthlySummary) return [];

    return monthlySummary.map((summary) => {
      // Parse month (format: "2025-07") to display format
      const [year, month] = summary.month.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      const name = date.toLocaleString("default", { month: "short", year: "numeric" });

      // Separate positive and negative categories
      const positiveCategories: Record<string, number> = {};
      const negativeCategories: Record<string, number> = {};

      Object.entries(summary.categories).forEach(([categoryName, amount]) => {
        if (amount > 0) {
          positiveCategories[categoryName] = amount;
        } else if (amount < 0) {
          negativeCategories[categoryName] = Math.abs(amount);
        }
      });

      // Create chart data with flattened category keys
      const chartData: Record<string, number | string> = { name };
      Object.entries(positiveCategories).forEach(([categoryName, amount]) => {
        chartData[`${categoryName}-positive`] = amount;
      });
      Object.entries(negativeCategories).forEach(([categoryName, amount]) => {
        chartData[`${categoryName}-negative`] = amount;
      });

      // Create categories array for tooltip
      const total = summary.total_income + summary.total_expense;
      const categories = Object.entries(summary.categories)
        .map(([categoryName, amount]) => ({
          name: categoryName,
          amount: Math.abs(amount),
          percentage: total > 0 ? (Math.abs(amount) / total) * 100 : 0,
        }))
        .sort((a, b) => b.amount - a.amount);

      return {
        name,
        total: summary.net,
        positiveCategories,
        negativeCategories,
        categories,
        ...chartData,
      };
    });
  }, [monthlySummary]);

  // Get all unique categories
  const allCategories = useMemo(() => {
    const categorySet = new Set<string>();
    monthlyExpenses.forEach((month) => {
      Object.keys(month.positiveCategories).forEach((cat) => {
        categorySet.add(cat);
      });
      Object.keys(month.negativeCategories).forEach((cat) => {
        categorySet.add(cat);
      });
    });
    return Array.from(categorySet).sort();
  }, [monthlyExpenses]);
  // Create chart config for all categories
  const chartConfig = useMemo(() => {
    const config: ChartConfig = {};
    allCategories.forEach((category) => {
      const normalizedName = normalizeCategory(category);
      const color =
        categoryChartColors[normalizedName] || "var(--category-desconhecido)";
      config[`${category}-positive`] = {
        label: `${category} (Receita)`,
        color: color,
      };
      config[`${category}-negative`] = {
        label: `${category} (Despesa)`,
        color: color,
      };
    });
    return config;
  }, [allCategories]);

  if (isLoading || isFetching) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Resumo de Despesas</CardTitle>
          <CardDescription>
            Seus gastos mensais nos últimos 6 meses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
    );
  }
  const isEmpty = !monthlyExpenses.length;
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Resumo de Despesas</CardTitle>
        <CardDescription>
          Seus gastos mensais nos últimos 6 meses.
        </CardDescription>
      </CardHeader>
      <CardContent className="h-full">
        {isEmpty ? (
          <div className="flex h-[350px] w-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <span className="text-4xl">
              <LucideWallet />
            </span>
            <p className="text-lg font-medium text-center">
              Não há despesas para exibir
            </p>
            <p className="text-sm text-center">
              Adicione transações para ver seu resumo de despesas.
            </p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <BarChart
              data={monthlyExpenses}
              margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
              stackOffset="sign"
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
                width={72}
                tickMargin={8}
                tickFormatter={(value) => `R$ ${Math.abs(value).toFixed(2)}`}
              />
              <ChartTooltip content={<CustomTooltip />} />
              {/* Positive category bars */}
              {allCategories.map((category) => (
                <Bar
                  key={`${category}-positive`}
                  dataKey={`${category}-positive`}
                  stackId="positive"
                  fill={`var(--color-${category}-positive)`}
                  radius={[0, 0, 0, 0]}
                />
              ))}
              {/* Negative category bars */}
              {allCategories.map((category) => (
                <Bar
                  key={`${category}-negative`}
                  dataKey={`${category}-negative`}
                  stackId="negative"
                  fill={`var(--color-${category}-negative)`}
                  radius={[0, 0, 0, 0]}
                />
              ))}
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
