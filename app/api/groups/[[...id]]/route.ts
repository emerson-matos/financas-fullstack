import { NextRequest, NextResponse } from "next/server";
import { createErrorResponse, createSuccessResponse } from "@/lib/api/handlers";
import { requireAuth } from "@/lib/api/auth";
import { BadRequestAlertException, NotFoundException } from "@/lib/api/errors";
import {
  paginate,
  findById,
  create,
  update,
  deleteById,
} from "@/lib/supabase/queries";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id?: string[] }> },
) {
  try {
    await requireAuth();
    const resolvedParams = await params;
    const id = resolvedParams?.id?.[0];

    const { searchParams } = new URL(request.url);

    if (id) {
      const group = await findById("app_groups", id);
      if (!group) {
        throw new NotFoundException("Group not found", "appGroups", "notfound");
      }
      return createSuccessResponse(group);
    }

    const page = parseInt(searchParams.get("page") || "0");
    const size = parseInt(searchParams.get("size") || "20");
    const sort = searchParams.get("sort") || "id,asc";

    const result = await paginate("app_groups", {
      page,
      size,
      sort,
    });

    return createSuccessResponse(result);
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const body = await request.json();

    if (!body) {
      throw new BadRequestAlertException(
        "Request body is required",
        "appGroups",
        "invalidrequest",
      );
    }

    const group = await create("app_groups", {
      ...body,
      created_by: userId,
    });

    return createSuccessResponse(group, 201);
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id?: string[] }> },
) {
  try {
    const { userId } = await requireAuth();
    const resolvedParams = await params;
    const id = resolvedParams?.id?.[0];

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
  { params }: { params: Promise<{ id?: string[] }> },
) {
  try {
    const { userId } = await requireAuth();
    const resolvedParams = await params;
    const id = resolvedParams?.id?.[0];

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
  { params }: { params: Promise<{ id?: string[] }> },
) {
  try {
    await requireAuth();
    const resolvedParams = await params;
    const id = resolvedParams?.id?.[0];

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
