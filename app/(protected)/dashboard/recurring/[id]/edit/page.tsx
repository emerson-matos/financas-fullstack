import { RecurringEdit } from "@/components/pages/dashboard/recurring/recurring-edit";

export default async function RecurringEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <RecurringEdit params={params} />;
}
