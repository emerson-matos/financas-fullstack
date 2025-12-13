import { AccountEditForm } from "@/components/layout/accounts/account-edit-form";

export default async function AccountEditPage({
  params,
}: {
  params: Promise<{ accountId: string }>;
}) {
  const { accountId: id } = await params;
  return (
    <div className="container mx-auto max-w-2xl py-6">
      <AccountEditForm accountId={id} />
    </div>
  );
}
