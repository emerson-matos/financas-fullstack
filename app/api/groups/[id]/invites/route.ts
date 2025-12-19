import { createErrorResponse, createSuccessResponse } from "@/lib/api/handlers";
import { requireAuth } from "@/lib/api/auth";
import { BadRequestAlertException } from "@/lib/api/errors";
import { paginate, create } from "@/lib/supabase/queries";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth();
    const { id: groupId } = await params;

    if (!groupId) {
      throw new BadRequestAlertException(
        "Group ID is required",
        "groupInvites",
        "groupIdRequired",
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const size = parseInt(searchParams.get("size") || "20");

    const result = await paginate("group_invites", {
      group_id: groupId,
      page,
      size,
    });

    return createSuccessResponse(result);
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth();
    const { id: groupId } = await params;

    if (!groupId) {
      throw new BadRequestAlertException(
        "Group ID is required",
        "groupInvites",
        "groupIdRequired",
      );
    }

    const body = await request.json();
    if (!body || !body.email) {
      throw new BadRequestAlertException(
        "Email is required",
        "groupInvites",
        "emailRequired",
      );
    }

    const invite = await create("group_invites", {
      group_id: groupId,
      email: body.email,
      role: body.role || "member",
      token: crypto.randomUUID(),
      status: "pending",
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    });

    return createSuccessResponse(invite, 201);
  } catch (error) {
    return createErrorResponse(error);
  }
}
