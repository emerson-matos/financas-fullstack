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

    // 1. Fetch the proposal to get group_id
    const { data: proposal, error: proposalError } = await supabase
      .from("split_proposals")
      .select("group_id, status")
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
        new Error("Only admins can reject split proposals"),
        403,
      );
    }

    // 3. Update proposal status
    const { error: updateError } = await supabase
      .from("split_proposals")
      .update({ status: "rejected", updated_at: new Date().toISOString() })
      .eq("id", id);

    if (updateError) {
      throw updateError;
    }

    return createSuccessResponse({
      success: true,
      message: "Proposal rejected",
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
