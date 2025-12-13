import { NextRequest, NextResponse } from "next/server";
import { ApiError } from "@/lib/api/errors";

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  statusCode: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export function createErrorResponse(
  error: unknown,
  statusCode: number = 500,
): NextResponse<ApiResponse<null>> {
  // Log the full error for debugging
  console.error("[API Error]", error);

  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        statusCode: error.statusCode,
      },
      { status: error.statusCode },
    );
  }

  const message =
    error instanceof Error ? error.message : "Internal server error";

  // Log stack trace if available
  if (error instanceof Error && error.stack) {
    console.error("[API Error Stack]", error.stack);
  }

  return NextResponse.json(
    {
      error: message,
      statusCode,
    },
    { status: statusCode },
  );
}

export function createSuccessResponse<T>(
  data: T,
  statusCode: number = 200,
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      data,
      statusCode,
    },
    { status: statusCode },
  );
}

export function createPageResponse<T>(
  content: T[],
  totalElements: number,
  pageNumber: number = 0,
  pageSize: number = 20,
): PageResponse<T> {
  const totalPages = Math.ceil(totalElements / pageSize);
  return {
    content,
    totalElements,
    totalPages,
    currentPage: pageNumber,
    pageSize,
    hasNext: pageNumber < totalPages - 1,
    hasPrevious: pageNumber > 0,
  };
}

export async function apiHandler<T>(
  callback: (req: NextRequest) => Promise<NextResponse<T>>,
): Promise<(req: NextRequest) => Promise<NextResponse<T>>> {
  return callback;
}
