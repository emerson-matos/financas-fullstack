import type { ColumnDef } from "@tanstack/react-table";
import type { Account } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

export const columns: Array<ColumnDef<Account>> = [
  {
    accessorKey: "identification",
    header: "Nome",
  },
  {
    accessorKey: "kind",
    header: "Tipo",
    cell: ({ row }) => {
      const kind = row.getValue("kind") as string;
      return <Badge variant="outline">{kind}</Badge>;
    },
  },
  {
    accessorKey: "current_amount",
    header: "Saldo Atual",
    cell: ({ row }) => {
      const amount = Number.parseFloat(
        row.getValue("current_amount") as string,
      );
      const formatted = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: (row.original as Account).currency ?? "BRL",
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
];
