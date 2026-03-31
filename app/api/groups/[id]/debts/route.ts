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
        new Error("Unauthorized access to group debts"),
        403,
      );
    }

    const { data: proposals, error: proposalsError } = await supabase
      .from("split_proposals")
      .select("id")
      .eq("group_id", id);

    if (proposalsError) throw proposalsError;

    const proposalIds = (proposals ?? []).map((p) => p.id);

    if (proposalIds.length === 0) {
      return createSuccessResponse({ content: [] });
    }

    const { data, error } = await supabase
      .from("member_debts")
      .select(
        `
        id,
        user_id,
        amount,
        status,
        settled_at,
        created_at,
        proposal:split_proposals(
          id,
          status,
          transaction:transactions(name, amount, currency)
        ),
        debtor:user_profiles(name, email)
      `,
      )
      .in("proposal_id", proposalIds);

    if (error) throw error;

    return createSuccessResponse({ content: data ?? [] });
  } catch (error) {
    return createErrorResponse(error);
  }
}
