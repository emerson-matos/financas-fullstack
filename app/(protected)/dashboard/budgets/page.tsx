import { Budgets } from "@/components/pages/dashboard/budgets";

export default async function BudgetsPage({
  params,
}: {
  params: Promise<{ action: "create" }>;
}) {
  const { action } = await params;
  return <Budgets action={action} />;
}
