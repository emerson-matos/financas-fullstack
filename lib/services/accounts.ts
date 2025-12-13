import type { Account, PageResponse } from "@/types";

import { api } from "../api";

export const accountService = {
  async getAccounts(params: {
    page?: number;
    size?: number;
    sort?: Array<string>;
  }) {
    const response = await api.get<PageResponse<Account>>("/accounts", {
      params: {
        sort: params.sort?.join(","),
        page: params.page,
        size: params.size,
      },
    });
    return response.data;
  },

  async getAccount(id: string) {
    const response = await api.get<Account>(`/accounts/${id}`);
    return response.data;
  },

  async createAccount(data: Partial<Account>) {
    const response = await api.post<Account>("/accounts", data);
    return response.data;
  },

  async updateAccount(id: string, data: Partial<Account>) {
    const response = await api.put<Account>(`/accounts/${id}`, data);
    return response.data;
  },

  async deleteAccount(id: string) {
    await api.delete(`/accounts/${id}`);
  },
};
