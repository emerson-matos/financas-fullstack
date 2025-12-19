"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppChart } from "@/components/layout/chart/app-chart";
import { CategoryBreakdownReport } from "@/components/layout/reports/category-breakdown-report";
import { IncomeExpenseReport } from "@/components/layout/reports/income-expense-report";
import { NetWorthReport } from "@/components/layout/reports/net-worth-report";
import { SavingsRateReport } from "@/components/layout/reports/savings-rate-report";

export function ReportsView() {
  const [activeTab, setActiveTab] = useState("income-expense");
  return (
    <div className="space-y-4">
      <Tabs
        defaultValue="income-expense"
        onValueChange={setActiveTab}
        value={activeTab}
      >
        <div className="w-full">
          <TabsList className="md:w-auto">
            <TabsTrigger
              className="whitespace-nowrap shrink-0"
              value="income-expense"
            >
              Receitas vs Despesas
            </TabsTrigger>
            <TabsTrigger
              className="whitespace-nowrap shrink-0"
              value="category-breakdown"
            >
              Análise por Categoria
            </TabsTrigger>
            <TabsTrigger
              className="whitespace-nowrap shrink-0"
              value="savings-rate"
            >
              Taxa de Economia
            </TabsTrigger>
            <TabsTrigger
              className="whitespace-nowrap shrink-0"
              value="net-worth"
            >
              Patrimônio Líquido
            </TabsTrigger>
            <TabsTrigger
              className="whitespace-nowrap shrink-0"
              value="app-chart"
            >
              Outro gráfico
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="income-expense">
          <IncomeExpenseReport />
        </TabsContent>
        <TabsContent value="category-breakdown">
          <CategoryBreakdownReport />
        </TabsContent>
        <TabsContent value="savings-rate">
          <SavingsRateReport />
        </TabsContent>
        <TabsContent value="net-worth">
          <NetWorthReport />
        </TabsContent>
        <TabsContent value="app-chart">
          <AppChart />
        </TabsContent>
      </Tabs>
    </div>
  );
}
