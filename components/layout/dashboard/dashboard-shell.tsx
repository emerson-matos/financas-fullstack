import type React from "react";
import { cn } from "@/lib/utils";
type DashboardShellProps = React.HTMLAttributes<HTMLDivElement>;
export function DashboardShell({
  children,
  className,
  ...props
}: DashboardShellProps) {
  return (
    <div className={cn("flex min-h-screen flex-col", className)} {...props}>
      <div className="flex-1 items-start md:grid md:gap-6 lg:gap-10">
        <main className="flex w-full flex-col gap-4">{children}</main>
      </div>
    </div>
  );
}
