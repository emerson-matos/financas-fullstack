export type Database = {
  public: {
    Tables: {
      user_accounts: {
        Row: {
          id: string;
          user_id: string;
          identification: string;
          kind: "CHECKING" | "SAVINGS" | "INVESTMENT" | "CREDIT_CARD" | "UNKNOWN";
          currency: string;
          initial_amount: number;
          current_amount: number;
          created_at: string;
          updated_at: string;
          created_by: string;
          updated_by: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          identification: string;
          kind?: "CHECKING" | "SAVINGS" | "INVESTMENT" | "CREDIT_CARD" | "UNKNOWN";
          currency?: string;
          initial_amount?: number;
          current_amount?: number;
          created_at?: string;
          updated_at?: string;
          created_by: string;
          updated_by?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          identification?: string;
          kind?: "CHECKING" | "SAVINGS" | "INVESTMENT" | "CREDIT_CARD" | "UNKNOWN";
          currency?: string;
          initial_amount?: number;
          current_amount?: number;
          created_at?: string;
          updated_at?: string;
          created_by?: string;
          updated_by?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          user_id: string;
          created_at: string;
          updated_at: string;
          created_by: string;
          updated_by: string;
        };
        Insert: {
          id?: string;
          name: string;
          user_id: string;
          created_at?: string;
          updated_at?: string;
          created_by: string;
          updated_by?: string;
        };
        Update: {
          id?: string;
          name?: string;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
          created_by?: string;
          updated_by?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          account_id: string;
          category_id: string | null;
          description: string;
          amount: number;
          kind: "INCOME" | "EXPENSE";
          transacted_date: string;
          created_at: string;
          updated_at: string;
          created_by: string;
          updated_by: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          category_id?: string | null;
          description: string;
          amount: number;
          kind: "INCOME" | "EXPENSE";
          transacted_date: string;
          created_at?: string;
          updated_at?: string;
          created_by: string;
          updated_by?: string;
        };
        Update: {
          id?: string;
          account_id?: string;
          category_id?: string | null;
          description?: string;
          amount?: number;
          kind?: "INCOME" | "EXPENSE";
          transacted_date?: string;
          created_at?: string;
          updated_at?: string;
          created_by?: string;
          updated_by?: string;
        };
      };
      budgets: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          limit_amount: number;
          period: "MONTHLY" | "QUARTERLY" | "YEARLY";
          created_at: string;
          updated_at: string;
          created_by: string;
          updated_by: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          limit_amount: number;
          period?: "MONTHLY" | "QUARTERLY" | "YEARLY";
          created_at?: string;
          updated_at?: string;
          created_by: string;
          updated_by?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          limit_amount?: number;
          period?: "MONTHLY" | "QUARTERLY" | "YEARLY";
          created_at?: string;
          updated_at?: string;
          created_by?: string;
          updated_by?: string;
        };
      };
      budget_items: {
        Row: {
          id: string;
          budget_id: string;
          category_id: string;
          limit_amount: number;
          created_at: string;
          updated_at: string;
          created_by: string;
          updated_by: string;
        };
        Insert: {
          id?: string;
          budget_id: string;
          category_id: string;
          limit_amount: number;
          created_at?: string;
          updated_at?: string;
          created_by: string;
          updated_by?: string;
        };
        Update: {
          id?: string;
          budget_id?: string;
          category_id?: string;
          limit_amount?: number;
          created_at?: string;
          updated_at?: string;
          created_by?: string;
          updated_by?: string;
        };
      };
      transaction_splits: {
        Row: {
          id: string;
          transaction_id: string;
          category_id: string;
          amount: number;
          created_at: string;
          updated_at: string;
          created_by: string;
          updated_by: string;
        };
        Insert: {
          id?: string;
          transaction_id: string;
          category_id: string;
          amount: number;
          created_at?: string;
          updated_at?: string;
          created_by: string;
          updated_by?: string;
        };
        Update: {
          id?: string;
          transaction_id?: string;
          category_id?: string;
          amount?: number;
          created_at?: string;
          updated_at?: string;
          created_by?: string;
          updated_by?: string;
        };
      };
      app_groups: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          updated_at: string;
          created_by: string;
          updated_by: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
          updated_at?: string;
          created_by: string;
          updated_by?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
          created_by?: string;
          updated_by?: string;
        };
      };
      group_memberships: {
        Row: {
          id: string;
          group_id: string;
          user_id: string;
          created_at: string;
          updated_at: string;
          created_by: string;
          updated_by: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          user_id: string;
          created_at?: string;
          updated_at?: string;
          created_by: string;
          updated_by?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
          created_by?: string;
          updated_by?: string;
        };
      };
      transaction_categorization_jobs: {
        Row: {
          id: string;
          user_id: string;
          status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
          error_message: string | null;
          created_at: string;
          updated_at: string;
          created_by: string;
          updated_by: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          status?: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by: string;
          updated_by?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          status?: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string;
          updated_by?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
};
