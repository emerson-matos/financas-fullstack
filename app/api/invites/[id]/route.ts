import { NextRequest, NextResponse } from "next/server";
import { createErrorResponse } from "@/lib/api/handlers";
import { requireAuth } from "@/lib/api/auth";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await requireAuth();
    const { id } = await params;

    const supabase = await createClient();

    // Verify the invite belongs to a group the user admins
    const { data: invite, error: inviteError } = await supabase
      .from("group_invites")
      .select("group_id")
      .eq("id", id)
      .single();

    if (inviteError || !invite) {
      return createErrorResponse(new Error("Convite não encontrado"), 404);
    }

    const { data: membership } = await supabase
      .from("group_memberships")
      .select("user_role")
      .eq("group_id", invite.group_id)
      .eq("user_id", userId)
      .single();

    if (!membership || membership.user_role !== "admin") {
      return createErrorResponse(
        new Error("Apenas administradores podem cancelar convites"),
        403,
      );
    }

    await supabase.from("group_invites").delete().eq("id", id);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return createErrorResponse(error);
  }
}
