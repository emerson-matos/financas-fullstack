export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  thc: {
    Tables: {
      activity_log: {
        Row: {
          account_id: string | null
          created_at: string | null
          created_by: string | null
          data: Json | null
          id: string
          type: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          created_at?: string | null
          created_by?: string | null
          data?: Json | null
          id?: string
          type: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          created_at?: string | null
          created_by?: string | null
          data?: Json | null
          id?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "user_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_log_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "user_accounts_with_balance"
            referencedColumns: ["id"]
          },
        ]
      }
      app_groups: {
        Row: {
          created_at: string | null
          created_by: string | null
          deactivated_at: string | null
          description: string | null
          id: string
          last_modified_by: string | null
          name: string
          split_rules: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          deactivated_at?: string | null
          description?: string | null
          id?: string
          last_modified_by?: string | null
          name: string
          split_rules?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          deactivated_at?: string | null
          description?: string | null
          id?: string
          last_modified_by?: string | null
          name?: string
          split_rules?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      budget_items: {
        Row: {
          amount: number
          budget_id: string
          category_id: string
          created_at: string | null
          created_by: string | null
          id: string
          last_modified_by: string | null
          updated_at: string | null
        }
        Insert: {
          amount?: number
          budget_id: string
          category_id: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          last_modified_by?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          budget_id?: string
          category_id?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          last_modified_by?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_items_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          created_at: string | null
          created_by: string | null
          deactivated_at: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          last_modified_by: string | null
          name: string
          start_date: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          deactivated_at?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          last_modified_by?: string | null
          name: string
          start_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          deactivated_at?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          last_modified_by?: string | null
          name?: string
          start_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          last_modified_by: string | null
          name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          last_modified_by?: string | null
          name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          last_modified_by?: string | null
          name?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      group_invites: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string
          group_id: string
          id: string
          role: string
          status: string
          token: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at: string
          group_id: string
          id?: string
          role?: string
          status?: string
          token: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string
          group_id?: string
          id?: string
          role?: string
          status?: string
          token?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_invites_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "app_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_memberships: {
        Row: {
          created_at: string | null
          created_by: string | null
          deactivated_at: string | null
          group_id: string
          id: string
          last_modified_by: string | null
          updated_at: string | null
          user_id: string | null
          user_role: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          deactivated_at?: string | null
          group_id: string
          id?: string
          last_modified_by?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          deactivated_at?: string | null
          group_id?: string
          id?: string
          last_modified_by?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_memberships_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "app_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      member_debts: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          proposal_id: string
          settled_at: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          proposal_id: string
          settled_at?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          proposal_id?: string
          settled_at?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_debts_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "split_proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_templates: {
        Row: {
          account_id: string
          amount: number
          category_id: string | null
          created_at: string | null
          created_by: string | null
          currency: string
          description: string | null
          id: string
          is_active: boolean | null
          kind: string
          last_modified_by: string | null
          name: string
          next_occurrence: string
          recurrence_rule: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          account_id: string
          amount?: number
          category_id?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          kind: string
          last_modified_by?: string | null
          name: string
          next_occurrence: string
          recurrence_rule: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          account_id?: string
          amount?: number
          category_id?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          kind?: string
          last_modified_by?: string | null
          name?: string
          next_occurrence?: string
          recurrence_rule?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recurring_templates_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "user_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_templates_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "user_accounts_with_balance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_templates_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string | null
          data: Json
          id: string
          name: string
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data: Json
          id?: string
          name: string
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json
          id?: string
          name?: string
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      split_proposals: {
        Row: {
          created_at: string | null
          created_by: string | null
          group_id: string
          id: string
          split_rules: Json | null
          status: string
          transaction_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          group_id: string
          id?: string
          split_rules?: Json | null
          status?: string
          transaction_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          group_id?: string
          id?: string
          split_rules?: Json | null
          status?: string
          transaction_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "split_proposals_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "app_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "split_proposals_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_categorization_jobs: {
        Row: {
          created_at: string | null
          created_by: string | null
          error_message: string | null
          id: string
          last_modified_by: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          error_message?: string | null
          id?: string
          last_modified_by?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          error_message?: string | null
          id?: string
          last_modified_by?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      transaction_splits: {
        Row: {
          amount: number
          category_id: string
          created_at: string | null
          description: string | null
          id: string
          transaction_id: string
          updated_at: string | null
        }
        Insert: {
          amount?: number
          category_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          transaction_id: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          category_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          transaction_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transaction_splits_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_splits_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          account_id: string
          amount: number
          category_id: string | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          deactivated_at: string | null
          description: string | null
          group_id: string | null
          id: string
          kind: string | null
          label: string | null
          last_modified_by: string | null
          name: string | null
          opts: string | null
          related_transaction_id: string | null
          transacted_at: string
          updated_at: string | null
        }
        Insert: {
          account_id: string
          amount?: number
          category_id?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          deactivated_at?: string | null
          description?: string | null
          group_id?: string | null
          id?: string
          kind?: string | null
          label?: string | null
          last_modified_by?: string | null
          name?: string | null
          opts?: string | null
          related_transaction_id?: string | null
          transacted_at?: string
          updated_at?: string | null
        }
        Update: {
          account_id?: string
          amount?: number
          category_id?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          deactivated_at?: string | null
          description?: string | null
          group_id?: string | null
          id?: string
          kind?: string | null
          label?: string | null
          last_modified_by?: string | null
          name?: string | null
          opts?: string | null
          related_transaction_id?: string | null
          transacted_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "user_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "user_accounts_with_balance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "app_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_related_transaction_id_fkey"
            columns: ["related_transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_accounts: {
        Row: {
          bill_closing_day: number | null
          bill_due_day: number | null
          created_at: string | null
          created_by: string | null
          credit_limit: number | null
          currency: string | null
          deactivated_at: string | null
          group_id: string | null
          id: string
          identification: string
          kind: string | null
          last_modified_by: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          bill_closing_day?: number | null
          bill_due_day?: number | null
          created_at?: string | null
          created_by?: string | null
          credit_limit?: number | null
          currency?: string | null
          deactivated_at?: string | null
          group_id?: string | null
          id?: string
          identification: string
          kind?: string | null
          last_modified_by?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          bill_closing_day?: number | null
          bill_due_day?: number | null
          created_at?: string | null
          created_by?: string | null
          credit_limit?: number | null
          currency?: string | null
          deactivated_at?: string | null
          group_id?: string | null
          id?: string
          identification?: string
          kind?: string | null
          last_modified_by?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_accounts_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "app_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          budgeting_goals: Json | null
          created_at: string | null
          default_currency: string | null
          financial_goals: string | null
          id: string
          notification_preferences: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          budgeting_goals?: Json | null
          created_at?: string | null
          default_currency?: string | null
          financial_goals?: string | null
          id?: string
          notification_preferences?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          budgeting_goals?: Json | null
          created_at?: string | null
          default_currency?: string | null
          financial_goals?: string | null
          id?: string
          notification_preferences?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      budget_items_with_spent: {
        Row: {
          budget_id: string | null
          category_id: string | null
          id: string | null
          planned: number | null
          spent: number | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_items_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      unified_timeline: {
        Row: {
          account_id: string | null
          amount: number | null
          currency: string | null
          data: Json | null
          description: string | null
          entry_type: string | null
          event_time: string | null
          highlight_type: string | null
          id: string | null
          user_id: string | null
        }
        Relationships: []
      }
      user_accounts_with_balance: {
        Row: {
          bill_closing_day: number | null
          bill_due_day: number | null
          created_at: string | null
          created_by: string | null
          credit_limit: number | null
          currency: string | null
          current_amount: number | null
          deactivated_at: string | null
          group_id: string | null
          id: string | null
          identification: string | null
          kind: string | null
          last_modified_by: string | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_accounts_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "app_groups"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      create_budget_with_items: {
        Args: {
          p_budget_items?: Json
          p_end_date: string
          p_is_active?: boolean
          p_name: string
          p_start_date: string
        }
        Returns: string
      }
      get_user_metadata: { Args: { user_uuid?: string }; Returns: Json }
      is_onboarding_completed: {
        Args: { user_uuid?: string }
        Returns: boolean
      }
      update_budget_with_items: {
        Args: {
          p_budget_id: string
          p_budget_items?: Json
          p_end_date: string
          p_is_active?: boolean
          p_name: string
          p_start_date: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
  thc: {
    Enums: {},
  },
} as const

