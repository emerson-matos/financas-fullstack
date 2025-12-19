import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { groupsService } from "@/lib/services/groups";
import { CreateGroupInviteRequest, Group } from "@/lib/types";

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
