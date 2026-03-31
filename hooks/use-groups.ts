import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { groupsService } from "@/lib/services/groups";
import type { CreateGroupInviteRequest, Group } from "@/lib/types";
import { api } from "@/lib/api";

export function useGroups() {
  return useQuery({
    queryKey: ["groups"],
    queryFn: () => groupsService.getGroups(),
  });
}

export function useGroup(id: string) {
  return useQuery({
    queryKey: ["groups", id],
    queryFn: () => groupsService.getGroup(id),
    enabled: !!id,
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Group>) => groupsService.createGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
}

export function useUpdateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Group> }) =>
      groupsService.updateGroup(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["groups", variables.id] });
    },
  });
}

export function useDeleteGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => groupsService.deleteGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
}

export function useGroupInvites(groupId: string) {
  return useQuery({
    queryKey: ["groups", groupId, "invites"],
    queryFn: () => groupsService.getGroupInvites(groupId),
    enabled: !!groupId,
  });
}

export function useCreateGroupInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateGroupInviteRequest) =>
      groupsService.createGroupInvite(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["groups", variables.groupId, "invites"],
      });
    },
  });
}

export function useDeleteGroupInvite(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: string) => api.delete(`/invites/${inviteId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["groups", groupId, "invites"],
      });
    },
  });
}

export function useGroupTransactions(groupId: string) {
  return useQuery({
    queryKey: ["groups", groupId, "transactions"],
    queryFn: () => groupsService.getGroupTransactions(groupId),
    enabled: !!groupId,
  });
}

export function useGroupDebts(groupId: string) {
  return useQuery({
    queryKey: ["groups", groupId, "debts"],
    queryFn: () => groupsService.getGroupDebts(groupId),
    enabled: !!groupId,
  });
}

export function useSettleDebt(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (debtId: string) => groupsService.settleDebt(debtId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["groups", groupId, "debts"],
      });
    },
  });
}

export function useMyInvites() {
  return useQuery({
    queryKey: ["invites", "mine"],
    queryFn: () => groupsService.getMyInvites(),
  });
}

export function useAcceptInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => groupsService.acceptInvite(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invites", "mine"] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
}
