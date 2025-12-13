import { api } from "@/lib/api";
import type { NetWorthDataPoint, NetWorthReportDTOBackend } from "@/lib/types";
import { transformNetWorthReport } from "@/lib/types";

export const reportService = {
  getReport: async (
    type: string,
  ): Promise<Array<NetWorthDataPoint> | unknown> => {
    const { data } = await api.get(`/reports/${type}`);
    if (type === "net-worth") {
      return transformNetWorthReport(data as NetWorthReportDTOBackend);
    }
    return data;
  },
};
