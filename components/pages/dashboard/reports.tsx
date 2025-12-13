import { Heading } from "@/components/heading";
import { Separator } from "@/components/ui/separator";
import { ReportsView } from "@/components/layout/reports/reports-view";
export function Reports() {
  return (
    <div className="mx-auto space-y-4 sm:space-y-6 px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div className="space-y-2 sm:space-y-3">
        <Heading title="Reports" />
        <Separator />
      </div>
      <ReportsView />
    </div>
  );
}
