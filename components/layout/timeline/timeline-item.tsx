"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  PartyPopper,
  Wallet,
  CreditCard,
  Clock,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import type { TimelineEntry } from "@/lib/types";

interface TimelineItemProps {
  item: TimelineEntry;
  onItemClick?: (id: string) => void;
}

export function TimelineItem({ item, onItemClick }: TimelineItemProps) {
  const data = item.data as {
    name?: string;
    message?: string;
  };

  const getEventIcon = (entry: TimelineEntry) => {
    if (entry.entry_type === "TRANSACTION") {
      return entry.highlight_type === "CREDIT" ? (
        <ArrowUpCircle className="h-5 w-5 text-emerald-500" />
      ) : (
        <ArrowDownCircle className="h-5 w-5 text-rose-500" />
      );
    }

    switch (entry.highlight_type) {
      case "WELCOME":
        return <PartyPopper className="h-5 w-5 text-amber-500" />;
      case "ACCOUNT_CREATED":
        return <Wallet className="h-5 w-5 text-blue-500" />;
      case "BILL_PAYMENT":
        return <CreditCard className="h-5 w-5 text-purple-500" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getBadgeConfig = () => {
    if (item.entry_type === "TRANSACTION") {
      return {
        label: "Movimento",
        className: "bg-muted text-muted-foreground border-border",
      };
    }
    switch (item.highlight_type) {
      case "WELCOME":
        return {
          label: "Início",
          className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
        };
      case "ACCOUNT_CREATED":
        return {
          label: "Patrimônio",
          className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
        };
      case "BILL_PAYMENT":
        return {
          label: "Pagamento",
          className: "bg-purple-500/10 text-purple-600 border-purple-500/20",
        };
      default:
        return {
          label: "Destaque",
          className: "bg-muted text-muted-foreground border-border",
        };
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const badgeConfig = getBadgeConfig();

  return (
    <Card
      key={item.id}
      className={cn(
        "group overflow-hidden transition-all hover:shadow-md hover:border-primary/20",
        onItemClick && "cursor-pointer",
      )}
      onClick={() => onItemClick?.(item.id)}
    >
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/50 transition-colors group-hover:bg-background group-hover:ring-1 group-hover:ring-border",
                item.entry_type === "ACTIVITY" &&
                  "bg-primary/5 ring-1 ring-primary/10",
              )}
            >
              {getEventIcon(item)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold leading-none">
                  {item.entry_type === "TRANSACTION"
                    ? data.name || "Transação"
                    : item.highlight_type === "WELCOME"
                      ? "Sua Jornada Começa"
                      : item.highlight_type === "BILL_PAYMENT"
                        ? "Pagamento de Fatura"
                        : `Novo Registro: ${data.name || "Conta"}`}
                </p>
                <Badge
                  variant="outline"
                  className={cn(
                    "h-5 text-[10px] font-bold uppercase tracking-wider",
                    badgeConfig.className,
                  )}
                >
                  {badgeConfig.label}
                </Badge>
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground line-clamp-1">
                {item.description ||
                  (item.entry_type === "ACTIVITY"
                    ? data.message || "Um novo marco registrado"
                    : "Sem descrição")}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-center gap-2">
            {item.entry_type === "TRANSACTION" && item.amount !== null && (
              <span
                className={cn(
                  "text-base font-bold tracking-tight",
                  item.highlight_type === "CREDIT"
                    ? "text-emerald-500"
                    : "text-foreground",
                )}
              >
                {formatCurrency(item.amount, item.currency || "BRL")}
              </span>
            )}
            <time className="text-xs font-medium text-muted-foreground/60 tabular-nums">
              {format(parseISO(item.event_time), "HH:mm")}
            </time>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
