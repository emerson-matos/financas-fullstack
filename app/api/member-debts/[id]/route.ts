import type { NextRequest } from "next/server";
import { createErrorResponse, createSuccessResponse } from "@/lib/api/handlers";
import { requireAuth } from "@/lib/api/auth";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await requireAuth();
    const { id } = await params;

    const supabase = await createClient();

    const { data: debt, error: debtError } = await supabase
      .from("member_debts")
      .select(
        `
        id,
        proposal_id,
        proposal:split_proposals(
          id,
          group_id,
          transaction:transactions(user_id)
        )
      `,
      )
      .eq("id", id)
      .single();

    if (debtError || !debt) {
      return createErrorResponse(new Error("Debt not found"), 404);
    }

    const proposal = (debt as unknown as {
      proposal: {
        id: string;
        group_id: string;
        transaction: { user_id: string } | null;
      } | null;
    }).proposal;

    const groupId = proposal?.group_id;
    const transactionCreatorId = proposal?.transaction?.user_id;

    let authorized = userId === transactionCreatorId;

    if (!authorized && groupId) {
      const { data: membership } = await supabase
        .from("group_memberships")
        .select("user_role")
        .eq("group_id", groupId)
        .eq("user_id", userId)
        .single();

      authorized = membership?.user_role === "admin";
    }

    if (!authorized) {
      return createErrorResponse(new Error("Unauthorized"), 403);
    }

    const { data: updated, error: updateError } = await supabase
      .from("member_debts")
      .update({ status: "paid", settled_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;

    return createSuccessResponse(updated);
  } catch (error) {
    return createErrorResponse(error);
  }
}
