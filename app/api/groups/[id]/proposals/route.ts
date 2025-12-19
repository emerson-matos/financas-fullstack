import { NextRequest, NextResponse } from "next/server";
import { createErrorResponse, createSuccessResponse } from "@/lib/api/handlers";
import { requireAuth } from "@/lib/api/auth";
import { paginate } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await requireAuth();
    const { id } = await params;

    // Authorization: Check if user is member of the group
    const supabase = await createClient();
    const { data: membership, error: membershipError } = await supabase
      .from("group_memberships")
      .select("user_role")
      .eq("group_id", id)
      .eq("user_id", userId)
      .single();

    if (membershipError || !membership) {
      return createErrorResponse(
        new Error("Unauthorized access to group proposals"),
        403,
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const size = parseInt(searchParams.get("size") || "20");
    const sort = searchParams.get("sort") || "created_at,desc";
    const status = searchParams.get("status");

    const filters: Record<string, unknown> = {
      group_id: id,
    };

    if (status) {
      filters.status = status;
    }

    // We can join transaction to show details
    const result = await paginate("split_proposals", {
      page,
      size,
      sort,
      filters,
      select:
        "*, transaction:transactions(id, name, amount, currency, transacted_at)",
    });

    return createSuccessResponse(result);
  } catch (error) {
    return createErrorResponse(error);
  }
}
