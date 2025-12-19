"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CategoryBadge } from "@/components/category-badge";
import { Badge } from "@/components/ui/badge";
import type { RecurringTemplate } from "@/lib/types";

export const defaultRecurringColumns: Array<ColumnDef<RecurringTemplate>> = [
  {
    accessorKey: "name",
    header: "Nome",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.name}</span>
        {row.original.description && (
          <span className="text-xs text-muted-foreground line-clamp-1">
            {row.original.description}
          </span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "recurrence_rule",
    header: "Recorrência",
    cell: ({ row }) => {
      const rule = row.original.recurrence_rule;
      // Simple RRULE parser/formatter (can be improved)
      if (rule.includes("FREQ=MONTHLY")) {
        const dayMatch = rule.match(/BYMONTHDAY=(\d+)/);
        return `Mensal (Dia ${dayMatch ? dayMatch[1] : "?"})`;
      }
      if (rule.includes("FREQ=WEEKLY")) {
        return "Semanal";
      }
      return rule;
    },
  },
  {
    accessorKey: "category.name",
    header: "Categoria",
    cell: ({ row }) =>
      row.original.category ? (
        <CategoryBadge
          id={row.original.category.id}
          name={row.original.category.name}
        />
      ) : (
        "N/A"
      ),
  },
  {
    accessorKey: "amount",
    header: "Valor",
    cell: ({ row }) => {
      const currency = row.original.currency || "BRL";
      const amount = Number(row.original.amount) || 0;
      const amountFormatter = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: currency,
      });

      if (amount < 0) {
        return (
          <span className="text-red-500">{amountFormatter.format(amount)}</span>
        );
      }
      return (
        <span className="text-green-500">
          +{amountFormatter.format(amount)}
        </span>
      );
    },
  },
  {
    accessorKey: "next_occurrence",
    header: "Próxima",
    cell: ({ row }) => {
      if (!row.original.next_occurrence) return "-";
      return format(new Date(row.original.next_occurrence), "dd/MM/yyyy", {
        locale: ptBR,
      });
    },
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.is_active ? "default" : "secondary"}>
        {row.original.is_active ? "Ativo" : "Inativo"}
      </Badge>
    ),
  },
];
