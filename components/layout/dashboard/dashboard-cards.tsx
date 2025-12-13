import { useAccounts } from "@/hooks/use-accounts";
import { useBudgets } from "@/hooks/use-budgets";
import { useTransactions } from "@/hooks/use-transactions";
import { DashboardItem } from "./dashboard-item";
export function DashboardCards() {
  const { data: accounts, isLoading: isLoadingAccounts } = useAccounts();
  const { data: transactions, isLoading: isLoadingTransactions } =
    useTransactions();
  const { data: budgets, isLoading: isLoadingBudgets } = useBudgets();
  const totalBalance =
    accounts?.reduce((acc, account) => acc + account.current_amount, 0) || 0;
  const totalTransactions = transactions?.length || 0;
  const totalBudgets = budgets?.length || 0;
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <DashboardItem
        title="Total de Saldo"
        value={`R$ ${totalBalance.toFixed(2)}`}
        isLoading={isLoadingAccounts}
      />
      <DashboardItem
        title="Total de Transações"
        value={`${totalTransactions.toString()}`}
        isLoading={isLoadingTransactions}
      />
      <DashboardItem
        title="Total de Orçamentos"
        value={totalBudgets.toString()}
        isLoading={isLoadingBudgets}
      />
    </div>
  );
}
