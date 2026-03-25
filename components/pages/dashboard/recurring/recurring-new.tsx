"use client";

import { useRouter } from "next/navigation";
import { Heading } from "@/components/heading";
import { Separator } from "@/components/ui/separator";
import { RecurringTemplateForm } from "@/components/layout/recurring/recurring-template-form";
import { BackButton } from "@/components/back-button";

export function RecurringNew() {
  const router = useRouter();

  return (
    <div className="mx-auto space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="flex items-center justify-between">
        <Heading
          title="Novo Template Recorrente"
          description="Crie um template para transações automáticas"
        />
        <BackButton />
      </div>
      <Separator />
      <RecurringTemplateForm onSuccess={() => router.push("/dashboard/recurring")} />
    </div>
  );
}