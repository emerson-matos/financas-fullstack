/**
 * TransactionList component
 *
 * Renders a table of transactions using the provided columns and configuration.
 *
 * Props:
 * - columns: Column definitions for the table (default: compactTransactionColumns)
 * - limit: Number of rows to fetch/display
 * - accountId: Optional account filter
 *
 * Usage:
 * <TransactionList columns={defaultTransactionColumns} />
 * <TransactionList columns={compactTransactionColumns} limit={5} />
 */
"use client";

import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/datatable/app-datatable";
import type { Transaction } from "@/lib/types";
import { compactTransactionColumns } from "./columns";
interface TransactionListProps {
  columns?: Array<ColumnDef<Transaction>>;
  limit?: number;
  accountId?: string;
}
export function TransactionList({
  columns = compactTransactionColumns,
  accountId,
  limit,
}: TransactionListProps = {}) {
  const router = useRouter();
  const queryKey = "transactions";
  const page = limit ? { number: 0, size: limit } : undefined;
  const handleRowClick = (transactionId: string) => {
    router.push(`/dashboard/${accountId ? `accounts/${accountId}/` : ""}transactions/${transactionId}`);
  };
  return (
    <DataTable
      queryKey={queryKey}
      columns={columns}
      page={page}
      defaultSort={{ id: "transacted_date", desc: true }}
      accountId={accountId}
      onRowClick={handleRowClick}
    />
  );
}
