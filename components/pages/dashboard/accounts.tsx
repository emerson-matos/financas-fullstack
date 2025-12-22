"use client";

import { Heading } from "@/components/heading";
import { Separator } from "@/components/ui/separator";
import { AccountsGrid } from "@/components/layout/accounts/accounts-grid";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export function Accounts() {
  const router = useRouter();
  return (
    <div className="mx-auto space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="flex items-center justify-between">
        <Heading title="Contas" />
        <Button onClick={() => router.push("/dashboard/accounts/new")}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Nova Conta
        </Button>
      </div>
      <Separator />
      <AccountsGrid />
    </div>
  );
}
