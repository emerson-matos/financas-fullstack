import { useQuery } from "@tanstack/react-query";
import { format, subMonths } from "date-fns";
import { api } from "@/lib/api";
import type { PageResponse, Transaction } from "@/lib/types";

interface ChartData {
  month: string;
  debit: number;
  credit: number;
}

const getLastSixMonths = () => {
  const currentDate = new Date();
  const lastSixMonths = [];

  for (let i = 5; i > -1; i--) {
    lastSixMonths.push(format(subMonths(currentDate, i), "yyyy-MM"));
  }

  return lastSixMonths.reduce(
    (
      acc: { [key: string]: { debit: number; credit: number } },
      month: string,
    ) => {
      acc[month] = { debit: 0, credit: 0 };
      return acc;
    },
    {},
  );
};

export const useChartData = (accountId?: string) => {
  return useQuery({
    queryKey: ["chart-data", { accountId }],
    queryFn: async (): Promise<Array<ChartData>> => {
      // Improved strategy: Try to get data from API directly to ensure accuracy
      // This is better than relying on potentially partial cache
      // We'll fetch a somewhat large limit to get enough history for the chart
      // In a real production app, we should have a dedicated aggression endpoint
      const params = {
        size: 1000,
        sort: "transacted_at,desc",
        account_id: accountId,
      };

      const response = await api.get<PageResponse<Transaction>>(
        "/transactions",
        { params },
      );
      const transactions = response.data.content || [];

      const groupedData = transactions.reduce(
        (
          acc: { [key: string]: { debit: number; credit: number } },
          transaction: Transaction,
        ) => {
          const month = format(new Date(transaction.transacted_at), "yyyy-MM");

          // Only process if within our last 6 months window
          if (!acc[month]) return acc;

          const amount = +transaction.amount;
          const kind = transaction.kind;

          if (kind === "expense" || kind === "DEBIT" || kind === "TRANSFER") {
            acc[month].debit += amount;
          } else if (kind === "income" || kind === "CREDIT") {
            acc[month].credit += amount;
          }

          return acc;
        },
        getLastSixMonths(),
      );

      return Object.keys(groupedData)
        .map((month) => ({
          month: format(new Date(month), "MMM"),
          date: new Date(month),
          debit: groupedData[month].debit,
          credit: groupedData[month].credit,
        }))
        .sort((a, b) => a.date.getTime() - b.date.getTime());
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
