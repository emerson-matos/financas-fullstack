import { TransactionEdit } from "@/components/pages/dashboard/transactions/transaction-edit";

export default async function EditTransactionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TransactionEdit transactionId={id} />;
}
