"use client";

import { use } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, CalendarClock, Pencil, Repeat, ToggleLeft, ToggleRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heading } from "@/components/heading";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useRecurringTemplate } from "@/hooks/use-recurring";
import { formatCurrency } from "@/lib/utils";

interface RecurringDetailProps {
  params: Promise<{ id: string }>;
}

export function RecurringDetail({ params }: RecurringDetailProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: template, isLoading, error } = useRecurringTemplate(id);

  if (isLoading) {
    return (
      <div className="mx-auto space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8 max-w-4xl">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Separator />
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="mx-auto space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8 max-w-4xl">
        <div className="flex items-center justify-between">
          <Heading title="Detalhes do Template" />
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            Template não encontrado.
          </p>
        </Card>
      </div>
    );
  }

  const amountLabel = formatCurrency(template.amount, template.currency || "BRL");
  const nextLabel = template.next_occurrence
    ? format(parseISO(template.next_occurrence), "dd MMMM, yyyy", { locale: ptBR })
    : "Sem próxima ocorrência";

  const kindLabel = {
    DEBIT: "Débito",
    CREDIT: "Crédito",
    TRANSFER: "Transferência",
    UNKNOWN: "Desconhecido",
  }[template.kind] || "Desconhecido";

  return (
    <div className="mx-auto space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Heading
            title={template.name}
            description="Detalhes do template recorrente"
          >
            <Repeat className="h-8 w-8 text-primary" />
          </Heading>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <Button asChild>
            <Link href={`/dashboard/recurring/${id}/edit`}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Link>
          </Button>
        </div>
      </div>
      <Separator />
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Valor</p>
              <p className="text-2xl font-semibold">{amountLabel}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Tipo</p>
              <p className="text-lg font-medium">{kindLabel}</p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Conta</p>
              <p className="font-medium">
                {template.account?.identification || "Não definida"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Categoria</p>
              <p className="font-medium">
                {template.category?.name || "Não definida"}
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarClock className="h-4 w-4" />
              <span>Próxima ocorrência</span>
            </div>
            <p className="font-medium">{nextLabel}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Regra de Recorrência</p>
            <p className="font-mono text-sm">{template.recurrence_rule}</p>
          </div>

          {template.description && (
            <>
              <Separator />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Descrição</p>
                <p>{template.description}</p>
              </div>
            </>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {template.is_active ? (
                <ToggleRight className="h-5 w-5 text-green-600" />
              ) : (
                <ToggleLeft className="h-5 w-5 text-muted-foreground" />
              )}
              <span className="font-medium">
                {template.is_active ? "Ativo" : "Pausado"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
