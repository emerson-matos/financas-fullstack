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

type RouteParams = {
  id?: string[];
};

type FilterValue = string | number | boolean;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> },
) {
  try {
    await requireAuth();

    const resolvedParams = await params;
    const id = resolvedParams.id?.[0];

    const { searchParams } = new URL(request.url);

    /* -------------------------------------------------------------
     * GET /api/categories/:id
     * ------------------------------------------------------------- */
    if (id) {
      const category = await findById("categories", id);

      if (!category) {
        throw new NotFoundException(
          "Category not found",
          "appCategory",
          "notfound",
        );
      }

      return createSuccessResponse(category);
    }

    /* -------------------------------------------------------------
     * GET /api/categories (paginated)
     * ------------------------------------------------------------- */
    const page = Number.parseInt(searchParams.get("page") ?? "0", 10);
    const size = Number.parseInt(searchParams.get("size") ?? "20", 10);
    const sort = searchParams.get("sort") ?? "id,asc";

    const filters: Record<string, FilterValue> = {};

    searchParams.forEach((value, key) => {
      if (!["page", "size", "sort"].includes(key)) {
        filters[key] = value;
      }
    });

    const result = await paginate("categories", {
      page,
      size,
      sort,
      ...filters,
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
        "appCategory",
        "invalidrequest",
      );
    }

    const category = await create("categories", {
      ...body,
      created_by: userId,
    });

    return createSuccessResponse(category, 201);
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> },
) {
  try {
    const { userId } = await requireAuth();
    const resolvedParams = await params;
    const id = resolvedParams.id?.[0];

    if (!id) {
      throw new BadRequestAlertException(
        "Category ID is required",
        "appCategory",
        "idrequired",
      );
    }

    const body = await request.json();

    const category = await update("categories", id, {
      ...body,
      updated_by: userId,
    });

    return createSuccessResponse(category);
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> },
) {
  try {
    const { userId } = await requireAuth();
    const resolvedParams = await params;
    const id = resolvedParams.id?.[0];

    if (!id) {
      throw new BadRequestAlertException(
        "Category ID is required",
        "appCategory",
        "idrequired",
      );
    }

    const body = await request.json();

    const category = await update("categories", id, {
      ...body,
      updated_by: userId,
    });

    return createSuccessResponse(category);
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<RouteParams> },
) {
  try {
    await requireAuth();

    const resolvedParams = await params;
    const id = resolvedParams.id?.[0];

    if (!id) {
      throw new BadRequestAlertException(
        "Category ID is required",
        "appCategory",
        "idrequired",
      );
    }

    await deleteById("categories", id);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return createErrorResponse(error);
  }
}
