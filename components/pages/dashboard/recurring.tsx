import { Plus, RepeatIcon } from "lucide-react";
import { RecurringList } from "@/components/layout/recurring/recurring-list";
import { Heading } from "@/components/heading";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Recurring() {
  return (
    <div className="mx-auto space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="flex items-center justify-between">
        <Heading
          title={"Recorrências"}
          description="Gerencie suas transações automáticas e templates recorrentes"
        />

        <Button asChild>
          <Link href="/dashboard/recurring/new">
            <Plus className="h-4 w-4" />
            Novo Template
          </Link>
        </Button>
      </div>
      <RecurringList />
    </div>
  );
}
