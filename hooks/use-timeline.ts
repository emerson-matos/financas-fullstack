import { useQuery } from "@tanstack/react-query";
import { timelineService } from "@/lib/services/timeline";
import type { TimelineFilter } from "@/lib/types";

export const useTimeline = (params: TimelineFilter = {}) => {
  return useQuery({
    queryKey: ["timeline", params],
    queryFn: () => timelineService.getTimeline(params),
    select: (data) => data.content,
  });
};
