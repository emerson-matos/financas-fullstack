import { NextRequest } from "next/server";
import { createErrorResponse, createSuccessResponse } from "@/lib/api/handlers";
import { requireAuth } from "@/lib/api/auth";
import { BadRequestAlertException } from "@/lib/api/errors";
import { create } from "@/lib/supabase/queries";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const body = await request.json();

    if (!body || !Array.isArray(body.transactions)) {
      throw new BadRequestAlertException(
        "Invalid request body. Expected { transactions: [...] }",
        "appTransaction",
        "invalidrequest",
      );
    }

    // Create transactions in bulk
    const created = await Promise.all(
      body.transactions.map((tx: any) =>
        create("transactions", {
          ...tx,
          created_by: userId,
        }),
      ),
    );

    return createSuccessResponse(created, 200);
  } catch (error) {
    return createErrorResponse(error);
  }
}
