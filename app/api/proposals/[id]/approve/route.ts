import { NextRequest } from "next/server";
import { createErrorResponse, createSuccessResponse } from "@/lib/api/handlers";
import { requireAuth } from "@/lib/api/auth";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await requireAuth();
    const { id } = await params;

    const supabase = await createClient();

    // 1. Fetch the proposal to get group_id and transaction_id
    const { data: proposal, error: proposalError } = await supabase
      .from("split_proposals")
      .select("group_id, transaction_id, split_rules, status")
      .eq("id", id)
      .single();

    if (proposalError || !proposal) {
      return createErrorResponse(new Error("Proposal not found"), 404);
    }

    if (proposal.status !== "pending") {
      return createErrorResponse(new Error("Proposal is not pending"), 400);
    }

    // 2. Authorization: Check if user is ADMIN of the group
    const { data: membership, error: membershipError } = await supabase
      .from("group_members")
      .select("role")
      .eq("group_id", proposal.group_id)
      .eq("user_id", userId)
      .single();

    if (membershipError || !membership || membership.role !== "admin") {
      return createErrorResponse(
        new Error("Only admins can approve split proposals"),
        403,
      );
    }

    // 3. Perform Approval Transaction
    // We update proposal status and create member_debts
    // For supabase, we can do this in separate calls or a function if strict atomicity is needed.
    // Given the current setup, we'll do series of operations.

    // Parse split rules to get debts
    // split_rules is expected to be { splits: [{ userId: string, amount: number }] }
    // or simply the array if stored directly. Let's assume the structure from creation.

    const rules = proposal.split_rules as any;
    const splits = Array.isArray(rules) ? rules : rules?.splits || [];

    if (!Array.isArray(splits) || splits.length === 0) {
      // Just approve without debts? Or error?
      // Let's mark approved.
    } else {
      const debtsToInsert = splits.map((split: any) => ({
        proposal_id: id,
        user_id: split.userId,
        amount: split.amount,
        status: "unpaid",
      }));

      const { error: debtsError } = await supabase
        .from("member_debts")
        .insert(debtsToInsert);

      if (debtsError) {
        throw debtsError;
      }
    }

    // Update proposal status
    const { error: updateError } = await supabase
      .from("split_proposals")
      .update({ status: "approved", updated_at: new Date().toISOString() })
      .eq("id", id);

    if (updateError) {
      throw updateError;
    }

    return createSuccessResponse({
      success: true,
      message: "Proposal approved",
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
