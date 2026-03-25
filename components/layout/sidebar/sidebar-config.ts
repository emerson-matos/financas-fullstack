import {
  ArrowLeftRight,
  BarChart3,
  Clock,
  Download,
  Home,
  Repeat,
  Settings,
  Target,
  UploadCloud,
  Users,
  Wallet,
} from "lucide-react";

import type { AppSidebarConfig } from "@/lib/types";

export const defaultSidebarConfig: AppSidebarConfig = {
  brandName: "TopHat",
  brandSubtitle: "Finanças",
  homeUrl: "/dashboard/home",
  groups: [
    {
      id: "inicio",
      label: "Início",
      items: [
        {
          id: "resumo",
          title: "Resumo",
          url: "/dashboard/home",
          icon: Home,
          description: "Visão geral das suas finanças",
        },
      ],
    },
    {
      id: "financas",
      label: "Minhas Finanças",
      items: [
        {
          id: "transactions",
          title: "Transações",
          url: "/dashboard/transactions",
          icon: ArrowLeftRight,
          description: "Todas as movimentações",
        },
        {
          id: "accounts",
          title: "Contas",
          url: "/dashboard/accounts",
          icon: Wallet,
          description: "Bancos e cartões",
        },
        {
          id: "recurring",
          title: "Gastos Fixos",
          url: "/dashboard/recurring",
          icon: Repeat,
          description: "Assinaturas e despesas fixas",
        },
        {
          id: "budgets",
          title: "Metas",
          url: "/dashboard/budgets",
          icon: Target,
          description: "Limites de gastos",
        },
      ],
    },
    {
      id: "analises",
      label: "Análises",
      items: [
        {
          id: "timeline",
          title: "Histórico",
          url: "/dashboard/timeline",
          icon: Clock,
          description: "Linha do tempo das atividades",
        },
        {
          id: "reports",
          title: "Análises",
          url: "/dashboard/reports",
          icon: BarChart3,
          description: "Relatórios e gráficos",
        },
      ],
    },
    {
      id: "dados",
      label: "Dados",
      items: [
        {
          id: "import",
          title: "Importar",
          url: "/dashboard/import",
          icon: UploadCloud,
          description: "Importar transações",
        },
        {
          id: "export",
          title: "Exportar",
          url: "/dashboard/export",
          icon: Download,
          description: "Exportar dados",
        },
      ],
    },
    {
      id: "contas-compartilhadas",
      label: "Contas Compartilhadas",
      items: [
        {
          id: "groups",
          title: "Grupos",
          url: "/dashboard/groups",
          icon: Users,
          description: "Finanças compartilhadas",
        },
      ],
    },
    {
      id: "sistema",
      label: "Sistema",
      items: [
        {
          id: "settings",
          title: "Configurações",
          url: "/dashboard/settings",
          icon: Settings,
          description: "Preferências do app",
        },
      ],
    },
  ],
};
