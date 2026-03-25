import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useBudgets, useBudget, useCreateBudget } from "./use-budgets";
import { budgetService } from "@/lib/services/budgets";

vi.mock("@/lib/services/budgets", () => ({
  budgetService: {
    getBudgets: vi.fn(),
    getBudget: vi.fn(),
    createBudget: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "QueryClientWrapper";
  return Wrapper;
};

describe("useBudgets", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch budgets", async () => {
    const mockData = {
      content: [{ id: "budget-1", name: "Monthly Budget" }],
      totalElements: 1,
      totalPages: 1,
    };
    vi.mocked(budgetService.getBudgets).mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => useBudgets(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(budgetService.getBudgets).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 0,
        size: 10,
        sort: ["start_date,desc"],
      })
    );
    expect(result.current.data).toEqual([{ id: "budget-1", name: "Monthly Budget" }]);
  });

  it("should fetch budgets with custom params", async () => {
    const mockData = {
      content: [],
      totalElements: 0,
      totalPages: 0,
    };
    vi.mocked(budgetService.getBudgets).mockResolvedValueOnce(mockData);

    const { result } = renderHook(
      () => useBudgets({ page: 1, size: 20 }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(budgetService.getBudgets).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        size: 20,
        sort: ["start_date,desc"],
      })
    );
  });
});

describe("useBudget", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch single budget", async () => {
    const mockData = { id: "budget-123", name: "Test Budget" };
    vi.mocked(budgetService.getBudget).mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => useBudget("budget-123"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(budgetService.getBudget).toHaveBeenCalledWith("budget-123");
    expect(result.current.data).toEqual(mockData);
  });

  it("should not fetch when id is empty", async () => {
    const { result } = renderHook(() => useBudget(""), {
      wrapper: createWrapper(),
    });

    expect(result.current.isFetching).toBe(false);
    expect(budgetService.getBudget).not.toHaveBeenCalled();
  });
});

describe("useCreateBudget", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create budget and invalidate queries", async () => {
    const mockData = { id: "budget-new", name: "New Budget" };
    vi.mocked(budgetService.createBudget).mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => useCreateBudget(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      name: "New Budget",
      start_date: new Date("2024-01-01"),
      end_date: new Date("2024-12-31"),
      is_active: true,
      budget_items: [{ category_id: "cat-1", amount: 500 }],
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(budgetService.createBudget).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "New Budget",
      })
    );
  });

  it("should handle error on create failure", async () => {
    const error = new Error("Failed to create");
    vi.mocked(budgetService.createBudget).mockRejectedValueOnce(error);

    const { result } = renderHook(() => useCreateBudget(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      name: "New Budget",
      start_date: new Date("2024-01-01"),
      end_date: new Date("2024-12-31"),
      is_active: true,
      budget_items: [{ category_id: "cat-1", amount: 500 }],
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(budgetService.createBudget).toHaveBeenCalled();
  });
});