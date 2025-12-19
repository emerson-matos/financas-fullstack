import { api } from "@/lib/api";
import { SplitProposal, PageResponse } from "@/lib/types";

export const splitProposalsService = {
  getProposals: async (groupId: string) => {
    const response = await api.get<PageResponse<SplitProposal>>(
      `/groups/${groupId}/proposals`,
    );
    return response.data;
  },

  approveProposal: async (id: string) => {
    const response = await api.post<void>(`/proposals/${id}/approve`);
    return response.data;
  },

  rejectProposal: async (id: string) => {
    const response = await api.post<void>(`/proposals/${id}/reject`);
    return response.data;
  },
};
