import { useInfiniteQuery } from "@tanstack/react-query";
import { timelineService } from "@/lib/services/timeline";
import type { TimelineFilter } from "@/lib/types";

export const useTimeline = (params: TimelineFilter = {}) => {
  const pageSize = params.size || 20;
  
  return useInfiniteQuery({
    queryKey: ["timeline", { ...params, size: pageSize }],
    queryFn: ({ pageParam = 0 }) => 
      timelineService.getTimeline({ ...params, page: pageParam, size: pageSize }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.page.number + 1;
      return nextPage < lastPage.page.total_pages ? nextPage : undefined;
    },
  });
};
