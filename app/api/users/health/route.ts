import { NextResponse } from "next/server";

/**
 * GET /api/users/health - Health check endpoint
 * Mirrors Spring's AppUserResource.health()
 */
export async function GET() {
  return NextResponse.json({
    status: "UP",
    service: "financas-api",
  });
}
