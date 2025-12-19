import { NextRequest } from "next/server";
import { createErrorResponse, createSuccessResponse } from "@/lib/api/handlers";
import { requireAuth } from "@/lib/api/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const supabase = await createClient();

    // Fetch all user accounts with their dynamic balances from the view
    const { data: accounts, error } = await supabase
      .from("user_accounts_with_balance")
      .select("current_amount")
      .eq("user_id", userId)
      .is("deactivated_at", null);

    if (error) {
      throw error;
    }

    let totalAssets = 0;
    let totalLiabilities = 0;

    accounts?.forEach((account) => {
      const amount = Number(account.current_amount) || 0;
      if (amount >= 0) {
        totalAssets += amount;
      } else {
        totalLiabilities += Math.abs(amount);
      }
    });

    const netWorth = totalAssets - totalLiabilities;
    const currentYear = new Date().getFullYear();

    // For now, we return a single data point representing the current state
    return createSuccessResponse({
      years: [currentYear],
      data: [
        {
          year: currentYear,
          assets: totalAssets,
          liabilities: totalLiabilities,
          net_worth: netWorth,
        },
      ],
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
