// This type is used to define the shape of our data.

import { z } from "zod";

export type BudgetItemInput = {
  amount: number | null;
  category: {
    id: string;
  };
};
export type BudgetItem = {
  amount: number | null;
  spent: number | null;
  id: string;
  category: {
    id: string;
    name: string;
  };
};
export type Budget = {
  budget_items: Array<BudgetItem>;
  id: string;
  name: string;
  start_date: string | number | Date;
  end_date: string | number | Date;
  is_active: boolean;
};

export interface BudgetCreatePayload {
  name: string;
  start_date: Date;
  end_date: Date;
  is_active: boolean;
  budget_items: Array<{
    category_id: string;
    amount: number;
  }>;
}

export interface BudgetCategory {
  id: string;
  name: string;
  spent: number | null;
  budget: number | null;
}

export interface BudgetCategories {
  categories: Array<BudgetCategory>;
}

export interface BudgetFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budgetId?: string;
  onSuccess?: () => void;
}

export interface BudgetDetails {
  budget: Budget;
  categories: Array<BudgetCategory>;
}

export interface UserAccount {
  id: string;
  user_id: string;
  identification: string;
  kind: "CHECKING" | "SAVINGS" | "INVESTMENT" | "CREDIT_CARD" | "CASH";
  currency: "BRL" | "USD" | "EUR" | string;
  current_amount: number;
  credit_limit?: number;
  bill_closing_day?: number;
  bill_due_day?: number;
  created_at: string;
  updated_at: string;
  deactivated_at: string | null;
}

export type Account = UserAccount;

export interface AccountCreateFormData {
  identification: string;
  kind: string;
  currency: string;
  initial_amount: number;
  credit_limit?: number;
  bill_closing_day?: number;
  bill_due_day?: number;
}

export interface Category {
  id: string;
  name: string;
  user_id: string;
  parent_id: string | null;
  deactivated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CategoryTableProps {
  data: Array<Category>;
  onEdit?: (category: Category) => void;
  onDelete?: (categoryId: string) => void;
}

export interface CategoryCreateFormData {
  name: string;
  parent_id: string | null;
}

export interface Transaction {
  id: string;
  name: string;
  description: string;
  amount: number;
  transacted_at: string | Date;
  account_id: string;
  kind: string;
  category_id: string;
  user_id: string;
  related_transaction_id?: string | null; // For linking transfer pairs
  deactivated_at: string | null;
  created_at: string | Date;
  updated_at: string | Date;
  category?: {
    id: string;
    name: string;
    parent?: {
      name: string;
    };
  };
  account?: {
    id: string;
    identification: string;
    kind: string;
    currency?: string;
    created_at: string | Date;
    updated_at: string | Date;
  };
  // For transfers: the related transaction's account
  related_transaction?: {
    id: string;
    account?: {
      id: string;
      identification: string;
    };
  };
  group_id?: string;
  splits?: Array<TransactionSplit>;
}

export interface TransactionSplit {
  id: string;
  transaction_id: string;
  category_id: string;
  amount: number;
  description?: string;
  category?: {
    id: string;
    name: string;
  };
}

export interface TimelineEntry {
  id: string;
  user_id: string;
  account_id: string | null;
  entry_type: "ACTIVITY" | "TRANSACTION";
  highlight_type: string;
  data: Record<string, unknown>;
  amount: number | null;
  currency: string | null;
  description: string | null;
  event_time: string;
}

export interface TimelineFilter {
  page?: number;
  size?: number;
  startDate?: Date;
  endDate?: Date;
  accountId?: string;
}

export interface TransactionFormData {
  description: string;
  amount: number;
  transacted_at: string;
  account_id: string;
  category_id: string;
}

export interface TransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId?: string;
  onSuccess?: () => void;
}

export interface TransactionEditFormProps {
  transactionId: string;
}

export interface TransactionDeleteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: string;
  onSuccess?: () => void;
}

