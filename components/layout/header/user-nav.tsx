"use client";
import Link from "next/link";

import {
  Bell,
  Check,
  ChevronsUpDown,
  CreditCard,
  HelpCircle,
  LogOut,
  MessageSquare,
  Monitor,
  Moon,
  Settings,
  Sparkles,
  Sun,
  User,
} from "lucide-react";
import { useTheme } from "next-themes";
import { LogoutButton } from "@/components/logout-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useUser } from "@/hooks/use-user";

// Helper to get user initials
function getUserInitials(name?: string): string {
  if (!name) {
    return "U";
  }
  return name
    .trim()
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function UserNav() {
  const { isMobile } = useSidebar();
  const { data: user, isLoading } = useUser();
  const { theme, setTheme } = useTheme();

  const initials = getUserInitials(user?.name ?? undefined);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-2">
        <div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
        <div className="flex-1 space-y-1">
          <div className="h-3 w-20 animate-pulse rounded bg-muted" />
          <div className="h-2 w-32 animate-pulse rounded bg-muted" />
        </div>
      </div>
    );
  }
  return (
    user && (
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground transition-all duration-200"
              >
                <Avatar className="h-8 w-8 rounded-lg border border-primary/10">
                  <AvatarImage
                    src={user?.picture ?? ""}
                    alt={user?.name ?? ""}
                  />
                  <AvatarFallback className="rounded-lg bg-linear-to-br from-primary/20 to-primary/5 text-primary text-[10px] font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-semibold">{user.name}</span>
                    {/* TODO: Implement real subscription/tier logic. Currently hardcoded for UI demo. */}
                    <span className="flex h-3.5 items-center rounded-sm bg-primary/10 px-1 text-[8px] font-bold tracking-wider text-primary uppercase ring-1 ring-primary/20">
                      PRO
                    </span>
                  </div>
                  <span className="truncate text-xs text-muted-foreground/70">
                    {user.email}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto flex size-4 shrink-0 opacity-50" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl p-2 shadow-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg border border-primary/10">
                    <AvatarImage
                      src={user?.picture ?? ""}
                      alt={user?.name ?? ""}
                    />
                    <AvatarFallback className="rounded-lg bg-linear-to-br from-primary/20 to-primary/5 text-primary text-[10px] font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-semibold">
                        {user.name}
                      </span>
                      {/* TODO: Implement real subscription/tier logic. */}
                      <span className="flex h-3.5 items-center rounded-sm bg-primary/10 px-1 text-[8px] font-bold tracking-wider text-primary uppercase ring-1 ring-primary/20">
                        PRO
                      </span>
                    </div>
                    <span className="truncate text-xs text-muted-foreground/70">
                      {user.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="my-1 ring-1 ring-border/50" />
              <DropdownMenuGroup>
                <DropdownMenuItem className="gap-2 rounded-md transition-colors cursor-pointer">
                  <Sparkles className="size-4 text-amber-500" />
                  Atualizar para Pro
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="my-1 ring-1 ring-border/50" />
              <DropdownMenuGroup>
                <DropdownMenuLabel className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
                  Conta
                </DropdownMenuLabel>
                <DropdownMenuItem
                  asChild
                  className="gap-2 rounded-md transition-colors cursor-pointer"
                >
                  <Link href="/dashboard/settings">
                    <User className="size-4 opacity-70" />
                    Perfil
                    <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="gap-2 rounded-md transition-colors cursor-pointer"
                >
                  <Link href="/dashboard/settings">
                    <CreditCard className="size-4 opacity-70" />
                    {/* TODO: Implement real subscription management */}
                    Assinatura
                    <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="gap-2 rounded-md transition-colors cursor-pointer"
                >
                  <Link href="/dashboard/settings">
                    <Settings className="size-4 opacity-70" />
                    Configurações
                    <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="gap-2 rounded-md transition-colors cursor-pointer"
                >
                  <Link href="/dashboard/settings">
                    <Bell className="size-4 opacity-70" />
                    {/* TODO: Implement notifications system */}
                    Notificações
                    <DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="my-1 ring-1 ring-border/50" />
              <DropdownMenuGroup>
                <DropdownMenuLabel className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
                  Preferências
                </DropdownMenuLabel>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="gap-2 rounded-md transition-colors cursor-pointer">
                    <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 opacity-70" />
                    <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 opacity-70" />
                    <span>Aparência</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent className="rounded-xl p-2 shadow-lg side-offset-4">
                      <DropdownMenuItem
                        onClick={() => setTheme("light")}
                        className="gap-2 rounded-md transition-colors cursor-pointer"
                      >
                        <Sun className="size-4 opacity-70" />
                        Claro
                        {theme === "light" && (
                          <Check className="ml-auto size-4" />
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setTheme("dark")}
                        className="gap-2 rounded-md transition-colors cursor-pointer"
                      >
                        <Moon className="size-4 opacity-70" />
                        Escuro
                        {theme === "dark" && (
                          <Check className="ml-auto size-4" />
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setTheme("system")}
                        className="gap-2 rounded-md transition-colors cursor-pointer"
                      >
                        <Monitor className="size-4 opacity-70" />
                        Sistema
                        {theme === "system" && (
                          <Check className="ml-auto size-4" />
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="my-1 ring-1 ring-border/50" />
              <DropdownMenuGroup>
                <DropdownMenuLabel className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
                  Explorar
                </DropdownMenuLabel>
                <DropdownMenuItem className="gap-2 rounded-md transition-colors cursor-pointer">
                  <HelpCircle className="size-4 opacity-70" />
                  {/* TODO: Create help center page */}
                  Central de Ajuda
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 rounded-md transition-colors cursor-pointer">
                  <MessageSquare className="size-4 opacity-70" />
                  {/* TODO: Implement feedback collection flow */}
                  Enviar Feedback
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="my-1 ring-1 ring-border/50" />
              <LogoutButton asChild>
                <DropdownMenuItem className="gap-2 rounded-md text-destructive focus:bg-destructive/10 focus:text-destructive transition-colors cursor-pointer">
                  <LogOut className="size-4" />
                  Sair
                  <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                </DropdownMenuItem>
              </LogoutButton>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  );
}
