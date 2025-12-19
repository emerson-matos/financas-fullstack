import { UserNav } from "@/components/layout/header/user-nav";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { AppBreadcrumb } from "@/components/layout/breadcrumb/app-breadcrumb";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/60 group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-16 shrink-0 items-center justify-between gap-2 px-6 transition-[width,height,background-color] duration-300 ease-in-out">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="-ml-1 text-muted-foreground/60 transition-colors hover:text-foreground" />
        <Separator
          orientation="vertical"
          className="h-auto w-[1px] bg-border/50"
        />
        <AppBreadcrumb />
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          {/* Future slot for notifications or search */}
        </div>
        <UserNav />
      </div>
    </header>
  );
};
