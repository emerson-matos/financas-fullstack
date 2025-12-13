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
      const data = await findById("transaction_categorization_jobs", id);
      if (!data) {
        throw new NotFoundException(
          "Categorization Job not found",
          "appCategorizationJob",
          "notfound",
        );
      }
      return createSuccessResponse(data);
    }

    const page = parseInt(searchParams.get("page") || "0");
    const size = parseInt(searchParams.get("size") || "20");
    const sort = searchParams.get("sort") || "id";
    const [sortField, sortOrder] = sort.split(",");

    const data = await paginate("transaction_categorization_jobs", {
      page,
      size,
      sort: sortField,
      order: (sortOrder as "asc" | "desc") || "asc",
    });

    return createSuccessResponse(data);
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
        "appCategorizationJob",
        "invalidrequest",
      );
    }

    const data = await create("transaction_categorization_jobs", {
      ...body,
      user_id: userId,
      created_by: userId,
    });

    return createSuccessResponse(data, 201);
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
        "Categorization Job ID is required",
        "appCategorizationJob",
        "idrequired",
      );
    }

    const body = await request.json();
    const data = await update("transaction_categorization_jobs", id, {
      ...body,
      updated_by: userId,
    });

    return createSuccessResponse(data);
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
        "Categorization Job ID is required",
        "appCategorizationJob",
        "idrequired",
      );
    }

    await deleteById("transaction_categorization_jobs", id);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return createErrorResponse(error);
  }
}
