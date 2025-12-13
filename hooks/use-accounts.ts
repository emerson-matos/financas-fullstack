import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { accountService } from "@/lib/services/accounts";
import type { Account } from "@/lib/types";

export const useAccounts = (params?: {
  page?: number;
  size?: number;
  sort?: Array<string>;
}) => {
  const queryParams = {
    page: 0,
    size: 10,
    sort: ["identification,asc"],
    ...params,
  };
  return useQuery({
    queryKey: ["accounts", "all", queryParams],
    queryFn: () => accountService.getAccounts(queryParams),
    select: (data) => data.content,
  });
};

export const useAccount = (id: string) => {
  return useQuery({
    queryKey: ["accounts", id],
    queryFn: () => accountService.getAccount(id),
    enabled: !!id,
  });
};

export const useCreateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Account>) => accountService.createAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
};

export const useUpdateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Account> }) =>
      accountService.updateAccount(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["accounts", id] });
    },
  });
};

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => accountService.deleteAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
};
