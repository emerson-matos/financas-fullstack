import type { ColumnDef } from "@tanstack/react-table";
import type { Account } from "@/lib/types";
export const columns: Array<ColumnDef<Account>> = [
  {
    accessorKey: "identification",
    header: "Nome",
  },
  {
    accessorKey: "initial_amount",
    header: "Saldo Inicial",
    cell: ({ row }) => {
      const amount = Number.parseFloat(row.getValue("initial_amount"));
      const formatted = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: row.original.currency ?? "BRL",
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "current_amount",
    header: "Saldo Atual",
    cell: ({ row }) => {
      const amount = Number.parseFloat(row.getValue("current_amount"));
      const formatted = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: row.original.currency ?? "BRL",
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
];
