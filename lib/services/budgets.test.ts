import { describe, it, expect, vi, beforeEach } from "vitest";
import { budgetService } from "./budgets";
import type { BudgetCreatePayload } from "@/lib/types";

vi.mock("@/lib/api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import { api } from "@/lib/api";

const mockApi = api as ReturnType<typeof vi.fn>;

describe("budgetService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getBudgets", () => {
    it("should fetch budgets with default params", async () => {
      const mockData = {
        content: [],
        totalElements: 0,
        totalPages: 0,
      };
      mockApi.get.mockResolvedValueOnce({ data: mockData });

      const result = await budgetService.getBudgets({});

      expect(mockApi.get).toHaveBeenCalledWith("/budgets", {
        params: {
          sort: undefined,
          page: undefined,
          size: undefined,
        },
      });
      expect(result).toEqual(mockData);
    });

    it("should fetch budgets with custom params", async () => {
      const mockData = {
        content: [{ id: "budget-1", name: "Monthly Budget" }],
        totalElements: 1,
        totalPages: 1,
      };
      mockApi.get.mockResolvedValueOnce({ data: mockData });

      const result = await budgetService.getBudgets({
        page: 0,
        size: 10,
        sort: ["start_date-desc"],
      });

      expect(mockApi.get).toHaveBeenCalledWith("/budgets", {
        params: {
          sort: "start_date-desc",
          page: 0,
          size: 10,
        },
      });
      expect(result).toEqual(mockData);
    });
  });

  describe("getBudget", () => {
    it("should fetch single budget", async () => {
      const mockData = {
        id: "budget-123",
        name: "My Budget",
        start_date: "2024-01-01",
        end_date: "2024-12-31",
        is_active: true,
        budget_items: [],
      };
      mockApi.get.mockResolvedValueOnce({ data: mockData });

      const result = await budgetService.getBudget("budget-123");

      expect(mockApi.get).toHaveBeenCalledWith("/budgets/budget-123");
      expect(result).toEqual(mockData);
    });
  });

  describe("createBudget", () => {
    it("should create a new budget", async () => {
      const payload: BudgetCreatePayload = {
        name: "New Budget",
        start_date: new Date("2024-01-01"),
        end_date: new Date("2024-12-31"),
        is_active: true,
        budget_items: [{ category_id: "cat-1", amount: 500 }],
      };
      const mockResponse = {
        id: "budget-new",
        name: "New Budget",
        start_date: "2024-01-01T00:00:00.000Z",
        end_date: "2024-12-31T00:00:00.000Z",
        is_active: true,
        budget_items: [],
      };
      mockApi.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await budgetService.createBudget(payload);

      expect(mockApi.post).toHaveBeenCalledWith("/budgets", {
        name: "New Budget",
        start_date: "2024-01-01T00:00:00.000Z",
        end_date: "2024-12-31T00:00:00.000Z",
        is_active: true,
        budget_items: expect.arrayContaining([
          expect.objectContaining({
            amount: 500,
            category: { id: "cat-1" },
            category_id: "cat-1",
          }),
        ]),
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe("updateBudget", () => {
    it("should update a budget", async () => {
      const payload: Partial<BudgetCreatePayload> = {
        name: "Updated Budget",
        start_date: new Date("2024-06-01"),
        end_date: new Date("2024-06-30"),
      };
      const mockResponse = { id: "budget-123", ...payload };
      mockApi.put.mockResolvedValueOnce({ data: mockResponse });

      const result = await budgetService.updateBudget("budget-123", payload);

      expect(mockApi.put).toHaveBeenCalledWith(
        "/budgets/budget-123",
        expect.objectContaining({
          id: "budget-123",
          name: "Updated Budget",
          start_date: "2024-06-01T00:00:00.000Z",
          end_date: "2024-06-30T00:00:00.000Z",
        }),
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("deleteBudget", () => {
    it("should delete a budget", async () => {
      mockApi.delete.mockResolvedValueOnce({ data: null });

      await budgetService.deleteBudget("budget-123");

      expect(mockApi.delete).toHaveBeenCalledWith("/budgets/budget-123");
    });
  });
});

