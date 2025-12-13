"use client";

import { Heading } from "@/components/heading";
import { Separator } from "@/components/ui/separator";
import { BudgetCategories } from "@/components/layout/dashboard/budget-categories";
import { DashboardCards } from "@/components/layout/dashboard/dashboard-cards";
import { DashboardShell } from "@/components/layout/dashboard/dashboard-shell";
import { ExpenseOverview } from "@/components/layout/dashboard/expense-overview";
import { RecentTransactions } from "@/components/layout/dashboard/recent-transactions";
import { useUser } from "@/hooks/use-user";

export function Dashboard() {
  const { data: user } = useUser();

  // Extract first name from full name
  const firstName = user?.name?.split(" ")[0] || "";

  return (
    <DashboardShell className="mx-auto space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <Heading
        title="Dashboard"
        description={`${firstName} bem vindo de volta`}
      />
      <Separator />
      <DashboardCards />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-7">
        <ExpenseOverview className="md:col-span-2 lg:col-span-4" />
        <BudgetCategories className="md:col-span-2 lg:col-span-3" />
      </div>
      <RecentTransactions />
    </DashboardShell>
  );
}
