import { api } from "@/lib/api";
import type {
  Group,
  GroupInvite,
  CreateGroupInviteRequest,
  GroupTransaction,
  MemberDebt,
  PageResponse,
  PendingInvite,
} from "@/lib/types";

export const groupsService = {
  getGroups: async () => {
    const response = await api.get<PageResponse<Group>>("/groups");
    return response.data;
  },

  getGroup: async (id: string) => {
    const response = await api.get<Group>(`/groups/${id}`);
    return response;
  },

  createGroup: async (data: Partial<Group>) => {
    const response = await api.post<Group>("/groups", data);
    return response;
  },

  updateGroup: async (id: string, data: Partial<Group>) => {
    const response = await api.put<Group>(`/groups/${id}`, data);
    return response;
  },

  deleteGroup: async (id: string) => {
    await api.delete(`/groups/${id}`);
  },

  getGroupInvites: async (groupId: string) => {
    const response = await api.get<PageResponse<GroupInvite>>(
      `/groups/${groupId}/invites`,
    );
    return response.data;
  },

  createGroupInvite: async (data: CreateGroupInviteRequest) => {
    const response = await api.post<GroupInvite>(
      `/groups/${data.groupId}/invites`,
      data,
    );
    return response;
  },

  deleteGroupInvite: async (id: string) => {
    await api.delete(`/invites/${id}`);
  },

  getGroupTransactions: async (groupId: string, page = 0, size = 20) => {
    const response = await api.get<{
      content: GroupTransaction[];
      totalElements: number;
      totalPages: number;
      currentPage: number;
      pageSize: number;
    }>(`/groups/${groupId}/transactions?page=${page}&size=${size}`);
    return response.data;
  },

  getGroupDebts: async (groupId: string) => {
    const response = await api.get<{ content: MemberDebt[] }>(
      `/groups/${groupId}/debts`,
    );
    return response.data;
  },

  settleDebt: async (debtId: string) => {
    const response = await api.patch(`/member-debts/${debtId}`, {
      status: "paid",
    });
    return response;
  },

  getMyInvites: async () => {
    const response = await api.get<PendingInvite[]>("/invites/mine");
    return response.data;
  },

  acceptInvite: async (token: string) => {
    const response = await api.post<{ group_id: string; message: string }>(
      `/invites/${token}/accept`,
    );
    return response.data;
  },
};
