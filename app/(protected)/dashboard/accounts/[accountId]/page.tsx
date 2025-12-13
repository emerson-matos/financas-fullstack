import { AccountDetails } from "@/components/pages/accounts/accounts-details";

export default async function Route({
  params,
}: {
  params: Promise<{ accountId: string }>;
}) {
  const { accountId } = await params;
  return <AccountDetails id={accountId} />;
}
