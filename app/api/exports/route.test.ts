
import { describe, expect, it, vi, beforeEach } from "vitest";
import { GET } from "./route";
import { NextRequest } from "next/server";

// Mock dependencies
const mockFrom = vi.fn();
const mockSupabase = {
  from: mockFrom,
};

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

vi.mock("@/lib/api/auth", () => ({
  requireAuth: vi.fn(() => Promise.resolve({ userId: "user-123" })),
}));

describe("Export API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return CSV export for transactions by default", async () => {
    // Mock Supabase response - now uses 'identification' for accounts
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      then: (resolve: (value: unknown) => void) =>
        resolve({
          data: [
            { id: "1", name: "t1", amount: 100, account: { id: "a1", identification: "Bank" }, category: { id: "c1", name: "Food" } },
            { id: "2", name: "t2", amount: 200, account: { id: "a2", identification: "Cash" }, category: { id: "c2", name: "Work" } },
          ],
          error: null,
        }),
    });

    const request = new NextRequest("http://localhost/api/exports?type=transactions&format=csv");
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("text/csv");
    expect(response.headers.get("Content-Disposition")).toContain("transactions_export");

    const text = await response.text();
    // Headers are dynamic based on object keys order, but let's check values exist
    expect(text).toContain('"100"');
    expect(text).toContain('"Bank"');
    expect(text).toContain('"Food"');
    expect(text).toContain('"200"');
    expect(text).toContain('"Cash"');
    expect(text).toContain('"Work"');
  });

  it("should return JSON export for accounts", async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      then: (resolve: (value: unknown) => void) =>
        resolve({
          data: [{ id: "acc-1", identification: "Savings" }],
          error: null,
        }),
    });

    const request = new NextRequest("http://localhost/api/exports?type=accounts&format=json");
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/json");

    const json = await response.json();
    expect(json).toHaveLength(1);
    expect(json[0].identification).toBe("Savings");
  });

  it("should handle invalid export types", async () => {
    const request = new NextRequest("http://localhost/api/exports?type=invalid");
    const response = await GET(request);

    expect(response.status).toBe(400);
  });
});
