import { NextRequest } from "next/server";
import { createErrorResponse, createSuccessResponse } from "@/lib/api/handlers";
import { requireAuth } from "@/lib/api/auth";
import { BadRequestAlertException } from "@/lib/api/errors";

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const body = await request.json();

    if (!body) {
      throw new BadRequestAlertException(
        "Request body is required",
        "appTransaction",
        "invalidrequest",
      );
    }

    // TODO: Implement file import logic with Supabase
    // This should parse the file and create transactions in bulk
    return createSuccessResponse(
      { message: "Import started", transactions: [] },
      200,
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
