/**
 * Transaction table column definitions for TransactionList.
 *
 * Usage example:
 *
 * import { TransactionList } from "@/components/transactions/transaction-list";
 * import { defaultTransactionColumns, compactTransactionColumns } from "@/components/transactions/columns";
 *
 * // Full table (transactions page):
 * <TransactionList columns={defaultTransactionColumns} />
 *
 * // Compact table (dashboard):
 * <TransactionList columns={compactTransactionColumns} limit={5} />
 */
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ArrowUpDown } from "lucide-react";
import { CategoryBadge } from "@/components/category-badge";
import { Button } from "@/components/ui/button";
import type { Transaction } from "@/lib/types";
/**
 * Default columns for the TransactionList (full view, transactions page)
 * Use with: <TransactionList columns={defaultTransactionColumns} />
 */
export const defaultTransactionColumns: Array<ColumnDef<Transaction>> = [
  {
    accessorKey: "transacted_date",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Data
        {/* TODO: fix the icon */}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = new Date(row.original.transacted_date);
      return new Intl.DateTimeFormat("pt-BR").format(date);
    },
  },
  {
    accessorKey: "description",
    header: "Nome",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <p className="max-w-[200px] truncate font-medium">
          {row.original.description}
        </p>
        {row.original.category && (
          <CategoryBadge
            id={row.original.category.id}
            name={row.original.category.name}
          />
        )}
      </div>
    ),
  },
  {
    accessorKey: "account.identification",
    header: "Conta",
    cell: ({ row }) => row.original.account?.identification || "N/A",
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Valor
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const currency = row.original.account?.currency || "BRL";
      const amount = Number(row.original.amount) || 0;
      const amountFormatter = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: currency,
      });

      // Amount is already signed: negative = expense (red), positive = income (green)
      if (amount < 0) {
        return (
          <span className="text-red-500">
            {amountFormatter.format(amount)}
          </span>
        );
      }
      if (amount === 0) {
        return (
          <span className="text-muted-foreground">
            {amountFormatter.format(amount)}
          </span>
        );
      }
      // Positive amount
      return (
        <span className="text-green-500">
          +{amountFormatter.format(amount)}
        </span>
      );
    },
  },
];
/**
 * Compact columns for the TransactionList (dashboard/recent transactions)
 * Use with: <TransactionList columns={compactTransactionColumns} limit={5} />
 */
export const compactTransactionColumns: Array<ColumnDef<Transaction>> = [
  {
    accessorKey: "transacted_date",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Data
        {/* TODO: fix this icon */}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) =>
      format(new Date(row.original.transacted_date), "dd/MMM/yyyy"),
  },
  {
    accessorKey: "description",
    header: "Descrição",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <p className="max-w-[200px] truncate font-medium">
          {row.original.description}
        </p>
        {row.original.category && (
          <CategoryBadge
            id={row.original.category.id}
            name={row.original.category.name}
          />
        )}
      </div>
    ),
  },
  {
    accessorKey: "account.identification",
    header: "Conta",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.account?.identification || "N/A"}
      </span>
    ),
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="w-full justify-center"
      >
        Valor
        {/* TODO: fix this icon */}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const currency = row.original.account?.currency || "BRL";
      const amount = Number(row.original.amount) || 0;
      const amountFormatter = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: currency,
      });

      // Amount is already signed: negative = expense (red), positive = income (green)
      if (amount < 0) {
        return (
          <span className="text-red-500">
            {amountFormatter.format(amount)}
          </span>
        );
      }
      if (amount === 0) {
        return (
          <span className="text-muted-foreground">
            {amountFormatter.format(amount)}
          </span>
        );
      }
      // Positive amount
      return (
        <span className="text-green-500">
          +{amountFormatter.format(amount)}
        </span>
      );
    },
  },
];
