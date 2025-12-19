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
      // Get account with calculated balances from view
      const { data: account, error } = await supabase
        .from("user_accounts_with_balance")
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

      return createSuccessResponse(account);
    }

    const page = parseInt(searchParams.get("page") || "0");
    const size = parseInt(searchParams.get("size") || "20");

    // Get accounts from view
    const {
      data: accounts,
      error,
      count,
    } = await supabase
      .from("user_accounts_with_balance")
      .select("*", { count: "exact" })
      .is("deactivated_at", null)
      .order("identification", { ascending: true })
      .range(page * size, (page + 1) * size - 1);

    if (error) throw error;

    const totalElements = count || 0;
    const totalPages = Math.ceil(totalElements / size);

    return createSuccessResponse({
      content: accounts || [],
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
    if (initial_amount && initial_amount !== 0) {
      const signedAmount = initial_amount;
      const kind = initial_amount > 0 ? "CREDIT" : "DEBIT";

      const { error: txError } = await supabase.from("transactions").insert({
        account_id: account.id,
        category_id: INITIAL_CATEGORY_ID,
        amount: signedAmount,
        currency: account.currency || "BRL",
        name: "Saldo Inicial",
        description: "Saldo inicial da conta",
        kind,
        transacted_at: new Date().toISOString(),
        created_by: userId,
      });

      if (txError) throw txError;
    }

    // Refresh account data from view to get calculated balance
    const { data: refreshedAccount } = await supabase
      .from("user_accounts_with_balance")
      .select("*")
      .eq("id", account.id)
      .single();

    return createSuccessResponse(refreshedAccount || account, 201);
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
