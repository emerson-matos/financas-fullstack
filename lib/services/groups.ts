import { api } from "@/lib/api";
import {
  Group,
  GroupMembership,
  GroupInvite,
  CreateGroupInviteRequest,
} from "@/lib/types";

export const groupsService = {
  getGroups: async () => {
    const response = await api.get<{ data: Group[] }>("/api/groups");
    return response.data;
  },

  getGroup: async (id: string) => {
    const response = await api.get<Group>(`/api/groups/${id}`);
    return response;
  },

  createGroup: async (data: Partial<Group>) => {
    const response = await api.post<Group>("/api/groups", data);
    return response;
  },

  updateGroup: async (id: string, data: Partial<Group>) => {
    const response = await api.put<Group>(`/api/groups/${id}`, data);
    return response;
  },

  deleteGroup: async (id: string) => {
    await api.delete(`/api/groups/${id}`);
  },

  getGroupInvites: async (groupId: string) => {
    const response = await api.get<{ data: GroupInvite[] }>(
      `/api/groups/${groupId}/invites`,
    );
    return response.data;
  },

  createGroupInvite: async (data: CreateGroupInviteRequest) => {
    const response = await api.post<GroupInvite>(
      `/api/groups/${data.groupId}/invites`,
      data,
    );
    return response;
  },

  deleteGroupInvite: async (id: string) => {
    await api.delete(`/api/invites/${id}`);
  },
};
