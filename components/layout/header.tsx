// import { Search } from 'lucide-react';
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { AppBreadcrumb } from "@/components/layout/breadcrumb/app-breadcrumb";
// import SearchInput from '../search-input';
export const Header = () => {
  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <AppBreadcrumb />
      </div>
      <div className="flex items-center gap-2 px-4">
        {/* <div className="hidden md:flex"> */}
        {/* <Search /> */}
        {/* <SearchInput /> */}
        {/* </div> */}
        <ThemeToggle />
      </div>
    </header>
  );
};
