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
  transactedAt?: string;
  transacted_at?: string;
  currency?: string;
  kind: "DEBIT" | "CREDIT" | "TRANSFER" | "UNKNOWN";
  opts?: string;
  fitId?: string;
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

  // Extract transacted_at
  const transactedAt = tx.transactedAt || tx.transacted_at;
  if (!transactedAt) {
    throw new BadRequestAlertException(
      "Transaction must have transactedAt",
      "appTransaction",
      "missingdate",
    );
  }

  // Ensure amount sign matches kind
  let amount = tx.amount;
  if (tx.kind === "DEBIT" && amount > 0) {
    amount = -amount;
  } else if (tx.kind === "CREDIT" && amount < 0) {
    amount = Math.abs(amount);
  } else if (tx.kind === "TRANSFER" && amount > 0) {
    // For bulk transfers, we assume the caller might send positive amounts
    // but the backend expects signs. However, bulk API usually receives
    // pre-signed transactions for transfers (outgoing -ve, incoming +ve).
    // We'll leave it as is unless it's explicitly absolute.
  }

  // Build the insert object
  const insert: TransactionInsert = {
    account_id: accountId,
    category_id: categoryId,
    amount: amount,
    currency: tx.currency || "BRL",
    description: tx.description,
    name: tx.name || tx.description,
    kind: tx.kind,
    transacted_at: transactedAt,
    created_by: userId,
    last_modified_by: userId,
  };

  // Add fit_id if provided
  if (tx.fitId) {
    insert.fit_id = tx.fitId;
  }

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

    // Use Supabase batch upsert to prevent duplicates while allowing the rest of the batch to proceed
    // The uniqueness is defined on (account_id, fit_id) for imported transactions
    const { data: created, error } = await supabase
      .from("transactions")
      .upsert(transformedTransactions, {
        onConflict: "account_id,fit_id",
        ignoreDuplicates: true,
      })
      .select();

    if (error) {
      console.error("Supabase upsert error:", error);
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
