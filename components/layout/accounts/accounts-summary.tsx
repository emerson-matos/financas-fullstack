"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Account } from "@/lib/types";
import {
  Building2,
  CreditCard,
  Wallet,
  PiggyBank,
  TrendingUp,
  Coins,
} from "lucide-react";

interface AccountsSummaryProps {
  accounts: Account[];
}

const typeConfig: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; label: string }
> = {
  CHECKING: { icon: Building2, label: "Corrente" },
  SAVINGS: { icon: PiggyBank, label: "Poupança" },
  INVESTMENT: { icon: TrendingUp, label: "Investimentos" },
  CREDIT_CARD: { icon: CreditCard, label: "Cartões" },
  CASH: { icon: Wallet, label: "Carteira" },
};

function formatCurrency(amount: number, currency: string = "BRL"): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(amount);
}

export function AccountsSummary({ accounts }: AccountsSummaryProps) {
  // Calculate totals by type
  const totals = accounts.reduce(
    (acc, account) => {
      const amount = account.current_amount || 0;
      acc.total += amount;
      acc.byType[account.kind] = (acc.byType[account.kind] || 0) + amount;
      return acc;
    },
    { total: 0, byType: {} as Record<string, number> },
  );

  const isNegative = totals.total < 0;

  // Get types that have accounts
  const activeTypes = Object.keys(totals.byType).sort((a, b) => {
    // Sort order: CHECKING, SAVINGS, INVESTMENT, CASH, CREDIT_CARD
    const order = ["CHECKING", "SAVINGS", "INVESTMENT", "CASH", "CREDIT_CARD"];
    return order.indexOf(a) - order.indexOf(b);
  });

  return (
    <Card className="bg-linear-to-br from-primary/5 via-background to-background border-primary/10">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Total Balance */}
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Coins className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">
                Patrimônio Total
              </p>
              <p
                className={cn(
                  "text-3xl font-bold tracking-tight",
                  isNegative
                    ? "text-red-600 dark:text-red-400"
                    : "text-foreground",
                )}
                data-testid="total-balance"
              >
                {formatCurrency(totals.total, "BRL")}
              </p>
            </div>
          </div>

          {/* Breakdown by type */}
          <div className="flex flex-wrap gap-3">
            {activeTypes.map((type) => {
              const config = typeConfig[type];
              if (!config) return null;
              const Icon = config.icon;
              const amount = totals.byType[type];
              const isTypeNegative = amount < 0;

              return (
                <div
                  key={type}
                  className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2"
                  data-testid={`summary-${type.toLowerCase()}`}
                >
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm">
                    <span className="text-muted-foreground">
                      {config.label}:
                    </span>{" "}
                    <span
                      className={cn(
                        "font-semibold",
                        isTypeNegative
                          ? "text-red-600 dark:text-red-400"
                          : "text-foreground",
                      )}
                    >
                      {formatCurrency(amount, "BRL")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
