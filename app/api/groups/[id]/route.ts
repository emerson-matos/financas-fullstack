import { NextRequest, NextResponse } from "next/server";
import { createErrorResponse, createSuccessResponse } from "@/lib/api/handlers";
import { requireAuth } from "@/lib/api/auth";
import { BadRequestAlertException, NotFoundException } from "@/lib/api/errors";
import { update, deleteById } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth();
    const { id } = await params;

    if (!id) {
      throw new BadRequestAlertException(
        "Group ID is required",
        "appGroups",
        "idrequired",
      );
    }

    const supabase = await createClient();
    const { data: group, error } = await supabase
      .from("app_groups")
      .select(
        `
        *,
        members:group_memberships(
          id,
          user_id,
          user_role
        )
      `,
      )
      .eq("id", id)
      .single();

    if (error || !group) {
      if (error && error.code !== "PGRST116") {
        throw error;
      }
      throw new NotFoundException("Group not found", "appGroups", "notfound");
    }

    return createSuccessResponse({ ...group });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await requireAuth();
    const { id } = await params;

    if (!id) {
      throw new BadRequestAlertException(
        "Group ID is required",
        "appGroups",
        "idrequired",
      );
    }

    const body = await request.json();
    const group = await update("app_groups", id, {
      ...body,
      updated_by: userId,
    });

    return createSuccessResponse(group);
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await requireAuth();
    const { id } = await params;

    if (!id) {
      throw new BadRequestAlertException(
        "Group ID is required",
        "appGroups",
        "idrequired",
      );
    }

    const body = await request.json();
    const group = await update("app_groups", id, {
      ...body,
      updated_by: userId,
    });

    return createSuccessResponse(group);
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth();
    const { id } = await params;

    if (!id) {
      throw new BadRequestAlertException(
        "Group ID is required",
        "appGroups",
        "idrequired",
      );
    }

    await deleteById("app_groups", id);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return createErrorResponse(error);
  }
}
