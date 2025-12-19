import { api } from "@/lib/api";
import {
  Group,
  GroupInvite,
  CreateGroupInviteRequest,
  PageResponse,
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
    const response = await api.get<{ data: GroupInvite[] }>(
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
};
