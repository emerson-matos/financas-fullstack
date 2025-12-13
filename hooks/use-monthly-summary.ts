import { useQuery } from "@tanstack/react-query";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import { api } from "@/lib/api";

interface MonthlySummary {
  month: string;
  categories: Record<string, number>;
  total_income: number;
  total_expense: number;
  net: number;
}

interface UseMonthlySummaryParams {
  months?: number;
  startDate?: Date;
  endDate?: Date;
}

export function useMonthlySummary({
  months = 6,
  startDate,
  endDate,
}: UseMonthlySummaryParams = {}) {
  const end = endDate || endOfMonth(new Date());
  const start = startDate || startOfMonth(subMonths(end, months - 1));

  return useQuery({
    queryKey: [
      "reports",
      "monthly-summary",
      {
        startDate: start.toISOString().split("T")[0],
        endDate: end.toISOString().split("T")[0],
      },
    ],
    queryFn: async () => {
      const response = await api.get<MonthlySummary[]>(
        "/reports/monthly-summary",
        {
          params: {
            start_date: start.toISOString().split("T")[0],
            end_date: end.toISOString().split("T")[0],
          },
        },
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
