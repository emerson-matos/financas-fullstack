import { Heading } from "@/components/heading";
import { Separator } from "@/components/ui/separator";
import { CreateAccount } from "@/components/layout/accounts/account-create";
import { AccountList } from "@/components/layout/accounts/accounts-list";
export function Accounts() {
  return (
    <div className="mx-auto space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="flex items-center justify-between">
        <Heading title="Contas" />
        <CreateAccount />
      </div>
      <Separator />
      <AccountList />
    </div>
  );
}
