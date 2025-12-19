import { NextRequest, NextResponse } from "next/server";
import { createErrorResponse, createSuccessResponse } from "@/lib/api/handlers";
import { requireAuth } from "@/lib/api/auth";
import { BadRequestAlertException, NotFoundException } from "@/lib/api/errors";
import { create, update, deleteById } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id?: string[] }> },
) {
  try {
    await requireAuth();
    const resolvedParams = await params;
    const id = resolvedParams?.id?.[0];
    const supabase = await createClient();

    // GET /api/recurring-templates/:id
    if (id) {
      const { data: template, error } = await supabase
        .from("recurring_templates")
        .select(
          `
          *,
          account:user_accounts(id, identification, currency, kind),
          category:categories(id, name)
        `,
        )
        .eq("id", id)
        .single();

      if (error || !template) {
        throw new NotFoundException(
          "Recurring template not found",
          "appRecurringTemplate",
          "notfound",
        );
      }
      return createSuccessResponse(template);
    }

    // GET /api/recurring-templates with pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const size = parseInt(searchParams.get("size") || "20");
    const sort = searchParams.get("sort") || "created_at,desc";
    const [sortField, sortOrder] = sort.split(",");

    const {
      data: templates,
      error,
      count,
    } = await supabase
      .from("recurring_templates")
      .select(
        `
        *,
        account:user_accounts(id, identification, currency, kind),
        category:categories(id, name)
      `,
        { count: "exact" },
      )
      .order(sortField || "created_at", { ascending: sortOrder === "asc" })
      .range(page * size, (page + 1) * size - 1);

    if (error) throw error;

    const totalElements = count || 0;
    const totalPages = Math.ceil(totalElements / size);

    return createSuccessResponse({
      content: templates || [],
      page: {
        size,
        total_elements: totalElements,
        total_pages: totalPages,
        number: page,
      },
    });
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
        "appRecurringTemplate",
        "invalidrequest",
      );
    }

    // Map camelCase from frontend to snake_case for DB if needed,
    // but the generic create helper handles it if we pass it correctly.
    // The previous implementation of recurring generation logic uses snake_case fields.

    const templateData = {
      user_id: userId,
      account_id: body.accountId,
      category_id: body.categoryId || null,
      amount: body.amount,
      currency: body.currency,
      name: body.name,
      description: body.description,
      kind: body.kind,
      recurrence_rule: body.recurrenceRule,
      next_occurrence: body.nextOccurrence,
      is_active: body.isActive !== undefined ? body.isActive : true,
      created_by: userId,
    };

    const template = await create("recurring_templates", templateData);

    return createSuccessResponse(template, 201);
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
        "Template ID is required",
        "appRecurringTemplate",
        "idrequired",
      );
    }

    const body = await request.json();

    const updateData: any = {
      last_modified_by: userId,
    };

    // Map fields
    if (body.accountId) updateData.account_id = body.accountId;
    if (body.categoryId !== undefined) updateData.category_id = body.categoryId;
    if (body.amount !== undefined) updateData.amount = body.amount;
    if (body.currency) updateData.currency = body.currency;
    if (body.name) updateData.name = body.name;
    if (body.description !== undefined)
      updateData.description = body.description;
    if (body.kind) updateData.kind = body.kind;
    if (body.recurrenceRule) updateData.recurrence_rule = body.recurrenceRule;
    if (body.nextOccurrence) updateData.next_occurrence = body.nextOccurrence;
    if (body.isActive !== undefined) updateData.is_active = body.isActive;

    const template = await update("recurring_templates", id, updateData);

    return createSuccessResponse(template);
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
        "Template ID is required",
        "appRecurringTemplate",
        "idrequired",
      );
    }

    await deleteById("recurring_templates", id);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return createErrorResponse(error);
  }
}
