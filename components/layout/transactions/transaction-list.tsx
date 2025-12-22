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
import { TimelineList } from "@/components/layout/timeline/timeline-list";
import type { TimelineEntry } from "@/lib/types";

interface TransactionListProps {
  accountId?: string;
  limit?: number;
}

export function TransactionList({
  accountId,
  limit,
}: TransactionListProps = {}) {
  const router = useRouter();

  const handleItemClick = (id: string, entry: TimelineEntry) => {
    if (entry.entry_type === "TRANSACTION") {
      router.push(
        `/dashboard/${accountId ? `accounts/${accountId}/` : ""}transactions/${id}`,
      );
    }
  };

  return (
    <TimelineList
      accountId={accountId}
      limit={limit}
      onItemClick={handleItemClick}
    />
  );
}
