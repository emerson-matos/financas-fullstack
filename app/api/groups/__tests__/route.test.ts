import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ---- mocks ----------------------------------------------------------------

vi.mock("@/lib/api/auth", () => ({
  requireAuth: vi.fn().mockResolvedValue({ userId: "user-1" }),
}));

const mockPaginate = vi.fn();
const mockCreate = vi.fn();
vi.mock("@/lib/supabase/queries", () => ({
  paginate: mockPaginate,
  create: mockCreate,
}));

const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  insert: vi.fn().mockResolvedValue({ data: null, error: null }),
};
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue(mockSupabase),
}));

// ---- helpers ---------------------------------------------------------------

function getRequest(query = "") {
  return new NextRequest(`http://localhost/api/groups${query}`);
}

// ---- tests -----------------------------------------------------------------

describe("GET /api/groups — pagination param validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPaginate.mockResolvedValue({ content: [], totalElements: 0 });
  });

  it("uses default page=0 and size=20 when params absent", async () => {
    const { GET } = await import("../route");
    await GET(getRequest());

    const opts = mockPaginate.mock.calls[0][1];
    expect(opts.page).toBe(0);
    expect(opts.size).toBe(20);
  });

  it("clamps NaN page to 0", async () => {
    const { GET } = await import("../route");
    await GET(getRequest("?page=abc&size=xyz"));

    const opts = mockPaginate.mock.calls[0][1];
    expect(opts.page).toBe(0);
    expect(opts.size).toBeGreaterThanOrEqual(1);
  });

  it("clamps negative page to 0", async () => {
    const { GET } = await import("../route");
    await GET(getRequest("?page=-5"));

    const opts = mockPaginate.mock.calls[0][1];
    expect(opts.page).toBe(0);
  });

  it("passes valid page and size through", async () => {
    const { GET } = await import("../route");
    await GET(getRequest("?page=2&size=10"));

    const opts = mockPaginate.mock.calls[0][1];
    expect(opts.page).toBe(2);
    expect(opts.size).toBe(10);
  });
});

describe("POST /api/groups — field whitelist", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreate.mockResolvedValue({ id: "g-1", name: "Test" });
  });

  it("only passes name, description and created_by to create", async () => {
    const { POST } = await import("../route");
    const req = new NextRequest("http://localhost/api/groups", {
      method: "POST",
      body: JSON.stringify({
        name: "My Group",
        description: "desc",
        deactivated_at: "evil",
        split_rules: { hack: true },
      }),
      headers: { "content-type": "application/json" },
    });

    await POST(req);

    const payload = mockCreate.mock.calls[0][1];
    expect(payload).toHaveProperty("name", "My Group");
    expect(payload).toHaveProperty("description", "desc");
    expect(payload).toHaveProperty("created_by", "user-1");
    expect(payload).not.toHaveProperty("deactivated_at");
    expect(payload).not.toHaveProperty("split_rules");
  });
});
