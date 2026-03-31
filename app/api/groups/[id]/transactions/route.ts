import { NextRequest } from "next/server";
import { createErrorResponse, createSuccessResponse } from "@/lib/api/handlers";
import { requireAuth } from "@/lib/api/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await requireAuth();
    const { id } = await params;

    const supabase = await createClient();

    const { data: membership, error: membershipError } = await supabase
      .from("group_memberships")
      .select("user_role")
      .eq("group_id", id)
      .eq("user_id", userId)
      .single();

    if (membershipError || !membership) {
      return createErrorResponse(
        new Error("Unauthorized access to group transactions"),
        403,
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const size = parseInt(searchParams.get("size") || "20");

    const from = page * size;
    const to = from + size - 1;

    const { data, count, error } = await supabase
      .from("transactions")
      .select(
        "id, name, amount, currency, transacted_at, split_proposals(id, status)",
        { count: "exact" },
      )
      .eq("group_id", id)
      .order("transacted_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    const transactions = (data ?? []).map((tx) => {
      const proposals = (tx as unknown as { split_proposals: Array<{ id: string; status: string }> }).split_proposals;
      return {
        id: tx.id,
        name: tx.name,
        amount: tx.amount,
        currency: tx.currency,
        transacted_at: tx.transacted_at,
        proposal: proposals?.[0] ?? null,
      };
    });

    const totalElements = count ?? 0;
    const totalPages = Math.ceil(totalElements / size);

    return createSuccessResponse({
      content: transactions,
      totalElements,
      totalPages,
      currentPage: page,
      pageSize: size,
      hasNext: page < totalPages - 1,
      hasPrevious: page > 0,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
