import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ---- mocks ----------------------------------------------------------------

vi.mock("@/lib/api/auth", () => ({
  requireAuth: vi.fn().mockResolvedValue({ userId: "user-1" }),
}));

const mockCreate = vi.fn();
const mockPaginate = vi.fn();
const mockFindById = vi.fn();
vi.mock("@/lib/supabase/queries", () => ({
  create: mockCreate,
  paginate: mockPaginate,
  findById: mockFindById,
  update: vi.fn(),
  deleteById: vi.fn(),
}));

// ---- helpers ---------------------------------------------------------------

function postRequest(body: object) {
  return new NextRequest("http://localhost/api/categories", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

// ---- tests -----------------------------------------------------------------

describe("POST /api/categories — user_id ownership", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sets user_id to the authenticated user even when not provided in body", async () => {
    mockCreate.mockResolvedValue({ id: "cat-1", name: "Food", user_id: "user-1" });

    const { POST } = await import("./route");
    const res = await POST(postRequest({ name: "Food" }));

    expect(res.status).toBe(201);
    const payload = mockCreate.mock.calls[0][1];
    expect(payload.user_id).toBe("user-1");
    expect(payload.created_by).toBe("user-1");
  });

  it("overrides user_id from body with the authenticated user id", async () => {
    mockCreate.mockResolvedValue({ id: "cat-1", name: "Food", user_id: "user-1" });

    const { POST } = await import("./route");
    const res = await POST(postRequest({ name: "Food", user_id: "other-user" }));

    expect(res.status).toBe(201);
    const payload = mockCreate.mock.calls[0][1];
    // user_id must be the authenticated user, not the spoofed value
    expect(payload.user_id).toBe("user-1");
  });
});

describe("GET /api/categories — isolation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns only categories visible to the authenticated user (RLS-enforced via paginate)", async () => {
    // RLS in the DB filters results; here we verify the route passes through whatever paginate returns
    mockPaginate.mockResolvedValue({
      content: [{ id: "cat-1", name: "Food", user_id: "user-1" }],
      page: { size: 20, total_elements: 1, total_pages: 1, number: 0 },
    });

    const { GET } = await import("./route");
    const req = new NextRequest("http://localhost/api/categories");
    const res = await GET(req, { params: Promise.resolve({}) });

    expect(res.status).toBe(200);
    const body = await res.json();
    // No categories from other users leaked through (response is wrapped in { data: ... })
    const ids = body.data.content.map((c: { user_id: string }) => c.user_id);
    expect(ids.every((id: string) => id === "user-1")).toBe(true);
  });
});
