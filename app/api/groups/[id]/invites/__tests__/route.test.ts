import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ---- mocks ----------------------------------------------------------------

const mockRequireAuth = vi.fn();
vi.mock("@/lib/api/auth", () => ({ requireAuth: mockRequireAuth }));

const mockCreate = vi.fn();
const mockPaginate = vi.fn();
vi.mock("@/lib/supabase/queries", () => ({
  create: mockCreate,
  paginate: mockPaginate,
}));

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

function postRequest(body: object) {
  return new NextRequest("http://localhost/api/groups/group-1/invites", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

const PARAMS = { params: Promise.resolve({ id: "group-1" }) };

// ---- tests -----------------------------------------------------------------

describe("POST /api/groups/[id]/invites", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.from.mockReturnThis();
    mockSupabase.select.mockReturnThis();
    mockSupabase.eq.mockReturnThis();
  });

  it("returns 403 when user has no membership", async () => {
    mockRequireAuth.mockResolvedValue({ userId: "user-1" });
    membershipRow = null;

    const { POST } = await import("../route");
    const res = await POST(postRequest({ email: "a@b.com" }), PARAMS);
    expect(res.status).toBe(403);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("returns 403 when user is a regular member", async () => {
    mockRequireAuth.mockResolvedValue({ userId: "user-1" });
    membershipRow = { user_role: "member" };

    const { POST } = await import("../route");
    const res = await POST(postRequest({ email: "a@b.com" }), PARAMS);
    expect(res.status).toBe(403);
  });

  it("returns 400 when email is missing", async () => {
    mockRequireAuth.mockResolvedValue({ userId: "admin-1" });
    membershipRow = { user_role: "admin" };

    const { POST } = await import("../route");
    const res = await POST(postRequest({}), PARAMS);
    expect(res.status).toBe(400);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("creates invite when user is admin", async () => {
    mockRequireAuth.mockResolvedValue({ userId: "admin-1" });
    membershipRow = { user_role: "admin" };
    mockCreate.mockResolvedValue({ id: "invite-1", email: "a@b.com", status: "pending" });

    const { POST } = await import("../route");
    const res = await POST(postRequest({ email: "a@b.com", role: "member" }), PARAMS);
    expect(res.status).toBe(201);

    const payload = mockCreate.mock.calls[0][1];
    expect(payload.group_id).toBe("group-1");
    expect(payload.email).toBe("a@b.com");
    expect(payload.status).toBe("pending");
    expect(payload.token).toBeDefined();
    expect(payload.expires_at).toBeDefined();
  });

  it("defaults role to 'member' when not provided", async () => {
    mockRequireAuth.mockResolvedValue({ userId: "admin-1" });
    membershipRow = { user_role: "admin" };
    mockCreate.mockResolvedValue({ id: "invite-1" });

    const { POST } = await import("../route");
    await POST(postRequest({ email: "a@b.com" }), PARAMS);

    expect(mockCreate.mock.calls[0][1].role).toBe("member");
  });
});
