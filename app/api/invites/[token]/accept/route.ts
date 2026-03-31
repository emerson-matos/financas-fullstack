import { NextRequest } from "next/server";
import { createErrorResponse, createSuccessResponse } from "@/lib/api/handlers";
import { requireAuth } from "@/lib/api/auth";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { userId } = await requireAuth();
    const { token } = await params;

    const supabase = await createClient();

    // Find invite by token
    const { data: invite, error: inviteError } = await supabase
      .from("group_invites")
      .select("id, group_id, role, status, expires_at, email")
      .eq("token", token)
      .single();

    if (inviteError || !invite) {
      return createErrorResponse(new Error("Convite não encontrado"), 404);
    }

    if (invite.status !== "pending") {
      return createErrorResponse(
        new Error("Este convite já foi utilizado ou expirado"),
        400,
      );
    }

    if (new Date(invite.expires_at) < new Date()) {
      await supabase
        .from("group_invites")
        .update({ status: "expired" })
        .eq("id", invite.id);
      return createErrorResponse(new Error("Este convite expirou"), 400);
    }

    // Check if user is already a member
    const { data: existingMembership } = await supabase
      .from("group_memberships")
      .select("id")
      .eq("group_id", invite.group_id)
      .eq("user_id", userId)
      .single();

    if (existingMembership) {
      return createErrorResponse(
        new Error("Você já é membro deste grupo"),
        400,
      );
    }

    // Add user to group
    const { error: memberError } = await supabase
      .from("group_memberships")
      .insert({
        group_id: invite.group_id,
        user_id: userId,
        user_role: invite.role,
      });

    if (memberError) throw memberError;

    // Mark invite as accepted
    await supabase
      .from("group_invites")
      .update({ status: "accepted" })
      .eq("id", invite.id);

    return createSuccessResponse({
      group_id: invite.group_id,
      message: "Convite aceito com sucesso",
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
