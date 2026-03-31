import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ---- mocks ----------------------------------------------------------------

vi.mock("@/lib/api/auth", () => ({
  requireAuth: vi.fn().mockResolvedValue({ userId: "user-1" }),
}));

const mockUpdate = vi.fn();
const mockDeleteById = vi.fn();
vi.mock("@/lib/supabase/queries", () => ({
  update: mockUpdate,
  deleteById: mockDeleteById,
}));

// RLS-blocking supabase mock: single() returns null data + PGRST116
const mockSingle = vi.fn();
const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  is: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  range: vi.fn().mockResolvedValue({ data: [], error: null, count: 0 }),
  single: mockSingle,
};
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue(mockSupabase),
}));

// ---- helpers ---------------------------------------------------------------

function makeParams(id: string) {
  return { params: Promise.resolve({ id: [id] }) };
}

// ---- tests -----------------------------------------------------------------

describe("GET /api/accounts/:id — cross-user isolation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.from.mockReturnThis();
    mockSupabase.select.mockReturnThis();
    mockSupabase.eq.mockReturnThis();
  });

  it("returns 404 when RLS blocks access to another user's account", async () => {
    // Simulate RLS filtering out the row (PGRST116 = row not found after RLS)
    mockSingle.mockResolvedValue({ data: null, error: { code: "PGRST116" } });

    const { GET } = await import("./route");
    const req = new NextRequest("http://localhost/api/accounts/other-user-account-id");
    const res = await GET(req, makeParams("other-user-account-id"));

    expect(res.status).toBe(404);
  });
});

describe("PUT /api/accounts/:id — cross-user isolation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 404 when update target belongs to another user (RLS blocks)", async () => {
    mockUpdate.mockRejectedValue({ code: "PGRST116", message: "Not found" });

    const { PUT } = await import("./route");
    const req = new NextRequest("http://localhost/api/accounts/other-acc", {
      method: "PUT",
      body: JSON.stringify({ identification: "Evil rename" }),
      headers: { "content-type": "application/json" },
    });
    const res = await PUT(req, makeParams("other-acc"));

    expect(res.status).not.toBe(200);
  });
});

describe("DELETE /api/accounts/:id — cross-user isolation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 404 when delete target belongs to another user (RLS blocks)", async () => {
    mockDeleteById.mockRejectedValue({ code: "PGRST116", message: "Not found" });

    const { DELETE } = await import("./route");
    const req = new NextRequest("http://localhost/api/accounts/other-acc", {
      method: "DELETE",
    });
    const res = await DELETE(req, makeParams("other-acc"));

    expect(res.status).not.toBe(204);
  });
});
