import { createErrorResponse, createSuccessResponse } from "@/lib/api/handlers";
import { requireAuth } from "@/lib/api/auth";
import { createClient } from "@/lib/supabase/server";

/**
 * PUT /api/users/complete-onboarding - Mark current user's onboarding as complete
 * Updates user_metadata in auth.users
 */
export async function PUT() {
  try {
    await requireAuth();
    const supabase = await createClient();

    // Update user metadata to mark onboarding as complete
    const { data, error } = await supabase.auth.updateUser({
      data: {
        onboarding_completed: true,
      },
    });

    if (error) {
      throw error;
    }

    // Return updated user info
    const userMetadata = data.user.user_metadata || {};
    return createSuccessResponse({
      id: data.user.id,
      email: data.user.email,
      name: userMetadata.full_name || userMetadata.name || null,
      onboarding_completed: true,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
