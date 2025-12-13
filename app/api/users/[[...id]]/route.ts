import { NextRequest, NextResponse } from "next/server";
import { createErrorResponse, createSuccessResponse } from "@/lib/api/handlers";
import { requireAuth } from "@/lib/api/auth";
import { BadRequestAlertException, NotFoundException } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

/**
 * User routes - now working with auth.users instead of app_users table
 * User data is stored in auth.users and user_metadata
 */

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id?: string[] }> },
) {
  try {
    const { session } = await requireAuth();
    const resolvedParams = await params;
    const id = resolvedParams?.id?.[0];

    // GET /api/users/:id - Only allow fetching own user data
    if (id) {
      if (id !== session.user.id) {
        throw new NotFoundException("User not found", "appAppUser", "notfound");
      }

      const userMetadata = session.user.user_metadata || {};
      return createSuccessResponse({
        id: session.user.id,
        email: session.user.email,
        name: userMetadata.full_name || userMetadata.name || null,
        picture: userMetadata.picture || userMetadata.avatar_url || null,
        onboarding_completed: userMetadata.onboarding_completed || false,
        default_currency: userMetadata.default_currency || null,
        created_at: session.user.created_at,
      });
    }

    // GET /api/users - List users not supported (no admin access)
    throw new BadRequestAlertException(
      "Listing users not supported",
      "appAppUser",
      "notsupported",
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id?: string[] }> },
) {
  try {
    const { session } = await requireAuth();
    const resolvedParams = await params;
    const id = resolvedParams?.id?.[0];
    const supabase = await createClient();

    // Only allow updating own user data
    if (id && id !== session.user.id) {
      throw new BadRequestAlertException(
        "Cannot update other users",
        "appAppUser",
        "unauthorized",
      );
    }

    const body = await request.json();

    // Update user metadata
    const { data, error } = await supabase.auth.updateUser({
      data: {
        ...(body.name && { name: body.name, full_name: body.name }),
        ...(body.default_currency && {
          default_currency: body.default_currency,
        }),
        ...(body.onboarding_completed !== undefined && {
          onboarding_completed: body.onboarding_completed,
        }),
      },
    });

    if (error) {
      throw error;
    }

    const userMetadata = data.user.user_metadata || {};
    return createSuccessResponse({
      id: data.user.id,
      email: data.user.email,
      name: userMetadata.full_name || userMetadata.name || null,
      picture: userMetadata.picture || userMetadata.avatar_url || null,
      onboarding_completed: userMetadata.onboarding_completed || false,
      default_currency: userMetadata.default_currency || null,
      created_at: data.user.created_at,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id?: string[] }> },
) {
  // PATCH works the same as PUT for user metadata
  return PUT(request, { params });
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id?: string[] }> },
) {
  try {
    const { session } = await requireAuth();
    const resolvedParams = await params;
    const id = resolvedParams?.id?.[0];
    const userId = session.user.id;

    // Only allow deleting own account
    if (id && id !== userId) {
      throw new BadRequestAlertException(
        "Cannot delete other users",
        "appAppUser",
        "unauthorized",
      );
    }

    const supabase = await createClient();

    // Soft-delete user data by setting deactivated_at timestamp
    // This preserves referential integrity while marking data as deleted
    const now = new Date().toISOString();

    // 1. Soft-delete all user accounts (which cascades logically to transactions)
    await supabase
      .from("user_accounts")
      .update({ deactivated_at: now })
      .eq("user_id", userId);

    // 2. Soft-delete all budgets
    await supabase
      .from("budgets")
      .update({ deactivated_at: now })
      .eq("user_id", userId);

    // 3. Soft-delete group memberships
    await supabase
      .from("group_memberships")
      .update({ deactivated_at: now })
      .eq("user_id", userId);

    // 4. Mark user as deactivated in metadata
    await supabase.auth.updateUser({
      data: {
        deactivated_at: now,
        name: "Deleted User",
        full_name: "Deleted User",
        picture: null,
      },
    });

    // 5. Sign out the user
    await supabase.auth.signOut();

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return createErrorResponse(error);
  }
}

// POST not supported - users are created via Supabase Auth
export async function POST() {
  return createErrorResponse(
    new BadRequestAlertException(
      "User creation via this endpoint not supported. Use Supabase Auth.",
      "appAppUser",
      "notsupported",
    ),
  );
}
