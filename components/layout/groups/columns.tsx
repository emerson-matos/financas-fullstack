"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Group } from "@/lib/types";

export const defaultGroupColumns: Array<ColumnDef<Group>> = [
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
    accessorKey: "members",
    header: "Membros",
    cell: ({ row }) => {
      const count = row.original.members?.length || 0;
      return `${count} membro${count !== 1 ? "s" : ""}`;
    },
  },
  {
    accessorKey: "created_at",
    header: "Criado em",
    cell: ({ row }) => {
      return format(new Date(row.original.created_at), "dd/MM/yyyy", {
        locale: ptBR,
      });
    },
  },
];
