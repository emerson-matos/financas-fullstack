import { TransactionDetails } from "@/components/pages/dashboard/transactions/transaction-details";

export default async function TransactionDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <TransactionDetails
      transactionId={id}
      editUrl={`/dashboard/transactions/${id}/edit`}
    />
  );
}