export interface Report {
  id: string;
  name: string;
  type: string;
  data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ReportData {
  categories: Array<{
    name: string;
    amount: number;
    percentage: number;
  }>;
  total: number;
}

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export interface TransactionFilter {
  search?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  size?: number;
  sort?: Array<string>;
  accountId?: string;
}

export interface CreateTransactionRequest {
  accountId: string;
  categoryId?: string;
  name?: string;
  amount: number;
  description: string;
  transactedAt: string;
  currency: string;
  kind: "DEBIT" | "CREDIT" | "TRANSFER" | "UNKNOWN";
  destinationAccountId?: string;
  groupId?: string;
  splits?: Array<{
    categoryId: string;
    amount: number;
    description?: string;
  }>;
}

export interface UpdateTransactionRequest {
  accountId: string;
  destinationAccountId?: string; // For TRANSFER
  name?: string;
  description: string;
  amount: number;
  transactedAt: string;
  categoryId?: string;
  currency?: string;
  kind: "DEBIT" | "CREDIT" | "TRANSFER" | "UNKNOWN";
  groupId?: string;
  splits?: Array<{
    categoryId: string;
    amount: number;
    description?: string;
  }>;
}

export interface RecurringTemplate {
  id: string;
  user_id: string;
  account_id: string;
  category_id?: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  kind: "DEBIT" | "CREDIT" | "TRANSFER" | "UNKNOWN";
  recurrence_rule: string;
  last_generated_at?: string;
  next_occurrence?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  account?: {
    id: string;
    identification: string;
  };
  category?: {
    id: string;
    name: string;
  };
}

export interface CreateRecurringTemplateRequest {
  accountId: string;
  categoryId?: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  kind: "DEBIT" | "CREDIT" | "TRANSFER" | "UNKNOWN";
  recurrenceRule: string;
  nextOccurrence: string;
  isActive?: boolean;
}

export interface UpdateRecurringTemplateRequest {
  accountId?: string;
  categoryId?: string;
  amount?: number;
  currency?: string;
  name?: string;
  description?: string;
  kind?: "DEBIT" | "CREDIT" | "TRANSFER" | "UNKNOWN";
  recurrenceRule?: string;
  nextOccurrence?: string;
  isActive?: boolean;
}

export interface AppUserBackend {
  id: string; // UUID from auth.users
  email: string;
  name: string | null;
  picture: string | null;
  onboarding_completed: boolean;
  default_currency: string | null;
  created_at: string; // ISO date string
}

export interface AppUser {
  id: string; // UUID from auth.users
  email: string;
  name: string | null;
  picture: string | null;
  onboardingCompleted: boolean;
  defaultCurrency: string | null;
  createdAt: string; // ISO date string
}

/**
 * User profile info - compatible with both Auth0 and Supabase auth
 */
export interface UserProfileInfo {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
}

export function transformAppUser(backendUser: AppUserBackend): AppUser {
  return {
    id: backendUser.id,
    email: backendUser.email,
    name: backendUser.name,
    picture: backendUser.picture,
    onboardingCompleted: backendUser.onboarding_completed,
    defaultCurrency: backendUser.default_currency,
    createdAt: backendUser.created_at,
  };
}

export interface Sortable {
  sorted: boolean;
  unsorted: boolean;
  empty: boolean;
}

export interface Pageable {
  page_number: number;
  page_size: number;
  offset: number;
  paged: boolean;
  unpaged: boolean;
  sort: Sortable;
}

export interface PaginatedResponse<T> {
  content: T;
  total_elements: number;
  last: boolean;
  total_pages: number;
  pageable: Pageable;
  size: number;
  number: number;
}

export interface PaginationInfo {
  size: number;
  total_elements: number;
  total_pages: number;
  number: number;
}

export interface PageResponse<T> {
  content: Array<T>;
  page: PaginationInfo;
}

export interface SidebarMenuItem {
  id?: string;
  title?: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  label?: string;
  href?: string;
  isCollapsible?: boolean;
  isDisabled?: boolean;
  badge?: string | number;
  description?: string;
  subItems?: Array<{
    label: string;
    href: string;
  }>;
}

export interface SidebarGroup {
  id: string;
  label: string;
  items: Array<SidebarMenuItem>;
}

export interface AppSidebarConfig {
  brandName: string;
  brandSubtitle: string;
  homeUrl: string;
  groups: Array<SidebarGroup>;
}

export interface AppSidebarProps {
  config?: Partial<AppSidebarConfig>;
  className?: string;
  collapsible?: "icon" | "offExamples" | "none";
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface UseAccountsReturn {
  accounts: Array<UserAccount>;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UseTransactionsReturn {
  transactions: Array<Transaction>;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UseCategoriesReturn {
  categories: Array<Category>;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

// Import-related types
export interface ImportRequest {
  fileContent: string;
  fileName: string;
  fileFormat: "csv" | "ofx";
  accountId: string;
}

export interface ParsedTransaction {
  description: string;
  amount: number;
  transacted_at: string;
  kind: "DEBIT" | "CREDIT" | "TRANSFER" | "UNKNOWN";
  originalData: string;
}

export interface ImportStatistics {
  totalRecords: number;
  successfulRecords: number;
  failedRecords: number;
}

export interface ImportResult {
  transactions: Array<ParsedTransaction>;
  statistics: ImportStatistics;
  errors: Array<string>;
}

// Net Worth Report DTOs
export interface NetWorthDataPointBackend {
  year: number;
  assets: number;
  liabilities: number;
  net_worth: number;
}

export interface NetWorthReportDTOBackend {
  years: Array<number>;
  data: Array<NetWorthDataPointBackend>;
}

export interface NetWorthDataPoint {
  year: number;
  assets: number;
  liabilities: number;
  netWorth: number;
}

export interface NetWorthReportDTO {
  years: Array<number>;
  data: Array<NetWorthDataPoint>;
}

export function transformNetWorthReport(
  backend: NetWorthReportDTOBackend,
): NetWorthReportDTO {
  return {
    years: backend.years,
    data: backend.data.map((point) => ({
      year: point.year,
      assets: point.assets,
      liabilities: point.liabilities,
      netWorth: point.net_worth,
    })),
  };
}

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
  // First account configuration
  firstAccount: z.object({
    name: z.string().min(1, "Nome da conta é obrigatório"),
    kind: z.string().min(1, "Tipo de conta é obrigatório"),
    initialAmount: z.number().min(0, "Saldo não pode ser negativo"),
  }),
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

export interface Group {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  members?: Array<GroupMembership>;
}

export interface GroupMembership {
  id: string;
  group_id: string;
  user_id: string;
  user_role: "admin" | "member";
  created_at: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export interface GroupInvite {
  id: string;
  group_id: string;
  email: string;
  role: "admin" | "member";
  token: string;
  expires_at: string;
  status: "pending" | "accepted" | "declined" | "expired";
  created_at: string;
}

export interface CreateGroupInviteRequest {
  groupId: string;
  email: string;
  role: "admin" | "member";
}

export interface SplitProposal {
  id: string;
  transaction_id: string;
  group_id: string;
  split_rules?: Record<string, unknown>;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
  created_by: string;
  debts?: Array<MemberDebt>;
}

export interface MemberDebt {
  id: string;
  proposal_id: string;
  user_id: string;
  amount: number;
  status: "unpaid" | "paid";
  settled_at?: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
}
