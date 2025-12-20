"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Account } from "@/lib/types";
import {
  Building2,
  CreditCard,
  Wallet,
  PiggyBank,
  TrendingUp,
  CalendarDays,
} from "lucide-react";

export interface AccountCardProps {
  account: Account;
  onClick?: () => void;
}

const accountTypeConfig: Record<
  string,
  {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    color: string;
  }
> = {
  CHECKING: {
    icon: Building2,
    label: "Conta Corrente",
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  SAVINGS: {
    icon: PiggyBank,
    label: "Poupança",
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  INVESTMENT: {
    icon: TrendingUp,
    label: "Investimento",
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  },
  CREDIT_CARD: {
    icon: CreditCard,
    label: "Cartão de Crédito",
    color: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  },
  CASH: {
    icon: Wallet,
    label: "Carteira",
    color: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  },
};

export function formatCurrency(
  amount: number,
  currency: string = "BRL",
): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(amount);
}

export function AccountCard({ account, onClick }: AccountCardProps) {
  const config = accountTypeConfig[account.kind] || accountTypeConfig.CHECKING;
  const Icon = config.icon;
  const balance = account.current_amount || 0;
  const isNegative = balance < 0;
  const isCreditCard = account.kind === "CREDIT_CARD";

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02]",
        "group relative overflow-hidden",
      )}
      onClick={onClick}
      data-testid={`account-card-${account.id}`}
    >
      {/* Subtle gradient background */}
      <div
        className={cn(
          "absolute inset-0 opacity-30 transition-opacity group-hover:opacity-50",
          config.color.replace("text-", "bg-").split(" ")[0],
        )}
        style={{
          background: `linear-gradient(135deg, transparent 0%, currentColor 100%)`,
          opacity: 0.05,
        }}
      />

      <CardContent className="p-4 relative">
        <div className="flex items-start justify-between gap-3">
          {/* Icon and Info */}
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className={cn("rounded-lg p-2.5 shrink-0", config.color)}>
              <Icon className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <h3
                className="font-semibold text-sm truncate"
                title={account.identification}
              >
                {account.identification}
              </h3>
              <Badge variant="secondary" className="mt-1 text-xs font-normal">
                {config.label}
              </Badge>
            </div>
          </div>

          {/* Balance */}
          <div className="text-right shrink-0">
            <p
              className={cn(
                "font-bold text-lg tabular-nums",
                isNegative
                  ? "text-red-600 dark:text-red-400"
                  : "text-emerald-600 dark:text-emerald-400",
              )}
              data-testid="account-balance"
            >
              {formatCurrency(balance, account.currency)}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {account.currency}
            </p>
          </div>
        </div>

        {/* Credit Card specific info */}
        {isCreditCard && (
          <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-4 text-xs text-muted-foreground">
            {account.credit_limit && (
              <div className="flex items-center gap-1">
                <CreditCard className="h-3 w-3" />
                <span>
                  Limite:{" "}
                  {formatCurrency(account.credit_limit, account.currency)}
                </span>
              </div>
            )}
            {account.bill_due_day && (
              <div className="flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                <span>Venc: dia {account.bill_due_day}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
