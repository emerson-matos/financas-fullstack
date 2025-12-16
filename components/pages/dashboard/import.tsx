import { Heading } from "@/components/heading";
import { DataImport } from "@/components/layout/import/data-import";
import { Separator } from "@/components/ui/separator";

export function Import() {
  return (
    <div className="mx-auto space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <Heading title="Importar dados" />
      <Separator />
      <DataImport />
    </div>
  );
}
