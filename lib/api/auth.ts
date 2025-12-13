import { createClient } from "@/lib/supabase/server";
import { UnauthorizedException } from "./errors";
import type { Session } from "@supabase/supabase-js";

export interface AuthResult {
  userId: string;
  session: Session;
}

/**
 * Validates the user's authentication status for API routes.
 *
 * Note: The middleware already protects /api routes, but this function
 * provides access to the user data within the route handler.
 *
 * @param request - The incoming Next.js request
 * @returns The authenticated user's ID, user object, and session
 * @throws UnauthorizedException if not authenticated
 */
export async function requireAuth(): Promise<AuthResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new UnauthorizedException("Authentication required");
  }

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    throw new UnauthorizedException("Authentication required");
  }

  return {
    userId: user.id,
    session,
  };
}

/**
 * Optional auth check - returns null if not authenticated instead of throwing
 */
export async function getAuthOptional(): Promise<AuthResult | null> {
  try {
    return await requireAuth();
  } catch {
    return null;
  }
}
