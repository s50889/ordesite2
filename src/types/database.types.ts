export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      announcements: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          priority: number | null
          title: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          title: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          title?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          new_values: Json | null
          old_values: Json | null
          record_id: string
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id: string
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string
          table_name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      notification_logs: {
        Row: {
          body: string
          created_at: string | null
          error_message: string | null
          id: string
          notification_type: string
          order_id: string | null
          recipient_email: string
          sent_at: string | null
          status: string | null
          subject: string
        }
        Insert: {
          body: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          notification_type: string
          order_id?: string | null
          recipient_email: string
          sent_at?: string | null
          status?: string | null
          subject: string
        }
        Update: {
          body?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          notification_type?: string
          order_id?: string | null
          recipient_email?: string
          sent_at?: string | null
          status?: string | null
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_lines: {
        Row: {
          created_at: string | null
          id: string
          note: string | null
          order_id: string
          product_id: string
          quantity: number
          updated_at: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          note?: string | null
          order_id: string
          product_id: string
          quantity: number
          updated_at?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          note?: string | null
          order_id?: string
          product_id?: string
          quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_lines_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_lines_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          assigned_sales_id: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          created_at: string | null
          customer_id: string
          delivery_date: string | null
          id: string
          note: string | null
          order_number: string
          requested_at: string
          shipping_address: string
          shipping_address1: string | null
          shipping_address2: string | null
          shipping_city: string
          shipping_company: string | null
          shipping_email: string | null
          shipping_name: string | null
          shipping_phone: string | null
          shipping_postal_code: string
          shipping_prefecture: string
          status: string | null
          total_qty: number
          updated_at: string | null
        }
        Insert: {
          assigned_sales_id?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string | null
          customer_id: string
          delivery_date?: string | null
          id?: string
          note?: string | null
          order_number: string
          requested_at?: string
          shipping_address: string
          shipping_address1?: string | null
          shipping_address2?: string | null
          shipping_city: string
          shipping_company?: string | null
          shipping_email?: string | null
          shipping_name?: string | null
          shipping_phone?: string | null
          shipping_postal_code: string
          shipping_prefecture: string
          status?: string | null
          total_qty?: number
          updated_at?: string | null
        }
        Update: {
          assigned_sales_id?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string | null
          customer_id?: string
          delivery_date?: string | null
          id?: string
          note?: string | null
          order_number?: string
          requested_at?: string
          shipping_address?: string
          shipping_address1?: string | null
          shipping_address2?: string | null
          shipping_city?: string
          shipping_company?: string | null
          shipping_email?: string | null
          shipping_name?: string | null
          shipping_phone?: string | null
          shipping_postal_code?: string
          shipping_prefecture?: string
          status?: string | null
          total_qty?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_assigned_sales_id_fkey"
            columns: ["assigned_sales_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          category_id: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          moq: number | null
          name: string
          sku: string | null
          specs: string | null
          stock_quantity: number | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          moq?: number | null
          name: string
          sku?: string | null
          specs?: string | null
          stock_quantity?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          moq?: number | null
          name?: string
          sku?: string | null
          specs?: string | null
          stock_quantity?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_products_category"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments: {
        Row: {
          actual_delivery_date: string | null
          created_at: string | null
          current_status_id: number | null
          estimated_delivery_date: string | null
          id: string
          notes: string | null
          order_id: string
          updated_at: string | null
        }
        Insert: {
          actual_delivery_date?: string | null
          created_at?: string | null
          current_status_id?: number | null
          estimated_delivery_date?: string | null
          id?: string
          notes?: string | null
          order_id: string
          updated_at?: string | null
        }
        Update: {
          actual_delivery_date?: string | null
          created_at?: string | null
          current_status_id?: number | null
          estimated_delivery_date?: string | null
          id?: string
          notes?: string | null
          order_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipments_current_status_id_fkey"
            columns: ["current_status_id"]
            isOneToOne: false
            referencedRelation: "shipping_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_addresses: {
        Row: {
          address1: string
          city: string
          company: string
          created_at: string | null
          id: string
          is_default: boolean | null
          phone: string
          postal_code: string
          prefecture: string
          site_name: string | null
          user_id: string | null
        }
        Insert: {
          address1: string
          city: string
          company: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          phone: string
          postal_code: string
          prefecture: string
          site_name?: string | null
          user_id?: string | null
        }
        Update: {
          address1?: string
          city?: string
          company?: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          phone?: string
          postal_code?: string
          prefecture?: string
          site_name?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      shipping_addresses_old: {
        Row: {
          address1: string
          city: string
          company: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          phone: string | null
          postal_code: string
          prefecture: string
          site_name: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address1: string
          city: string
          company?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          phone?: string | null
          postal_code: string
          prefecture: string
          site_name?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address1?: string
          city?: string
          company?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          phone?: string | null
          postal_code?: string
          prefecture?: string
          site_name?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      shipping_statuses: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          is_active: boolean | null
          sort_order: number | null
          status_code: string
          status_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          is_active?: boolean | null
          sort_order?: number | null
          status_code: string
          status_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          is_active?: boolean | null
          sort_order?: number | null
          status_code?: string
          status_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          business_hours: string | null
          contact_address: string | null
          contact_auto_reply_enabled: boolean | null
          contact_email: string | null
          contact_from_email: string | null
          contact_from_name: string | null
          contact_phone: string | null
          created_at: string | null
          default_shipping_fee: number | null
          estimated_delivery_days: number | null
          express_shipping_fee: number | null
          free_shipping_threshold: number | null
          from_email: string | null
          from_name: string | null
          id: number
          maintenance_mode: boolean | null
          order_notification_enabled: boolean | null
          sendgrid_api_key: string | null
          shipping_methods: Json | null
          site_description: string | null
          site_logo_url: string | null
          site_name: string | null
          smtp_host: string | null
          smtp_password: string | null
          smtp_port: number | null
          smtp_user: string | null
          status_update_notification_enabled: boolean | null
          updated_at: string | null
        }
        Insert: {
          business_hours?: string | null
          contact_address?: string | null
          contact_auto_reply_enabled?: boolean | null
          contact_email?: string | null
          contact_from_email?: string | null
          contact_from_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          default_shipping_fee?: number | null
          estimated_delivery_days?: number | null
          express_shipping_fee?: number | null
          free_shipping_threshold?: number | null
          from_email?: string | null
          from_name?: string | null
          id?: number
          maintenance_mode?: boolean | null
          order_notification_enabled?: boolean | null
          sendgrid_api_key?: string | null
          shipping_methods?: Json | null
          site_description?: string | null
          site_logo_url?: string | null
          site_name?: string | null
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: number | null
          smtp_user?: string | null
          status_update_notification_enabled?: boolean | null
          updated_at?: string | null
        }
        Update: {
          business_hours?: string | null
          contact_address?: string | null
          contact_auto_reply_enabled?: boolean | null
          contact_email?: string | null
          contact_from_email?: string | null
          contact_from_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          default_shipping_fee?: number | null
          estimated_delivery_days?: number | null
          express_shipping_fee?: number | null
          free_shipping_threshold?: number | null
          from_email?: string | null
          from_name?: string | null
          id?: number
          maintenance_mode?: boolean | null
          order_notification_enabled?: boolean | null
          sendgrid_api_key?: string | null
          shipping_methods?: Json | null
          site_description?: string | null
          site_logo_url?: string | null
          site_name?: string | null
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: number | null
          smtp_user?: string | null
          status_update_notification_enabled?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          address: string | null
          company_name: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          company_name?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      admin_announcements: {
        Row: {
          content: string | null
          created_at: string | null
          created_by_email: string | null
          id: string | null
          is_active: boolean | null
          priority: number | null
          title: string | null
          type: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      public_announcements: {
        Row: {
          content: string | null
          created_at: string | null
          id: string | null
          priority: number | null
          title: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string | null
          priority?: number | null
          title?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string | null
          priority?: number | null
          title?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      generate_order_number: {
        Args: Record<PropertyKey, never>
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const 