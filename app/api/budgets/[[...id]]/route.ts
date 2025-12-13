import { NextRequest, NextResponse } from "next/server";
import { createErrorResponse, createSuccessResponse } from "@/lib/api/handlers";
import { requireAuth } from "@/lib/api/auth";
import { BadRequestAlertException, NotFoundException } from "@/lib/api/errors";
import { update, deleteById } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { BudgetItem } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id?: string[] }> },
) {
  try {
    await requireAuth();
    const resolvedParams = await params;
    const id = resolvedParams?.id?.[0];

    const { searchParams } = new URL(request.url);
    const supabase = await createClient();

    // Single budget by ID with budget_items
    if (id) {
      const { data: budget, error } = await supabase
        .from("budgets")
        .select(
          `
          *,
          budget_items(
            id,
            amount,
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

    // List all budgets with budget_items
    const page = parseInt(searchParams.get("page") || "0");
    const size = parseInt(searchParams.get("size") || "20");
    const sort = searchParams.get("sort") || "start_date,desc";
    const [sortField, sortOrder] = sort.split(",");

    const {
      data: budgets,
      error,
      count,
    } = await supabase
      .from("budgets")
      .select(
        `
        *,
        budget_items(
          id,
          amount,
          category:categories(id, name)
        )
      `,
        { count: "exact" },
      )
      .is("deactivated_at", null)
      .order(sortField || "start_date", { ascending: sortOrder === "desc" })
      .range(page * size, (page + 1) * size - 1);

    if (error) throw error;

    const totalElements = count || 0;
    const totalPages = Math.ceil(totalElements / size);

    return createSuccessResponse({
      content: budgets || [],
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
    await requireAuth();
    const body = await request.json();

    if (!body) {
      throw new BadRequestAlertException(
        "Request body is required",
        "appBudget",
        "invalidrequest",
      );
    }

    const supabase = await createClient();

    // Extract and transform budget_items
    const budgetItems = (body.budget_items as Array<BudgetItem>).map(
      (item) => ({
        category_id: item.category.id,
        amount: item.amount,
      }),
    );

    // Use RPC function to create budget with items in a transaction
    const { data: budgetId, error: rpcError } = await supabase.rpc(
      "create_budget_with_items",
      {
        p_name: body.name,
        p_start_date: body.start_date,
        p_end_date: body.end_date,
        p_is_active: body.is_active ?? true,
        p_budget_items: budgetItems,
      },
    );

    if (rpcError) throw rpcError;

    // Fetch the complete budget with items
    const { data: completeBudget, error: fetchError } = await supabase
      .from("budgets")
      .select(
        `
        *,
        budget_items(
          id,
          amount,
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

export async function PUT(
  request: NextRequest,
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

    const body = await request.json();
    const supabase = await createClient();

    // Extract and transform budget_items
    const budgetItems = (body.budget_items as Array<BudgetItem>).map(
      (item) => ({
        category_id: item.category?.id,
        amount: item.amount,
      }),
    );

    // Use RPC function to update budget with items in a transaction
    const { data: budgetId, error: rpcError } = await supabase.rpc(
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

    if (rpcError) throw rpcError;

    // Fetch the complete budget with items
    const { data: completeBudget, error: fetchError } = await supabase
      .from("budgets")
      .select(
        `
        *,
        budget_items(
          id,
          amount,
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
      updated_by: userId,
    });

    return createSuccessResponse(budget);
  } catch (error) {
    return createErrorResponse(error);
  }
}

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
