import { NextRequest, NextResponse } from "next/server";
import { createErrorResponse, createSuccessResponse } from "@/lib/api/handlers";
import { requireAuth } from "@/lib/api/auth";
import { BadRequestAlertException, NotFoundException } from "@/lib/api/errors";
import { deleteById, update } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import type { BudgetItemInput } from "@/lib/types";

/* ============================================================================
 * GET
 * ========================================================================== */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id?: string[] }> },
) {
  try {
    await requireAuth();
    const supabase = await createClient();

    const resolvedParams = await params;
    const id = resolvedParams?.id?.[0];

    const { searchParams } = new URL(request.url);

    /* ----------------------------------------------------------------------
     * Single budget
     * -------------------------------------------------------------------- */
    if (id) {
      const { data: budget, error } = await supabase
        .from("budgets")
        .select(
          `
          *,
          budget_items:budget_items_with_spent(
            id,
            amount:planned,
            spent,
            category:categories(id, name)
          )
        `,
        )
        .eq("id", id)
        .single();

      if (error || !budget) {
        throw new NotFoundException(
          "Budget not found",
          "appBudget",
          "notfound",
        );
      }

      return createSuccessResponse(budget);
    }

    /* ----------------------------------------------------------------------
     * List budgets (paged)
     * -------------------------------------------------------------------- */
    const page = Number(searchParams.get("page") ?? 0);
    const size = Number(searchParams.get("size") ?? 20);
    const sort = searchParams.get("sort") ?? "start_date,desc";
    const [sortField, sortOrder] = sort.split(",");

    const { data, error, count } = await supabase
      .from("budgets")
      .select(
        `
        *,
        budget_items:budget_items_with_spent(
          id,
          amount:planned,
          spent,
          category:categories(id, name)
        )
      `,
        { count: "exact" },
      )
      .is("deactivated_at", null)
      .order(sortField || "start_date", {
        ascending: sortOrder === "asc",
      })
      .range(page * size, page * size + size - 1);

    if (error) throw error;

    return createSuccessResponse({
      content: data ?? [],
      page: {
        number: page,
        size,
        total_elements: count ?? 0,
        total_pages: Math.ceil((count ?? 0) / size),
      },
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}

/* ============================================================================
 * POST
 * ========================================================================== */

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const supabase = await createClient();

    const body = await request.json();
    if (!body) {
      throw new BadRequestAlertException(
        "Request body is required",
        "appBudget",
        "invalidrequest",
      );
    }

    const budgetItems = (body.budget_items as BudgetItemInput[]).map(
      (item) => ({
        category_id: item.category.id,
        amount: item.amount,
      }),
    );

    const { data: budgetId, error } = await supabase.rpc(
      "create_budget_with_items",
      {
        p_name: body.name,
        p_start_date: body.start_date,
        p_end_date: body.end_date,
        p_is_active: body.is_active ?? true,
        p_budget_items: budgetItems,
      },
    );

    if (error) throw error;

    const { data: completeBudget, error: fetchError } = await supabase
      .from("budgets")
      .select(
        `
        *,
        budget_items:budget_items_with_spent(
          id,
          amount:planned,
          spent,
          category:categories(id, name)
        )
      `,
      )
      .eq("id", budgetId)
      .single();

    if (fetchError) throw fetchError;

    return createSuccessResponse(completeBudget, 201);
  } catch (error) {
    return createErrorResponse(error);
  }
}

/* ============================================================================
 * PUT
 * ========================================================================== */

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id?: string[] }> },
) {
  try {
    await requireAuth();
    const supabase = await createClient();

    const resolvedParams = await params;
    const id = resolvedParams?.id?.[0];

    if (!id) {
      throw new BadRequestAlertException(
        "Budget ID is required",
        "appBudget",
        "idrequired",
      );
    }

    const body = await request.json();

    const budgetItems = (body.budget_items as BudgetItemInput[]).map(
      (item) => ({
        category_id: item.category.id,
        amount: item.amount,
      }),
    );

    const { data: budgetId, error } = await supabase.rpc(
      "update_budget_with_items",
      {
        p_budget_id: id,
        p_name: body.name,
        p_start_date: body.start_date,
        p_end_date: body.end_date,
        p_is_active: body.is_active ?? true,
        p_budget_items: budgetItems,
      },
    );

    if (error) throw error;

    const { data: completeBudget, error: fetchError } = await supabase
      .from("budgets")
      .select(
        `
        *,
        budget_items:budget_items_with_spent(
          id,
          amount:planned,
          spent,
          category:categories(id, name)
        )
      `,
      )
      .eq("id", budgetId)
      .single();

    if (fetchError) throw fetchError;

    return createSuccessResponse(completeBudget);
  } catch (error) {
    return createErrorResponse(error);
  }
}

/* ============================================================================
 * PATCH
 * ========================================================================== */

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
        "Budget ID is required",
        "appBudget",
        "idrequired",
      );
    }

    const body = await request.json();

    const budget = await update("budgets", id, {
      ...body,
      last_modified_by: userId,
    });

    return createSuccessResponse(budget);
  } catch (error) {
    return createErrorResponse(error);
  }
}

/* ============================================================================
 * DELETE
 * ========================================================================== */

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id?: string[] }> },
) {
  try {
    await requireAuth();

    const resolvedParams = await params;
    const id = resolvedParams?.id?.[0];

    if (!id) {
      throw new BadRequestAlertException(
        "Budget ID is required",
        "appBudget",
        "idrequired",
      );
    }

    await deleteById("budgets", id);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return createErrorResponse(error);
  }
}
