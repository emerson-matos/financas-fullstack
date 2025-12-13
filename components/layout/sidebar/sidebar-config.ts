import {
  ArrowLeftRight,
  ClipboardEditIcon,
  Home,
  Inbox,
  RepeatIcon,
  Settings,
  ShieldQuestionIcon,
  UploadCloud,
} from "lucide-react";

import type { AppSidebarConfig } from "@/lib/types";

export const defaultSidebarConfig: AppSidebarConfig = {
  brandName: "TopHat",
  brandSubtitle: "Company",
  homeUrl: "/dashboard/home",
  groups: [
    {
      id: "main",
      label: "Páginas",
      items: [
        {
          id: "dashboard",
          title: "Dashboard",
          url: "/dashboard/home",
          icon: Home,
          description: "Visão geral da conta",
        },
        {
          id: "accounts",
          title: "Contas",
          url: "/dashboard/accounts",
          icon: Inbox,
          description: "Gerenciar suas contas",
        },
        {
          id: "transactions",
          title: "Transações",
          url: "/dashboard/transactions",
          icon: ArrowLeftRight,
          description: "Visualizar e gerenciar transações",
        },
        {
          id: "budgets",
          title: "Orçamentos",
          url: "/dashboard/budgets",
          icon: ShieldQuestionIcon,
          description: "Gerenciar orçamentos",
        },
        {
          id: "export",
          title: "Exportar",
          url: "/dashboard/export",
          icon: ClipboardEditIcon,
          description: "Exportar dados",
        },
        {
          id: "import",
          title: "Importar",
          url: "/dashboard/import",
          icon: UploadCloud,
          description: "Importar dados",
        },
        {
          id: "reports",
          title: "Relatórios",
          url: "/dashboard/reports",
          icon: RepeatIcon,
          description: "Visualizar relatórios",
        },
        {
          id: "settings",
          title: "Configurações",
          url: "/dashboard/settings",
          icon: Settings,
          description: "Configurações da aplicação",
        },
      ],
    },
  ],
};
