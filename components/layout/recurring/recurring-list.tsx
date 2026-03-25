"use client";

import { useMemo } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CalendarClock,
  Pencil,
  Repeat,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useRecurringTemplates } from "@/hooks/use-recurring";
import { formatCurrency } from "@/lib/utils";
import type { RecurringTemplate } from "@/lib/types";

export function RecurringList() {
  const { data: templates, isLoading, error } = useRecurringTemplates();

  const sortedTemplates = useMemo(() => {
    if (!templates) return [] as Array<RecurringTemplate>;
    return [...templates].sort((a, b) =>
      (b.next_occurrence || "").localeCompare(a.next_occurrence || ""),
    );
  }, [templates]);

  const renderTemplateCard = (template: RecurringTemplate) => {
    const amountLabel = formatCurrency(
      template.amount,
      template.currency || "BRL",
    );

    const nextLabel = template.next_occurrence
      ? format(parseISO(template.next_occurrence), "dd MMM, yyyy", {
          locale: ptBR,
        })
      : "Sem próxima ocorrência";

    return (
      <Card
        key={template.id}
        className="p-4 transition hover:-translate-y-0.5 hover:shadow-sm"
      >
        <div className="flex items-start justify-between gap-3">
          <Link
            href={`/dashboard/recurring/${template.id}`}
            className="flex-1 space-y-1"
          >
            <div className="flex items-center gap-2">
              <Repeat className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-base font-semibold leading-tight">
                {template.name}
              </h3>
            </div>
            {template.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {template.description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>{amountLabel}</span>
              <span className="text-muted-foreground/60">•</span>
              <span>{template.recurrence_rule}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarClock className="h-4 w-4" />
              <span>Próxima: {nextLabel}</span>
            </div>
            {template.account && (
              <p className="text-xs text-muted-foreground">
                Conta: {template.account.identification}
              </p>
            )}
          </Link>

          <div className="flex flex-col items-end gap-2">
            <Badge variant={template.is_active ? "default" : "outline"}>
              {template.is_active ? (
                <span className="inline-flex items-center gap-1">
                  <ToggleRight className="h-3.5 w-3.5" /> Ativo
                </span>
              ) : (
                <span className="inline-flex items-center gap-1">
                  <ToggleLeft className="h-3.5 w-3.5" /> Pausado
                </span>
              )}
            </Badge>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/dashboard/recurring/${template.id}/edit`}>
                <Pencil className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <Card key={item} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-44" />
                  <Skeleton className="h-4 w-64" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="p-4 text-center text-sm text-destructive">
          Não foi possível carregar recorrências. Tente novamente.
        </Card>
      ) : sortedTemplates.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            Nenhum template recorrente encontrado.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedTemplates.map(renderTemplateCard)}
        </div>
      )}
    </div>
  );
}
