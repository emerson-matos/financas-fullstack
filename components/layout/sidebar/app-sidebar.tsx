"use client";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { useMemo } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { UserNav } from "@/components/layout/header/user-nav";
import type {
  AppSidebarProps,
  SidebarGroup as SidebarGroupType,
  SidebarMenuItem as SidebarMenuItemType,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { defaultSidebarConfig } from "@/components/layout/sidebar/sidebar-config";
import { TopHatLogo } from "@/components/top-hat-logo";
interface SidebarMenuItemComponentProps {
  item: SidebarMenuItemType;
}
function SidebarMenuItemComponent({ item }: SidebarMenuItemComponentProps) {
  const IconComponent = item.icon as LucideIcon;
  return (
    <SidebarMenuItem key={item.id}>
      <SidebarMenuButton
        tooltip={item.description || item.title}
        asChild
        disabled={item.isDisabled}
        className={cn(item.isDisabled && "opacity-50 cursor-not-allowed")}
      >
        <Link href={item.url}>
          <IconComponent className="h-4 w-4" />
          <span>{item.title}</span>
          {item.badge && (
            <span className="ml-auto text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
              {item.badge}
            </span>
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
interface SidebarGroupComponentProps {
  group: SidebarGroupType;
}
function SidebarGroupComponent({ group }: SidebarGroupComponentProps) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {group.items.map((item) => (
            <SidebarMenuItemComponent key={item.id} item={item} />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
interface SidebarHeaderComponentProps {
  brandName: string;
  brandSubtitle: string;
  homeUrl: string;
}
function SidebarHeaderComponent({
  brandName,
  brandSubtitle,
  homeUrl,
}: SidebarHeaderComponentProps) {
  return (
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" asChild>
            <Link href={homeUrl}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <TopHatLogo className="size-6" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-semibold">{brandName}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {brandSubtitle}
                </span>
              </div>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
}
export function AppSidebar({
  config = {},
  className,
  collapsible = "icon",
  ...props
}: AppSidebarProps) {
  const sidebarConfig = useMemo(
    () => ({
      ...defaultSidebarConfig,
      ...config,
      groups: config.groups || defaultSidebarConfig.groups,
    }),
    [config],
  );
  return (
    <Sidebar collapsible={collapsible} className={cn(className)} {...props}>
      <SidebarHeaderComponent
        brandName={sidebarConfig.brandName}
        brandSubtitle={sidebarConfig.brandSubtitle}
        homeUrl={sidebarConfig.homeUrl}
      />
      <SidebarContent>
        {sidebarConfig.groups.map((group) => (
          <SidebarGroupComponent key={group.id} group={group} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <UserNav />
      </SidebarFooter>
    </Sidebar>
  );
}
