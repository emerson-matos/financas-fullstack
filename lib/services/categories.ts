import type { Category, PageResponse } from "@/types";

import { api } from "../api";

export const categoryService = {
  async getCategories(params: { sort?: Array<string> }) {
    const response = await api.get<PageResponse<Category>>("/categories", {
      params: {
        sort: params.sort?.join(","),
      },
    });
    return response.data;
  },

  async getCategory(id: string) {
    const response = await api.get<Category>(`/categories/${id}`);
    return response.data;
  },

  async createCategory(data: Partial<Category>) {
    const response = await api.post<Category>("/categories", data);
    return response.data;
  },

  async updateCategory(id: string, data: Partial<Category>) {
    const response = await api.put<Category>(`/categories/${id}`, data);
    return response.data;
  },

  async deleteCategory(id: string) {
    await api.delete(`/categories/${id}`);
  },
};
