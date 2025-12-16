import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { budgetService } from "@/lib/services/budgets";
import type { BudgetCreatePayload } from "@/lib/types";

export const useBudgets = (params?: {
  page?: number;
  size?: number;
  sort?: Array<string>;
}) => {
  const queryParams = {
    page: 0,
    size: 10,
    sort: ["start_date,desc"],
    ...params,
  };
  return useQuery({
    queryKey: ["budgets", "all", queryParams],
    queryFn: () => budgetService.getBudgets(queryParams),
    select: (data) => data.content,
  });
};

export const useBudget = (id: string) => {
  return useQuery({
    queryKey: ["budgets", id],
    queryFn: () => budgetService.getBudget(id),
    enabled: !!id,
  });
};

export const useCreateBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BudgetCreatePayload) => budgetService.createBudget(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
};

export const useUpdateBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<BudgetCreatePayload>;
    }) => budgetService.updateBudget(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["budgets", id] });
    },
  });
};

export const useDeleteBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => budgetService.deleteBudget(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
};
