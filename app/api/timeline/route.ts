import { createErrorResponse, createSuccessResponse } from "@/lib/api/handlers";
import { requireAuth } from "@/lib/api/auth";
import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

/**
 * GET /api/timeline - Fetch unified timeline entries
 * Consolidates transactions and activity logs via the unified_timeline view
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;

    const page = parseInt(searchParams.get("page") || "0");
    const size = parseInt(searchParams.get("size") || "20");
    const accountId = searchParams.get("account_id");
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    let query = supabase
      .from("unified_timeline")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("event_time", { ascending: false });

    // Apply filters
    if (accountId) {
      query = query.eq("account_id", accountId);
    }
    if (startDate) {
      query = query.gte("event_time", startDate);
    }
    if (endDate) {
      query = query.lte("event_time", endDate);
    }

    // Pagination
    const from = page * size;
    const to = from + size - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    return createSuccessResponse({
      content: data || [],
      page: {
        number: page,
        size: size,
        total_elements: count || 0,
        total_pages: Math.ceil((count || 0) / size),
      },
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
