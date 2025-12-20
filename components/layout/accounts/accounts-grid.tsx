"use client";

import { useRouter } from "next/navigation";
import type { Account } from "@/lib/types";
import { AccountCard } from "@/components/layout/accounts/account-card";
import { AccountsSummary } from "@/components/layout/accounts/accounts-summary";
import { useAccounts } from "@/hooks/use-accounts";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2,
  CreditCard,
  Wallet,
  PiggyBank,
  TrendingUp,
} from "lucide-react";

const typeOrder = ["CHECKING", "SAVINGS", "INVESTMENT", "CASH", "CREDIT_CARD"];

const typeConfig: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; label: string }
> = {
  CHECKING: { icon: Building2, label: "Contas Correntes" },
  SAVINGS: { icon: PiggyBank, label: "Poupança" },
  INVESTMENT: { icon: TrendingUp, label: "Investimentos" },
  CREDIT_CARD: { icon: CreditCard, label: "Cartões de Crédito" },
  CASH: { icon: Wallet, label: "Carteira" },
};

function groupAccountsByType(accounts: Account[]): Record<string, Account[]> {
  return accounts.reduce(
    (groups, account) => {
      const type = account.kind;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(account);
      return groups;
    },
    {} as Record<string, Account[]>,
  );
}

function AccountsGridSkeleton() {
  return (
    <div className="space-y-6">
      {/* Summary skeleton */}
      <Skeleton className="h-24 w-full" />

      {/* Group skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    </div>
  );
}

export function AccountsGrid() {
  const router = useRouter();
  const { data: accounts, isLoading } = useAccounts();

  if (isLoading) {
    return <AccountsGridSkeleton />;
  }

  if (!accounts || accounts?.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Nenhuma conta encontrada. Crie sua primeira conta para começar!
        </p>
      </div>
    );
  }

  const groupedAccounts = groupAccountsByType(accounts);
  const activeTypes = typeOrder.filter(
    (type) => groupedAccounts[type]?.length > 0,
  );

  const handleAccountClick = (accountId: string) => {
    router.push(`/dashboard/accounts/${accountId}`);
  };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <AccountsSummary accounts={accounts} />

      {/* Grouped Accounts */}
      {activeTypes.map((type) => {
        const config = typeConfig[type];
        if (!config) return null;
        const Icon = config.icon;
        const typeAccounts = groupedAccounts[type];

        return (
          <section
            key={type}
            data-testid={`account-group-${type.toLowerCase()}`}
          >
            <div className="flex items-center gap-2 mb-4">
              <Icon className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">{config.label}</h2>
              <span className="text-sm text-muted-foreground">
                ({typeAccounts.length})
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {typeAccounts.map((account) => (
                <AccountCard
                  key={account.id}
                  account={account}
                  onClick={() => handleAccountClick(account.id)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
