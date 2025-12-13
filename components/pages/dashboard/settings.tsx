import { Heading } from "@/components/heading";
import { Separator } from "@/components/ui/separator";
import { SettingsView } from "@/components/layout/settings/settings-view";
export function Settings() {
  return (
    <div className="mx-auto space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <Heading title="Configurações" />
      <Separator />
      <SettingsView />
    </div>
  );
}
