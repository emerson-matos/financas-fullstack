import { NextRequest } from "next/server";
import { createErrorResponse, createSuccessResponse } from "@/lib/api/handlers";
import { requireAuth } from "@/lib/api/auth";
import { createClient } from "@/lib/supabase/server";

interface MonthlySummary {
  month: string;
  categories: Record<string, number>;
  total_income: number;
  total_expense: number;
  net: number;
}

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    // Query transactions with category info, grouped by month
    let query = supabase
      .from("transactions")
      .select(
        `
        amount,
        transacted_date,
        kind,
        category:categories!transactions_category_id_fkey(name)
        `,
      )
      .is("deactivated_at", null);

    if (startDate) {
      query = query.gte("transacted_date", startDate);
    }
    if (endDate) {
      query = query.lte("transacted_date", endDate);
    }

    const { data: transactions, error } = await query;

    if (error) throw error;

    // Aggregate by month and category on the server
    const monthlyData = new Map<
      string,
      {
        categories: Map<string, number>;
        total_income: number;
        total_expense: number;
      }
    >();

    for (const tx of transactions || []) {
      const date = new Date(tx.transacted_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, {
          categories: new Map(),
          total_income: 0,
          total_expense: 0,
        });
      }

      const month = monthlyData.get(monthKey)!;
      const amount = Number(tx.amount) || 0;
      const categoryName =
        (tx.category as { name?: string } | null)?.name ?? "Sem categoria";
      // Track by category
      const currentCategoryAmount = month.categories.get(categoryName) || 0;
      month.categories.set(categoryName, currentCategoryAmount + amount);

      // Track totals
      if (amount > 0) {
        month.total_income += amount;
      } else {
        month.total_expense += Math.abs(amount);
      }
    }

    // Convert to response format
    const summary: MonthlySummary[] = Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month,
        categories: Object.fromEntries(data.categories),
        total_income: data.total_income,
        total_expense: data.total_expense,
        net: data.total_income - data.total_expense,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return createSuccessResponse(summary);
  } catch (error) {
    return createErrorResponse(error);
  }
}
