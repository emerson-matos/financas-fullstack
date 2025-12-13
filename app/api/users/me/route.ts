import { createErrorResponse, createSuccessResponse } from "@/lib/api/handlers";
import { requireAuth } from "@/lib/api/auth";
import type { AppUserBackend } from "@/lib/types";

/**
 * GET /api/users/me - Get current user from Supabase auth
 * User data is stored in auth.users and user_metadata
 */
export async function GET() {
  try {
    const { session } = await requireAuth();
    const { user } = session;

    // Extract user info from Supabase auth metadata
    const userMetadata = user.user_metadata || {};

    // Extract avatar from various OAuth providers
    // Google: picture, GitHub: avatar_url
    const picture = userMetadata.picture || userMetadata.avatar_url || null;

    // Build user object from auth.users data
    const appUser: AppUserBackend = {
      id: user.id,
      email: user.email || "",
      name: userMetadata.full_name || userMetadata.name || null,
      picture,
      onboarding_completed: userMetadata.onboarding_completed || false,
      default_currency: userMetadata.default_currency || null,
      created_at: user.created_at,
    };

    return createSuccessResponse(appUser);
  } catch (error) {
    return createErrorResponse(error);
  }
}
