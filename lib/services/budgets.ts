import type { Budget, BudgetCreatePayload, PageResponse } from "@/types";

import { api } from "../api";

export const budgetService = {
  async getBudgets(params: {
    page?: number;
    size?: number;
    sort?: Array<string>;
  }) {
    const response = await api.get<PageResponse<Budget>>("/budgets", {
      params: {
        sort: params.sort?.join(","),
        page: params.page,
        size: params.size,
      },
    });
    return response.data;
  },

  async getBudget(id: string) {
    const response = await api.get<Budget>(`/budgets/${id}`);
    return response.data;
  },

  async createBudget(data: BudgetCreatePayload) {
    const request = {
      ...data,
      budget_items: data.budget_items.map((item) => ({
        ...item,
        category: { id: item.category_id },
      })),
    };
    const response = await api.post<Budget>("/budgets", request);
    return response.data;
  },

  async updateBudget(id: string, data: Partial<BudgetCreatePayload>) {
    const request = {
      id: id,
      ...data,
      budget_items: data.budget_items?.map((item) => ({
        ...item,
        category: { id: item.category_id },
      })),
    };
    const response = await api.put<Budget>(`/budgets/${id}`, request);
    return response.data;
  },

  async deleteBudget(id: string) {
    await api.delete(`/budgets/${id}`);
  },
};
