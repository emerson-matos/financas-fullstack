import { NextRequest } from "next/server";
import { createErrorResponse, createSuccessResponse } from "@/lib/api/handlers";
import { requireAuth } from "@/lib/api/auth";
import { BadRequestAlertException } from "@/lib/api/errors";
import { paginate, create } from "@/lib/supabase/queries";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);

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
