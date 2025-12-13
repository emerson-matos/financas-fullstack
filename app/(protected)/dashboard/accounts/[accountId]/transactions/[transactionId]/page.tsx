import { TransactionDetails } from "@/components/pages/dashboard/transactions/transaction-details";

export default async function AccountTransactionDetailsPage({
  params,
}: {
  params: Promise<{ accountId: string; transactionId: string }>;
}) {
  const { transactionId } = await params;
  return (
    <TransactionDetails
      transactionId={transactionId}
      editUrl={`/dashboard/transactions/${transactionId}/edit`}
    />
  );
}
