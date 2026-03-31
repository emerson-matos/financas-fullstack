import { describe, it, expect } from "vitest";
import { createErrorResponse, createPageResponse } from "../handlers";
import {
  BadRequestAlertException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from "../errors";

describe("createErrorResponse", () => {
  it("returns generic message for unknown Error — never leaks internals", async () => {
    const response = createErrorResponse(
      new Error("SELECT * FROM users WHERE password = 'secret'"),
    );
    const body = await response.json();
    expect(body.error).toBe("Internal server error");
    expect(body.error).not.toContain("SELECT");
    expect(response.status).toBe(500);
  });

  it("returns generic message for non-Error throws", async () => {
    const response = createErrorResponse("raw string error");
    const body = await response.json();
    expect(body.error).toBe("Internal server error");
    expect(response.status).toBe(500);
  });

  it("returns ApiError message and correct status for BadRequestAlertException", async () => {
    const error = new BadRequestAlertException(
      "Name is required",
      "groups",
      "nameRequired",
    );
    const response = createErrorResponse(error);
    const body = await response.json();
    expect(body.error).toBe("Name is required");
    expect(response.status).toBe(400);
  });

  it("returns 403 for ForbiddenException", async () => {
    const error = new ForbiddenException("Not allowed");
    const response = createErrorResponse(error);
    const body = await response.json();
    expect(body.error).toBe("Not allowed");
    expect(response.status).toBe(403);
  });

  it("returns 404 for NotFoundException", async () => {
    const error = new NotFoundException("Group not found", "groups", "notfound");
    const response = createErrorResponse(error);
    const body = await response.json();
    expect(body.error).toBe("Group not found");
    expect(response.status).toBe(404);
  });

  it("returns 401 for UnauthorizedException", async () => {
    const error = new UnauthorizedException("Auth required");
    const response = createErrorResponse(error);
    const body = await response.json();
    expect(body.error).toBe("Auth required");
    expect(response.status).toBe(401);
  });
});

describe("createPageResponse", () => {
  it("first page: hasNext true, hasPrevious false", () => {
    const result = createPageResponse([1, 2], 10, 0, 2);
    expect(result.hasNext).toBe(true);
    expect(result.hasPrevious).toBe(false);
    expect(result.currentPage).toBe(0);
    expect(result.totalPages).toBe(5);
  });

  it("last page: hasNext false, hasPrevious true", () => {
    const result = createPageResponse([9, 10], 10, 4, 2);
    expect(result.hasNext).toBe(false);
    expect(result.hasPrevious).toBe(true);
  });

  it("middle page: hasNext true, hasPrevious true", () => {
    const result = createPageResponse([3, 4], 10, 1, 2);
    expect(result.hasNext).toBe(true);
    expect(result.hasPrevious).toBe(true);
  });

  it("single page: hasNext false, hasPrevious false", () => {
    const result = createPageResponse([1], 1, 0, 20);
    expect(result.hasNext).toBe(false);
    expect(result.hasPrevious).toBe(false);
    expect(result.totalPages).toBe(1);
  });

  it("calculates totalPages correctly with remainder", () => {
    expect(createPageResponse([], 10, 0, 3).totalPages).toBe(4); // ceil(10/3)
    expect(createPageResponse([], 9, 0, 3).totalPages).toBe(3);
    expect(createPageResponse([], 0, 0, 20).totalPages).toBe(0);
  });
});
