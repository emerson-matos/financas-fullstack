import type {
  RecurringTemplate,
  CreateRecurringTemplateRequest,
  UpdateRecurringTemplateRequest,
  PageResponse,
} from "@/lib/types";

import { api } from "@/lib/api";

export const recurringService = {
  async getTemplates() {
    const response = await api.get<PageResponse<RecurringTemplate>>(
      "/recurring-templates",
    );
    return response.data;
  },

  async getTemplate(id: string) {
    const response = await api.get<RecurringTemplate>(
      `/recurring-templates/${id}`,
    );
    return response.data;
  },

  async createTemplate(data: CreateRecurringTemplateRequest) {
    const response = await api.post<RecurringTemplate>(
      "/recurring-templates",
      data,
    );
    return response.data;
  },

  async updateTemplate(id: string, data: UpdateRecurringTemplateRequest) {
    const response = await api.put<RecurringTemplate>(
      `/recurring-templates/${id}`,
      data,
    );
    return response.data;
  },

  async deleteTemplate(id: string) {
    await api.delete(`/recurring-templates/${id}`);
  },
};
