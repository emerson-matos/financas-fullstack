import { NextRequest } from "next/server";
import { createErrorResponse, createSuccessResponse } from "@/lib/api/handlers";
import { requireAuth } from "@/lib/api/auth";
import { BadRequestAlertException } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";
import { Database } from "@/lib/supabase/types";

type TransactionInsert = Database["thc"]["Tables"]["transactions"]["Insert"];

interface BulkTransactionRequest {
  accountId?: string;
  account?: { id: string };
  categoryId?: string;
  category?: { id?: string };
  destinationAccountId?: string;
  name?: string;
  description: string;
  amount: number;
  transactedDate?: string;
  transacted_date?: string;
  currency?: string;
  kind: "DEBIT" | "CREDIT" | "TRANSFER" | "UNKNOWN";
  opts?: string;
}

function transformTransaction(
  tx: BulkTransactionRequest,
  userId: string,
): TransactionInsert {
  // Extract account_id from either accountId or account.id
  const accountId = tx.accountId || tx.account?.id;
  if (!accountId) {
    throw new BadRequestAlertException(
      "Transaction must have accountId or account.id",
      "appTransaction",
      "missingaccount",
    );
  }

  // Extract category_id if provided
  const categoryId = tx.categoryId || tx.category?.id || null;

  // Extract transacted_date
  const transactedDate = tx.transactedDate || tx.transacted_date;
  if (!transactedDate) {
    throw new BadRequestAlertException(
      "Transaction must have transactedDate",
      "appTransaction",
      "missingdate",
    );
  }

  // Build the insert object
  const insert: TransactionInsert = {
    account_id: accountId,
    category_id: categoryId,
    amount: tx.amount,
    currency: tx.currency || "BRL",
    description: tx.description,
    name: tx.name || tx.description,
    kind: tx.kind,
    transacted_date: transactedDate,
    created_by: userId,
    last_modified_by: userId,
  };

  // Add opts if provided
  if (tx.opts) {
    insert.opts = tx.opts;
  }

  // Handle TRANSFER type - link to destination account
  if (tx.kind === "TRANSFER" && tx.destinationAccountId) {
    insert.opts =
      `${insert.opts || ""} transfer_to:${tx.destinationAccountId}`.trim();
  }

  return insert;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const supabase = await createClient();

    const body = await request.json();

    if (!body || !Array.isArray(body.transactions)) {
      throw new BadRequestAlertException(
        "Invalid request body. Expected { transactions: [...] }",
        "appTransaction",
        "invalidrequest",
      );
    }

    if (body.transactions.length === 0) {
      throw new BadRequestAlertException(
        "transactions array cannot be empty",
        "appTransaction",
        "emptytransactions",
      );
    }

    // Validate and transform all transactions first
    const transformedTransactions: TransactionInsert[] = [];
    const errors: Array<{ index: number; error: string }> = [];

    body.transactions.forEach((tx: BulkTransactionRequest, index: number) => {
      try {
        const transformed = transformTransaction(tx, userId);
        transformedTransactions.push(transformed);
      } catch (error) {
        errors.push({
          index,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });

    // If there are validation errors, return them
    if (errors.length > 0) {
      throw new BadRequestAlertException(
        `Failed to validate ${errors.length} transaction(s)`,
        "appTransaction",
        "validationerrors",
      );
    }

    // Use Supabase batch insert for better performance
    const { data: created, error } = await supabase
      .from("transactions")
      .insert(transformedTransactions)
      .select();

    if (error) {
      console.error("Supabase insert error:", error);
      throw new BadRequestAlertException(
        `Failed to insert transactions: ${error.message}`,
        "appTransaction",
        "inserterror",
      );
    }

    return createSuccessResponse(
      {
        transactions: created || [],
        count: created?.length || 0,
      },
      201,
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
