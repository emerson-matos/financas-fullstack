"use client";

import { useTimeline } from "@/hooks/use-timeline";
import { DashboardShell } from "@/components/layout/dashboard/dashboard-shell";
import { Heading } from "@/components/heading";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  PartyPopper, 
  Wallet,
  Clock
} from "lucide-react";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { TimelineEntry } from "@/lib/types";

export function Timeline() {
  const { data: entries, isLoading } = useTimeline({ size: 50 });

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency,
    }).format(amount);
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
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getEventDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return "Hoje";
    if (isYesterday(date)) return "Ontem";
    return format(date, "d 'de' MMMM, yyyy", { locale: ptBR });
  };

  // Group entries by date
  const groupedEntries = entries?.reduce((groups, entry) => {
    const dateLabel = getEventDateLabel(entry.event_time);
    if (!groups[dateLabel]) groups[dateLabel] = [];
    groups[dateLabel].push(entry);
    return groups;
  }, {} as Record<string, TimelineEntry[]>);

  return (
    <DashboardShell className="mx-auto space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <Heading
        title="Linha do Tempo"
        description="Acompanhe cada marco da sua jornada financeira"
      />
      <Separator />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Clock className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-linear-to-b before:from-muted before:via-muted before:to-transparent">
          {groupedEntries && Object.entries(groupedEntries).map(([date, items]) => (
            <div key={date} className="relative space-y-4">
              <div className="flex items-center gap-4">
                <div className="z-10 flex h-10 w-10 items-center justify-center rounded-full bg-background ring-2 ring-muted shadow-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-semibold tracking-tight text-muted-foreground uppercase">
                  {date}
                </h3>
              </div>

              <div className="ml-12 space-y-4">
                {items.map((item) => {
                  const data = item.data as { name?: string; message?: string };
                  return (
                    <Card key={item.id} className="group overflow-hidden transition-all hover:shadow-md hover:border-primary/20">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-start gap-4">
                            <div className={cn(
                              "mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/50 transition-colors group-hover:bg-background group-hover:ring-1 group-hover:ring-border",
                              item.entry_type === "ACTIVITY" && "bg-primary/5 ring-1 ring-primary/10"
                            )}>
                              {getEventIcon(item)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold leading-none">
                                  {item.entry_type === "TRANSACTION" 
                                    ? data.name || "Transação"
                                    : item.highlight_type === "WELCOME" ? "Sua Jornada Começa" : `Novo Registro: ${data.name || "Conta"}`}
                                </p>
                                {(() => {
                                  const getBadgeConfig = () => {
                                    if (item.entry_type === "TRANSACTION") {
                                      return { label: "Movimento", className: "bg-muted text-muted-foreground border-border" };
                                    }
                                    switch (item.highlight_type) {
                                      case "WELCOME":
                                        return { label: "Início", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" };
                                      case "ACCOUNT_CREATED":
                                        return { label: "Patrimônio", className: "bg-blue-500/10 text-blue-600 border-blue-500/20" };
                                      default:
                                        return { label: "Destaque", className: "bg-muted text-muted-foreground border-border" };
                                    }
                                  };
                                  const config = getBadgeConfig();
                                  return (
                                    <Badge variant="outline" className={cn("h-5 text-[10px] font-bold uppercase tracking-wider", config.className)}>
                                      {config.label}
                                    </Badge>
                                  );
                                })()}
                              </div>
                              <p className="mt-1.5 text-sm text-muted-foreground line-clamp-1">
                                {item.description || (item.entry_type === "ACTIVITY" ? data.message || "Um novo marco registrado" : "Sem descrição")}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-center gap-2">
                            {item.entry_type === "TRANSACTION" && item.amount !== null && (
                              <span className={cn(
                                "text-base font-bold tracking-tight",
                                item.highlight_type === "CREDIT" ? "text-emerald-500" : "text-foreground"
                              )}>
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
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
