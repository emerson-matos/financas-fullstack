import type {
  CreateTransactionRequest,
  ImportRequest,
  ImportResult,
  PageResponse,
  Transaction,
  TransactionFilter,
  UpdateTransactionRequest,
} from "@/types";

import { api } from "../api";

export const transactionService = {
  async getTransactions(params: TransactionFilter = {}) {
    const response = await api.get<PageResponse<Transaction>>("/transactions", {
      params: {
        page: params.page,
        size: params.size,
        search: params.search,
        sort: params.sort?.join(","),
        start_date: params.startDate
          ?.toISOString()
          .split("T")[0],
        end_date: params.endDate
          ?.toISOString()
          .split("T")[0],
        account_id: params.accountId,
      },
    });
    return response.data;
  },

  async getTransaction(id: string) {
    const response = await api.get<Transaction>(`/transactions/${id}`);
    const data = response.data;
    const result = {
      ...data,
      account_id: data.account?.id,
      category_id: data.category?.id,
    };
    return result;
  },

  async createTransaction(data: CreateTransactionRequest) {
    // Map frontend data to backend DTO format
    const backendPayload = {
      name: data.name,
      description: data.description,
      currency: data.currency || "BRL",
      kind: data.kind, // DEBIT, CREDIT, TRANSFER, or UNKNOWN
      transacted_date: data.transactedDate, // Already formatted as LocalDate
      amount: data.amount,
      account: {
        id: data.accountId,
      },
      category: data.categoryId
        ? {
            id: data.categoryId,
          }
        : null,
      // For TRANSFER transactions, include destination account
      destination_account:
        data.kind === "TRANSFER" && data.destinationAccountId
          ? { id: data.destinationAccountId }
          : null,
    };

    const response = await api.post<Transaction>(
      "/transactions",
      backendPayload,
    );
    return response.data;
  },

  async updateTransaction(id: string, data: UpdateTransactionRequest) {
    // Map frontend data to backend DTO format
    const backendPayload = {
      name: data.name,
      description: data.description,
      currency: data.currency || "BRL",
      kind: data.kind, // DEBIT, CREDIT, TRANSFER, or UNKNOWN
      transacted_date: data.transactedDate, // Already formatted as LocalDate
      amount: data.amount,
      account: {
        id: data.accountId,
      },
      category: data.categoryId
        ? {
            id: data.categoryId,
          }
        : null,
    };

    const response = await api.put<Transaction>(
      `/transactions/${id}`,
      backendPayload,
    );
    return response.data;
  },

  async deleteTransaction(id: string) {
    await api.delete(`/transactions/${id}`);
  },

  async importTransactions(data: Array<CreateTransactionRequest>) {
    // Convert to backend expected snake_case import payload
    const snakeCaseData = data.map((transaction) => ({
      account: { id: transaction.accountId },
      name: transaction.name,
      kind: transaction.kind,
      opts: `importado em ${new Date().toDateString()}`,
      description: transaction.description,
      amount: transaction.amount,
      transacted_date: transaction.transactedDate,
      category: { id: transaction.categoryId },
      currency: transaction.currency,
    }));

    const response = await api.post("/transactions/bulk", {
      transactions: snakeCaseData,
    });
    return response.data;
  },

  async parseFileImport(request: ImportRequest): Promise<ImportResult> {
    // Convert camelCase to snake_case for backend compatibility
    const snakeCaseRequest = {
      file_content: request.fileContent,
      file_name: request.fileName,
      file_format: request.fileFormat,
      account_id: request.accountId,
    };

    const response = await api.post<ImportResult>(
      "/transactions/import",
      snakeCaseRequest,
    );
    return response.data;
  },
};
