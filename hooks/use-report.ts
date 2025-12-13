import { useQuery } from "@tanstack/react-query";

import { reportService } from "@/lib/services/reports";

export const useReport = (type: string) => {
  return useQuery({
    queryKey: ["report", type],
    queryFn: () => reportService.getReport(type),
    enabled: !!type,
  });
};
