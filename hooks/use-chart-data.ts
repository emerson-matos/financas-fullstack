import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, subMonths } from "date-fns";

import type { Transaction } from "@/lib/types";

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

export const useChartData = () => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["chart-data"],
    queryFn: (): Array<ChartData> => {
      const transactions: Array<Transaction> =
        queryClient.getQueryData(["transactions", "chart-simple", {}]) ?? [];

      const groupedData = transactions.reduce(
        (
          acc: { [key: string]: { debit: number; credit: number } },
          transaction: Transaction,
        ) => {
          const month = format(
            new Date(transaction.transacted_date),
            "yyyy-MM",
          );
          const amount = +transaction.amount;
          const kind = transaction.kind;

          if (!acc[month]) {
            acc[month] = { debit: 0, credit: 0 };
          }

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
