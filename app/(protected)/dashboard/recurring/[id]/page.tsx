import { RecurringDetail } from "@/components/pages/dashboard/recurring/recurring-detail";

export default async function RecurringDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <RecurringDetail params={params} />;
}
