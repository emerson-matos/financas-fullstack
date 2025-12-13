import { NextRequest, NextResponse } from "next/server";
import { createErrorResponse, createSuccessResponse } from "@/lib/api/handlers";
import { requireAuth } from "@/lib/api/auth";
import { BadRequestAlertException, NotFoundException } from "@/lib/api/errors";
import { update, deleteById } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";

// Initial category ID (from seed data)
const INITIAL_CATEGORY_ID = "00000000-0000-0000-0000-000000000000";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id?: string[] }> },
) {
  try {
    await requireAuth();
    const resolvedParams = await params;
    const id = resolvedParams?.id?.[0];
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);

    if (id) {
      // Get account with calculated balances
      const { data: account, error } = await supabase
        .from("user_accounts")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !account) {
        throw new NotFoundException(
          "Account not found",
          "appUserAccount",
          "notfound",
        );
      }

      // Calculate balances from transactions
      const balances = await calculateAccountBalances(supabase, [account.id]);

      return createSuccessResponse({
        ...account,
        initial_amount: balances[account.id]?.initial_amount || 0,
        current_amount: balances[account.id]?.current_amount || 0,
      });
    }

    const page = parseInt(searchParams.get("page") || "0");
    const size = parseInt(searchParams.get("size") || "20");

    // Get accounts
    const {
      data: accounts,
      error,
      count,
    } = await supabase
      .from("user_accounts")
      .select("*", { count: "exact" })
      .is("deactivated_at", null)
      .order("identification", { ascending: true })
      .range(page * size, (page + 1) * size - 1);

    if (error) throw error;

    // Calculate balances for all accounts
    const accountIds = (accounts || []).map((a) => a.id);
    const balances = await calculateAccountBalances(supabase, accountIds);

    // Merge balances into accounts
    const accountsWithBalances = (accounts || []).map((account) => ({
      ...account,
      initial_amount: balances[account.id]?.initial_amount || 0,
      current_amount: balances[account.id]?.current_amount || 0,
    }));

    const totalElements = count || 0;
    const totalPages = Math.ceil(totalElements / size);

    return createSuccessResponse({
      content: accountsWithBalances,
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

// Helper to calculate account balances from transactions
async function calculateAccountBalances(
  supabase: Awaited<ReturnType<typeof createClient>>,
  accountIds: string[],
): Promise<Record<string, { initial_amount: number; current_amount: number }>> {
  if (accountIds.length === 0) return {};

  // Get all transactions for these accounts
  const { data: transactions, error } = await supabase
    .from("transactions")
    .select("account_id, amount, kind, category_id")
    .in("account_id", accountIds)
    .is("deactivated_at", null);

  if (error) throw error;

  const balances: Record<
    string,
    { initial_amount: number; current_amount: number }
  > = {};

  // Initialize all accounts with 0
  for (const id of accountIds) {
    balances[id] = { initial_amount: 0, current_amount: 0 };
  }

  // Calculate balances - amounts are already signed (CREDIT=positive, DEBIT=negative)
  for (const tx of transactions || []) {
    const amount = Number(tx.amount) || 0;

    // If it's the initial transaction, set initial_amount (use absolute value for display)
    if (tx.category_id === INITIAL_CATEGORY_ID) {
      balances[tx.account_id].initial_amount = Math.abs(amount);
    }

    // Add to current balance (amount is already signed)
    balances[tx.account_id].current_amount += amount;
  }

  return balances;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const body = await request.json();
    const supabase = await createClient();

    if (!body) {
      throw new BadRequestAlertException(
        "Request body is required",
        "appUserAccount",
        "invalidrequest",
      );
    }

    const { initial_amount, ...accountData } = body;

    // Create the account
    const { data: account, error: accountError } = await supabase
      .from("user_accounts")
      .insert({
        ...accountData,
        user_id: userId,
        created_by: userId,
      })
      .select()
      .single();

    if (accountError) throw accountError;

    // If initial_amount is provided and not zero, create initial transaction
    // Amount should be signed: positive for CREDIT, negative for DEBIT
    if (initial_amount && initial_amount !== 0) {
      const signedAmount = initial_amount; // Already signed: positive = credit, negative = debit
      const kind = initial_amount > 0 ? "CREDIT" : "DEBIT";

      const { error: txError } = await supabase.from("transactions").insert({
        account_id: account.id,
        category_id: INITIAL_CATEGORY_ID,
        amount: signedAmount,
        currency: account.currency || "BRL",
        name: "Saldo Inicial",
        description: "Saldo inicial da conta",
        kind,
        transacted_date: new Date().toISOString().split("T")[0],
        created_by: userId,
      });

      if (txError) throw txError;
    }

    return createSuccessResponse(
      {
        ...account,
        initial_amount: initial_amount || 0,
        current_amount: initial_amount || 0,
      },
      201,
    );
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
        "Account ID is required",
        "appUserAccount",
        "idrequired",
      );
    }

    const body = await request.json();
    const account = await update("user_accounts", id, {
      ...body,
      updated_by: userId,
    });

    return createSuccessResponse(account);
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
        "Account ID is required",
        "appUserAccount",
        "idrequired",
      );
    }

    const body = await request.json();
    const account = await update("user_accounts", id, {
      ...body,
      updated_by: userId,
    });

    return createSuccessResponse(account);
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
        "Account ID is required",
        "appUserAccount",
        "idrequired",
      );
    }

    await deleteById("user_accounts", id);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return createErrorResponse(error);
  }
}
