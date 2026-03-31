import { createErrorResponse, createSuccessResponse } from "@/lib/api/handlers";
import { requireAuth } from "@/lib/api/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    await requireAuth();

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return createErrorResponse(new Error("Usuário não autenticado"), 401);
    }

    const { data: invites, error } = await supabase
      .from("group_invites")
      .select("id, token, role, expires_at, status, group:groups(id, name, description)")
      .eq("email", user.email)
      .eq("status", "pending");

    if (error) throw error;

    return createSuccessResponse(invites ?? []);
  } catch (error) {
    return createErrorResponse(error);
  }
}
