import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { transactionService } from "@/lib/services/transactions";
import type {
  CreateTransactionRequest,
  ImportRequest,
  TransactionFilter,
  UpdateTransactionRequest,
} from "@/lib/types";

export const useTransactions = (params: TransactionFilter = {}) => {
  const queryParams = {
    sort: params.sort || ["transacted_at,desc"],
    ...params,
  };
  return useQuery({
    queryKey: ["transactions", "all", queryParams],
    queryFn: () => transactionService.getTransactions(queryParams),
    select: (data) => data.content,
  });
};

export const useTransaction = (id: string) => {
  return useQuery({
    queryKey: ["transactions", id],
    queryFn: () => transactionService.getTransaction(id),
    enabled: !!id,
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTransactionRequest) => {
      const payload = { ...data };
      if (!payload.categoryId) {
        delete (payload as { category?: { id: string } }).category;
      }
      return transactionService.createTransaction(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["chart-data"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
    onError: (error) => {
      console.error("Failed to create transaction:", error);
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateTransactionRequest;
    }) => {
      const payload = { ...data };
      if (!payload.categoryId) {
        delete (payload as { category?: { id: string } }).category;
      }
      return transactionService.updateTransaction(id, payload);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transactions", id] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["chart-data"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
    onError: (error) => {
      console.error("Failed to update transaction:", error);
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => transactionService.deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["chart-data"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
};

export const useRecentTransactions = (limit = 10) => {
  return useTransactions({
    page: 0,
    size: limit,
    sort: ["transacted_at,desc"],
  });
};

export const useAllTransactions = (
  params: Omit<TransactionFilter, "page" | "size"> = {},
) => {
  return useTransactions({
    ...params,
    page: 0,
    size: 1000, // Request a large page size to get most/all transactions
  });
};

export const useBulkCreateTransactions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Array<CreateTransactionRequest>) =>
      transactionService.importTransactions(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["chart-data"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
};

export const useParseFileImport = () => {
  return useMutation({
    mutationFn: (request: ImportRequest) =>
      transactionService.parseFileImport(request),
  });
};

export const useTransactionsForChart = (
  params: Omit<TransactionFilter, "page" | "size"> = {},
) => {
  return useTransactions({
    ...params,
    page: 0,
    size: 1000, // Fetch up to 1000 transactions for charting
  });
};
