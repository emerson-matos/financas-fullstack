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

    // GET /api/transactions/:id
    if (id) {
      const { data: transaction, error } = await supabase
        .from("transactions")
        .select(
          `
          *,
          account:user_accounts(id, identification, currency, kind),
          category:categories(id, name)
        `,
        )
        .eq("id", id)
        .single();

      if (error || !transaction) {
        throw new NotFoundException(
          "Transaction not found",
          "appTransaction",
          "notfound",
        );
      }
      return createSuccessResponse(transaction);
    }

    // GET /api/transactions with pagination and filtering
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const size = parseInt(searchParams.get("size") || "20");
    const sort = searchParams.get("sort") || "transacted_at,desc";
    const [sortField, sortOrder] = sort.split(",");

    // Build query with joins
    let query = supabase
      .from("transactions")
      .select(
        `
        *,
        account:user_accounts(id, identification, currency, kind),
        category:categories(id, name)
      `,
        { count: "exact" },
      )
      .is("deactivated_at", null);

    // Handle date range filters
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");
    const accountId = searchParams.get("account_id");

    if (startDate) {
      query = query.gte("transacted_at", startDate);
    }
    if (endDate) {
      query = query.lte("transacted_at", endDate);
    }
    if (accountId) {
      query = query.eq("account_id", accountId);
    }

    // Apply sorting and pagination
    query = query
      .order(sortField || "transacted_at", { ascending: sortOrder === "asc" })
      .range(page * size, (page + 1) * size - 1);

    const { data: transactions, error, count } = await query;

    if (error) throw error;

    const totalElements = count || 0;
    const totalPages = Math.ceil(totalElements / size);

    return createSuccessResponse({
      content: transactions || [],
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
        "appTransaction",
        "invalidrequest",
      );
    }

    // Handle TRANSFER transactions: create two linked transactions
    if (body.kind === "TRANSFER" && body.destination_account?.id) {
      const amount = Math.abs(Number(body.amount) || 0);
      const destinationAccountId = body.destination_account.id;
      const sourceAccountId = body.account?.id;

      if (!sourceAccountId) {
        throw new BadRequestAlertException(
          "Source account is required for transfer",
          "appTransaction",
          "invalidrequest",
        );
      }

      // Create outgoing transaction (negative amount from source account)
      const outgoingTransaction = await create("transactions", {
        name: body.name,
        description: body.description || `Transfer to ${destinationAccountId}`,
        currency: body.currency || "BRL",
        kind: "TRANSFER",
        transacted_at: body.transacted_at || new Date().toISOString(),
        amount: -amount, // Negative: money leaving source account
        account_id: sourceAccountId,
        category_id: null, // Transfers don't have a category
        created_by: userId,
      });

      // Create incoming transaction (positive amount to destination account)
      const incomingTransaction = await create("transactions", {
        name: body.name,
        description: body.description || `Transfer from ${sourceAccountId}`,
        currency: body.currency || "BRL",
        kind: "TRANSFER",
        transacted_at: body.transacted_at || new Date().toISOString(),
        amount: amount, // Positive: money entering destination account
        account_id: destinationAccountId,
        category_id: null, // Transfers don't have a category
        created_by: userId,
        related_transaction_id: outgoingTransaction.id,
      });

      // Update outgoing transaction with related_transaction_id
      await update("transactions", outgoingTransaction.id, {
        related_transaction_id: incomingTransaction.id,
        last_modified_by: userId,
      });

      // Return the outgoing transaction (primary transaction)
      return createSuccessResponse(outgoingTransaction, 201);
    }

    // Regular DEBIT/CREDIT transaction handling
    // Ensure amount sign matches kind: DEBIT = negative, CREDIT = positive
    let amount = Number(body.amount) || 0;
    if (body.kind === "DEBIT" && amount > 0) {
      amount = -amount;
    } else if (body.kind === "CREDIT" && amount < 0) {
      amount = Math.abs(amount);
    }

    const transaction = await create("transactions", {
      name: body.name,
      description: body.description,
      currency: body.currency || "BRL",
      kind: body.kind,
      transacted_at: body.transacted_at || new Date().toISOString(),
      amount,
      account_id: body.account?.id,
      category_id: body.category?.id || null,
      created_by: userId,
      group_id: body.group_id || null,
    });

    if (body.split_proposal && body.group_id) {
      await create("split_proposals", {
        transaction_id: transaction.id,
        group_id: body.group_id,
        split_rules: body.split_proposal.split_rules,
        status: "pending",
        created_by: userId,
      });
    }

    return createSuccessResponse(transaction, 201);
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
        "Transaction ID is required",
        "appTransaction",
        "idrequired",
      );
    }

    const body = await request.json();

    // Ensure amount sign matches kind if both are provided
    const updateData = { ...body };
    if (body.amount !== undefined && body.kind) {
      let amount = Number(body.amount) || 0;
      if (body.kind === "DEBIT" && amount > 0) {
        amount = -amount;
      } else if (body.kind === "CREDIT" && amount < 0) {
        amount = Math.abs(amount);
      }
      updateData.amount = amount;
    }

    const transaction = await update("transactions", id, {
      ...updateData,
      last_modified_by: userId,
    });

    return createSuccessResponse(transaction);
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
        "Transaction ID is required",
        "appTransaction",
        "idrequired",
      );
    }

    const body = await request.json();

    // Ensure amount sign matches kind if both are provided
    const patchData = { ...body };
    if (body.amount !== undefined && body.kind) {
      let amount = Number(body.amount) || 0;
      if (body.kind === "DEBIT" && amount > 0) {
        amount = -amount;
      } else if (body.kind === "CREDIT" && amount < 0) {
        amount = Math.abs(amount);
      }
      patchData.amount = amount;
    }

    const transaction = await update("transactions", id, {
      ...patchData,
      last_modified_by: userId,
    });

    return createSuccessResponse(transaction);
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
        "Transaction ID is required",
        "appTransaction",
        "idrequired",
      );
    }

    await deleteById("transactions", id);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return createErrorResponse(error);
  }
}
