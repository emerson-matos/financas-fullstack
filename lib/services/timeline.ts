import type { PageResponse, TimelineEntry, TimelineFilter } from "@/lib/types";
import { api } from "@/lib/api";

export const timelineService = {
  async getTimeline(params: TimelineFilter = {}) {
    const response = await api.get<PageResponse<TimelineEntry>>("/timeline", {
      params: {
        page: params.page,
        size: params.size,
        start_date: params.startDate?.toISOString().split("T")[0],
        end_date: params.endDate?.toISOString().split("T")[0],
        account_id: params.accountId,
      },
    });
    return response.data;
  },
};
