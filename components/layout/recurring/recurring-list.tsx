"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarClock, Plus, Repeat, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RecurringTemplateForm } from "@/components/layout/recurring/recurring-template-form";
import { useRecurringTemplates } from "@/hooks/use-recurring";
import { formatCurrency } from "@/lib/utils";
import type { RecurringTemplate } from "@/lib/types";

export function RecurringList() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<
    string | undefined
  >();

  const { data: templates, isLoading, error } = useRecurringTemplates();

  const sortedTemplates = useMemo(() => {
    if (!templates) return [] as Array<RecurringTemplate>;
    return [...templates].sort((a, b) =>
      (b.next_occurrence || "").localeCompare(a.next_occurrence || ""),
    );
  }, [templates]);

  const handleRowClick = (id: string) => {
    setSelectedTemplateId(id);
    setIsFormOpen(true);
  };

  const handleCreateNew = () => {
    setSelectedTemplateId(undefined);
    setIsFormOpen(true);
  };

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
        onClick={() => handleRowClick(template.id)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
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
          </div>

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
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Template
        </Button>
      </div>

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

      {isFormOpen && (
        <RecurringTemplateForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          templateId={selectedTemplateId}
        />
      )}
    </div>
  );
}
