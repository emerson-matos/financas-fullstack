export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: string;
          name: string;
          slug: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name: string;
          slug: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name?: string;
          slug?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          created_at: string | null;
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          subtotal: number | null;
          unit_price: number;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          order_id: string;
          product_id: string;
          quantity: number;
          subtotal?: number | null;
          unit_price: number;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          order_id?: string;
          product_id?: string;
          quantity?: number;
          subtotal?: number | null;
          unit_price?: number;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          confirmed_at: string | null;
          confirmed_by: string | null;
          created_at: string | null;
          id: string;
          notes: string | null;
          status: string;
          user_id: string;
        };
        Insert: {
          confirmed_at?: string | null;
          confirmed_by?: string | null;
          created_at?: string | null;
          id?: string;
          notes?: string | null;
          status?: string;
          user_id: string;
        };
        Update: {
          confirmed_at?: string | null;
          confirmed_by?: string | null;
          created_at?: string | null;
          id?: string;
          notes?: string | null;
          status?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_confirmed_by_fkey";
            columns: ["confirmed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      product_images: {
        Row: {
          created_at: string | null;
          id: string;
          image_url: string;
          is_primary: boolean | null;
          product_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          image_url: string;
          is_primary?: boolean | null;
          product_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          image_url?: string;
          is_primary?: boolean | null;
          product_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      product_suppliers: {
        Row: {
          product_id: string;
          supplier_id: string;
        };
        Insert: {
          product_id: string;
          supplier_id: string;
        };
        Update: {
          product_id?: string;
          supplier_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_suppliers_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_suppliers_supplier_id_fkey";
            columns: ["supplier_id"];
            isOneToOne: false;
            referencedRelation: "suppliers";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          category_id: string | null;
          cost_price: number | null;
          created_at: string | null;
          description: string | null;
          id: string;
          max_stock_level: number | null;
          min_stock_level: number;
          name: string;
          rating: number | null;
          sale_price: number;
          sku: string;
          status: string;
          stock_quantity: number;
          updated_at: string | null;
        };
        Insert: {
          category_id?: string | null;
          cost_price?: number | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          max_stock_level?: number | null;
          min_stock_level?: number;
          name: string;
          rating?: number | null;
          sale_price: number;
          sku: string;
          status?: string;
          stock_quantity?: number;
          updated_at?: string | null;
        };
        Update: {
          category_id?: string | null;
          cost_price?: number | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          max_stock_level?: number | null;
          min_stock_level?: number;
          name?: string;
          rating?: number | null;
          sale_price?: number;
          sku?: string;
          status?: string;
          stock_quantity?: number;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          address: string | null;
          created_at: string | null;
          full_name: string | null;
          id: string;
          phone: string | null;
          role: string;
        };
        Insert: {
          address?: string | null;
          created_at?: string | null;
          full_name?: string | null;
          id: string;
          phone?: string | null;
          role?: string;
        };
        Update: {
          address?: string | null;
          created_at?: string | null;
          full_name?: string | null;
          id?: string;
          phone?: string | null;
          role?: string;
        };
        Relationships: [];
      };
      purchase_items: {
        Row: {
          cost_price: number;
          created_at: string | null;
          id: string;
          product_id: string;
          purchase_id: string;
          quantity: number;
          total_cost: number | null;
        };
        Insert: {
          cost_price: number;
          created_at?: string | null;
          id?: string;
          product_id: string;
          purchase_id: string;
          quantity: number;
          total_cost?: number | null;
        };
        Update: {
          cost_price?: number;
          created_at?: string | null;
          id?: string;
          product_id?: string;
          purchase_id?: string;
          quantity?: number;
          total_cost?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "purchase_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "purchase_items_purchase_id_fkey";
            columns: ["purchase_id"];
            isOneToOne: false;
            referencedRelation: "purchases";
            referencedColumns: ["id"];
          },
        ];
      };
      purchases: {
        Row: {
          created_at: string | null;
          id: string;
          notes: string | null;
          purchase_date: string;
          supplier_id: string | null;
          total_amount: number;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          notes?: string | null;
          purchase_date?: string;
          supplier_id?: string | null;
          total_amount?: number;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          notes?: string | null;
          purchase_date?: string;
          supplier_id?: string | null;
          total_amount?: number;
        };
        Relationships: [
          {
            foreignKeyName: "purchases_supplier_id_fkey";
            columns: ["supplier_id"];
            isOneToOne: false;
            referencedRelation: "suppliers";
            referencedColumns: ["id"];
          },
        ];
      };
      stock_movements: {
        Row: {
          created_at: string | null;
          id: string;
          product_id: string;
          quantity: number;
          reference_id: string | null;
          reference_type: string;
          type: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          product_id: string;
          quantity: number;
          reference_id?: string | null;
          reference_type: string;
          type: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          product_id?: string;
          quantity?: number;
          reference_id?: string | null;
          reference_type?: string;
          type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "stock_movements_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      suppliers: {
        Row: {
          address: string | null;
          contact: string | null;
          created_at: string | null;
          id: string;
          name: string;
        };
        Insert: {
          address?: string | null;
          contact?: string | null;
          created_at?: string | null;
          id?: string;
          name: string;
        };
        Update: {
          address?: string | null;
          contact?: string | null;
          created_at?: string | null;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      videos: {
        Row: {
          created_at: string;
          description: string | null;
          duration_seconds: number | null;
          id: string;
          public_url: string;
          storage_path: string;
          title: string;
          uploaded_by: string | null;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          duration_seconds?: number | null;
          id?: string;
          public_url: string;
          storage_path: string;
          title: string;
          uploaded_by?: string | null;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          duration_seconds?: number | null;
          id?: string;
          public_url?: string;
          storage_path?: string;
          title?: string;
          uploaded_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "videos_uploaded_by_fkey";
            columns: ["uploaded_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      check_stock_available: {
        Args: { product_uuid: string; required_qty: number };
        Returns: boolean;
      };
      generate_sku: { Args: { category_name: string }; Returns: string };
      get_order_total: { Args: { order_uuid: string }; Returns: number };
      get_product_margin: { Args: { product_uuid: string }; Returns: number };
      is_admin: { Args: never; Returns: boolean };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  thc: {
    Tables: {
      app_groups: {
        Row: {
          created_at: string | null;
          created_by: string;
          deactivated_at: string | null;
          description: string | null;
          id: string;
          last_modified_by: string | null;
          name: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          created_by?: string;
          deactivated_at?: string | null;
          description?: string | null;
          id?: string;
          last_modified_by?: string | null;
          name?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          created_by?: string;
          deactivated_at?: string | null;
          description?: string | null;
          id?: string;
          last_modified_by?: string | null;
          name?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      budget_items: {
        Row: {
          amount: number | null;
          budget_id: string;
          category_id: string;
          created_at: string | null;
          created_by: string;
          id: string;
          last_modified_by: string | null;
          updated_at: string | null;
        };
        Insert: {
          amount?: number | null;
          budget_id: string;
          category_id: string;
          created_at?: string | null;
          created_by?: string;
          id?: string;
          last_modified_by?: string | null;
          updated_at?: string | null;
        };
        Update: {
          amount?: number | null;
          budget_id?: string;
          category_id?: string;
          created_at?: string | null;
          created_by?: string;
          id?: string;
          last_modified_by?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "budget_items_budget_id_fkey";
            columns: ["budget_id"];
            isOneToOne: false;
            referencedRelation: "budgets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "budget_items_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      budgets: {
        Row: {
          created_at: string | null;
          created_by: string;
          deactivated_at: string | null;
          end_date: string | null;
          id: string;
          is_active: boolean | null;
          last_modified_by: string | null;
          name: string | null;
          start_date: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          created_by?: string;
          deactivated_at?: string | null;
          end_date?: string | null;
          id?: string;
          is_active?: boolean | null;
          last_modified_by?: string | null;
          name?: string | null;
          start_date?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          created_by?: string;
          deactivated_at?: string | null;
          end_date?: string | null;
          id?: string;
          is_active?: boolean | null;
          last_modified_by?: string | null;
          name?: string | null;
          start_date?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          created_at: string | null;
          created_by: string;
          description: string | null;
          id: string;
          last_modified_by: string | null;
          name: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          created_by?: string;
          description?: string | null;
          id?: string;
          last_modified_by?: string | null;
          name?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          created_by?: string;
          description?: string | null;
          id?: string;
          last_modified_by?: string | null;
          name?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      group_memberships: {
        Row: {
          created_at: string | null;
          created_by_id: string | null;
          created_date: string | null;
          deactivated_at: string | null;
          group_id: string;
          id: string;
          last_modified_by_id: string | null;
          last_modified_date: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          created_by_id?: string | null;
          created_date?: string | null;
          deactivated_at?: string | null;
          group_id: string;
          id?: string;
          last_modified_by_id?: string | null;
          last_modified_date?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          created_by_id?: string | null;
          created_date?: string | null;
          deactivated_at?: string | null;
          group_id?: string;
          id?: string;
          last_modified_by_id?: string | null;
          last_modified_date?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "group_memberships_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "app_groups";
            referencedColumns: ["id"];
          },
        ];
      };
      transaction_categorization_jobs: {
        Row: {
          created_at: string | null;
          created_by: string;
          error_message: string | null;
          id: string;
          last_modified_by: string | null;
          status: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          created_by?: string;
          error_message?: string | null;
          id?: string;
          last_modified_by?: string | null;
          status?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          created_by?: string;
          error_message?: string | null;
          id?: string;
          last_modified_by?: string | null;
          status?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      transaction_splits: {
        Row: {
          amount: number;
          category_id: string;
          created_at: string | null;
          description: string | null;
          id: string;
          transaction_id: string;
          updated_at: string | null;
        };
        Insert: {
          amount: number;
          category_id: string;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          transaction_id: string;
          updated_at?: string | null;
        };
        Update: {
          amount?: number;
          category_id?: string;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          transaction_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "transaction_splits_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transaction_splits_transaction_id_fkey";
            columns: ["transaction_id"];
            isOneToOne: false;
            referencedRelation: "transactions";
            referencedColumns: ["id"];
          },
        ];
      };
      transactions: {
        Row: {
          account_id: string;
          amount: number | null;
          category_id: string | null;
          created_at: string | null;
          created_by: string;
          currency: string | null;
          deactivated_at: string | null;
          description: string | null;
          id: string;
          kind: string | null;
          label: string | null;
          last_modified_by: string | null;
          name: string | null;
          opts: string | null;
          related_transaction_id: string | null;
          transacted_date: string | null;
          transacted_time: string | null;
          updated_at: string | null;
        };
        Insert: {
          account_id: string;
          amount?: number | null;
          category_id?: string | null;
          created_at?: string | null;
          created_by?: string;
          currency?: string | null;
          deactivated_at?: string | null;
          description?: string | null;
          id?: string;
          kind?: string | null;
          label?: string | null;
          last_modified_by?: string | null;
          name?: string | null;
          opts?: string | null;
          related_transaction_id?: string | null;
          transacted_date?: string | null;
          updated_at?: string | null;
        };
        Update: {
          account_id?: string;
          amount?: number | null;
          category_id?: string | null;
          created_at?: string | null;
          created_by?: string;
          currency?: string | null;
          deactivated_at?: string | null;
          description?: string | null;
          id?: string;
          kind?: string | null;
          label?: string | null;
          last_modified_by?: string | null;
          name?: string | null;
          opts?: string | null;
          related_transaction_id?: string | null;
          transacted_date?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey";
            columns: ["account_id"];
            isOneToOne: false;
            referencedRelation: "user_accounts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_related_transaction_id_fkey";
            columns: ["related_transaction_id"];
            isOneToOne: false;
            referencedRelation: "transactions";
            referencedColumns: ["id"];
          },
        ];
      };
      user_accounts: {
        Row: {
          created_at: string | null;
          created_by: string;
          currency: string | null;
          deactivated_at: string | null;
          group_id: string | null;
          id: string;
          identification: string | null;
          kind: string | null;
          last_modified_by: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          created_by?: string;
          currency?: string | null;
          deactivated_at?: string | null;
          group_id?: string | null;
          id?: string;
          identification?: string | null;
          kind?: string | null;
          last_modified_by?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          created_by?: string;
          currency?: string | null;
          deactivated_at?: string | null;
          group_id?: string | null;
          id?: string;
          identification?: string | null;
          kind?: string | null;
          last_modified_by?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_accounts_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "app_groups";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_budget_with_items: {
        Args: {
          p_budget_items?: Json;
          p_end_date: string;
          p_is_active?: boolean;
          p_name: string;
          p_start_date: string;
        };
        Returns: string;
      };
      get_user_metadata: { Args: { user_uuid?: string }; Returns: Json };
      is_onboarding_completed: {
        Args: { user_uuid?: string };
        Returns: boolean;
      };
      update_budget_with_items: {
        Args: {
          p_budget_id: string;
          p_budget_items?: Json;
          p_end_date: string;
          p_is_active?: boolean;
          p_name: string;
          p_start_date: string;
        };
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

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
} as const;
