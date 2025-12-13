import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CustomerAccountForm } from "@/components/layout/settings/customer-account-form";
import { PreferencesForm } from "@/components/layout/settings/preferences-form";
import { ProfileForm } from "@/components/layout/settings/profile-form";
import { cn } from "@/lib/utils";
function SettingsItem({
  children,
  colSpan,
  title,
}: {
  children: React.ReactNode;
  colSpan: number;
  title: string;
}) {
  return (
    <Card className={cn("my-2", `col-span-${colSpan}`)}>
      <CardHeader>
        <h2 className="text-xl font-semibold">{title}</h2>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
export function SettingsView() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <SettingsItem colSpan={2} title="Perfil">
        <ProfileForm />
      </SettingsItem>
      <SettingsItem colSpan={1} title="Preferências">
        <PreferencesForm />
      </SettingsItem>
      <SettingsItem colSpan={1} title="Conta">
        <CustomerAccountForm />
      </SettingsItem>
    </div>
  );
}
