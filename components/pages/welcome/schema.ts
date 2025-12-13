import { z } from "zod";

export const welcomeFormSchema = z.object({
  preferredCurrency: z.enum(["BRL", "USD", "EUR", "GBP", "CAD"], {
    message: "Por favor, selecione uma moeda preferida.",
  }),
  budgetingGoals: z
    .array(z.string())
    .min(1, "Selecione pelo menos um objetivo financeiro."),
  notificationPreferences: z.object({
    emailReports: z.boolean(),
    budgetAlerts: z.boolean(),
    transactionReminders: z.boolean(),
  }),
  financialGoals: z.string().optional(),
});

export type WelcomeFormData = z.infer<typeof welcomeFormSchema>;

export const budgetingOptions = [
  { id: "expense-tracking", label: "Acompanhar gastos diários" },
  { id: "savings-goals", label: "Definir e alcançar metas de economia" },
  { id: "budget-planning", label: "Criar orçamentos mensais" },
  { id: "investment-tracking", label: "Monitorar investimentos" },
  { id: "debt-management", label: "Gerenciar e quitar dívidas" },
] as const;

export const currencyOptions = ["BRL", "USD", "EUR", "GBP", "CAD"] as const;

export const notificationLabels = {
  emailReports: "Relatórios mensais por email",
  budgetAlerts: "Alertas de limite de orçamento",
  transactionReminders: "Lembretes de transações",
} as const;
