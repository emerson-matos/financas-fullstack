import { NextRequest } from "next/server";
import { createErrorResponse, createSuccessResponse } from "@/lib/api/handlers";
import { requireAuth } from "@/lib/api/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const { searchParams } = new URL(request.url);

    // Extract report parameters
    const reportType = searchParams.get("type") || "summary";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const supabase = await createClient();

    if (reportType === "summary") {
      let query = supabase
        .from("transactions")
        .select("amount")
        .eq("user_id", userId);

      if (startDate) {
        query = query.gte("transacted_date", startDate);
      }
      if (endDate) {
        query = query.lte("transacted_date", endDate);
      }

      const { data: transactions, error } = await query;

      if (error) {
        throw error;
      }

      const income = transactions
        .filter((t) => t.amount > 0)
        .reduce((acc, t) => acc + t.amount, 0);
      const expenses = transactions
        .filter((t) => t.amount < 0)
        .reduce((acc, t) => acc + t.amount, 0);

      const summary = {
        income,
        expenses: Math.abs(expenses),
        net: income - Math.abs(expenses),
      };

      return createSuccessResponse(summary);
    }

    return createSuccessResponse({
      message: "Report type not implemented",
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const body = await request.json();

    // TODO: Implement custom report creation with Supabase
    const data = {
      userId,
      ...body,
      message: "Custom report creation not yet implemented",
    };

    return createSuccessResponse(data, 201);
  } catch (error) {
    return createErrorResponse(error);
  }
}
