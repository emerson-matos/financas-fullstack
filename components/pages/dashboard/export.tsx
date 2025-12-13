import { Heading } from "@/components/heading";
import { Separator } from "@/components/ui/separator";
import { DataExport } from "@/components/layout/export/data-export";
export function Export() {
  return (
    <div className="mx-auto space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <Heading title="Exportar dados" />
      <Separator />
      <DataExport />
    </div>
  );
}
