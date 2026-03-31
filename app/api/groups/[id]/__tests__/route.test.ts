import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ---- mocks ----------------------------------------------------------------

const mockRequireAuth = vi.fn();
vi.mock("@/lib/api/auth", () => ({ requireAuth: mockRequireAuth }));

const mockUpdate = vi.fn();
const mockDeleteById = vi.fn();
vi.mock("@/lib/supabase/queries", () => ({
  update: mockUpdate,
  deleteById: mockDeleteById,
}));

// Supabase client builder — returns configurable membership result
let membershipRow: { user_role: string } | null = null;
const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn().mockImplementation(() =>
    Promise.resolve({ data: membershipRow, error: null }),
  ),
};
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue(mockSupabase),
}));

// ---- helpers ---------------------------------------------------------------

function makeRequest(body?: object) {
  return new NextRequest("http://localhost/api/groups/group-1", {
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
    headers: { "content-type": "application/json" },
  });
}

const PARAMS = { params: Promise.resolve({ id: "group-1" }) };

// ---- tests -----------------------------------------------------------------

describe("PUT /api/groups/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.from.mockReturnThis();
    mockSupabase.select.mockReturnThis();
    mockSupabase.eq.mockReturnThis();
  });

  it("returns 403 when user is not a group admin", async () => {
    mockRequireAuth.mockResolvedValue({ userId: "user-1" });
    membershipRow = null; // not a member

    const { PUT } = await import("../route");
    const res = await PUT(makeRequest({ name: "New name" }), PARAMS);
    expect(res.status).toBe(403);

    const body = await res.json();
    expect(body.error).toContain("permission");
  });

  it("returns 403 when user is a regular member (not admin)", async () => {
    mockRequireAuth.mockResolvedValue({ userId: "user-1" });
    membershipRow = { user_role: "member" };

    const { PUT } = await import("../route");
    const res = await PUT(makeRequest({ name: "New name" }), PARAMS);
    expect(res.status).toBe(403);
  });

  it("allows update when user is admin", async () => {
    mockRequireAuth.mockResolvedValue({ userId: "admin-1" });
    membershipRow = { user_role: "admin" };
    mockUpdate.mockResolvedValue({ id: "group-1", name: "New name" });

    const { PUT } = await import("../route");
    const res = await PUT(makeRequest({ name: "New name" }), PARAMS);
    expect(res.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith(
      "app_groups",
      "group-1",
      expect.objectContaining({ name: "New name", last_modified_by: "admin-1" }),
    );
  });

  it("only passes whitelisted fields to update", async () => {
    mockRequireAuth.mockResolvedValue({ userId: "admin-1" });
    membershipRow = { user_role: "admin" };
    mockUpdate.mockResolvedValue({ id: "group-1" });

    const { PUT } = await import("../route");
    await PUT(
      makeRequest({ name: "ok", description: "ok", created_by: "injected", deactivated_at: "evil" }),
      PARAMS,
    );

    const updatePayload = mockUpdate.mock.calls[0][2];
    expect(Object.keys(updatePayload)).toEqual(
      expect.arrayContaining(["name", "description", "last_modified_by"]),
    );
    expect(updatePayload).not.toHaveProperty("created_by");
    expect(updatePayload).not.toHaveProperty("deactivated_at");
  });
});

describe("DELETE /api/groups/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.from.mockReturnThis();
    mockSupabase.select.mockReturnThis();
    mockSupabase.eq.mockReturnThis();
  });

  it("returns 403 for non-admin", async () => {
    mockRequireAuth.mockResolvedValue({ userId: "user-1" });
    membershipRow = null;

    const { DELETE } = await import("../route");
    const req = new NextRequest("http://localhost/api/groups/group-1", { method: "DELETE" });
    const res = await DELETE(req, PARAMS);
    expect(res.status).toBe(403);
    expect(mockDeleteById).not.toHaveBeenCalled();
  });

  it("deletes when user is admin", async () => {
    mockRequireAuth.mockResolvedValue({ userId: "admin-1" });
    membershipRow = { user_role: "admin" };
    mockDeleteById.mockResolvedValue(undefined);

    const { DELETE } = await import("../route");
    const req = new NextRequest("http://localhost/api/groups/group-1", { method: "DELETE" });
    const res = await DELETE(req, PARAMS);
    expect(res.status).toBe(204);
    expect(mockDeleteById).toHaveBeenCalledWith("app_groups", "group-1");
  });
});
