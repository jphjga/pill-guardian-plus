export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          medication_id: string | null
          message: string
          order_id: string | null
          severity: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          medication_id?: string | null
          message: string
          order_id?: string | null
          severity?: string | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          medication_id?: string | null
          message?: string
          order_id?: string | null
          severity?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          allergies: string[] | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          first_name: string
          id: string
          insurance_number: string | null
          insurance_provider: string | null
          last_name: string
          medical_conditions: string[] | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          allergies?: string[] | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          first_name: string
          id?: string
          insurance_number?: string | null
          insurance_provider?: string | null
          last_name: string
          medical_conditions?: string[] | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          allergies?: string[] | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          first_name?: string
          id?: string
          insurance_number?: string | null
          insurance_provider?: string | null
          last_name?: string
          medical_conditions?: string[] | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      inventory: {
        Row: {
          created_at: string
          current_stock: number
          id: string
          last_restocked: string | null
          location: string | null
          maximum_stock: number
          medication_id: string
          minimum_stock: number
          supplier: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_stock?: number
          id?: string
          last_restocked?: string | null
          location?: string | null
          maximum_stock?: number
          medication_id: string
          minimum_stock?: number
          supplier?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_stock?: number
          id?: string
          last_restocked?: string | null
          location?: string | null
          maximum_stock?: number
          medication_id?: string
          minimum_stock?: number
          supplier?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          brand_name: string | null
          category: string | null
          cost: number | null
          created_at: string
          description: string | null
          dosage: string | null
          expiry_date: string | null
          form: string | null
          generic_name: string | null
          id: string
          lot_number: string | null
          manufacturer: string | null
          name: string
          ndc_number: string | null
          price: number | null
          updated_at: string
        }
        Insert: {
          brand_name?: string | null
          category?: string | null
          cost?: number | null
          created_at?: string
          description?: string | null
          dosage?: string | null
          expiry_date?: string | null
          form?: string | null
          generic_name?: string | null
          id?: string
          lot_number?: string | null
          manufacturer?: string | null
          name: string
          ndc_number?: string | null
          price?: number | null
          updated_at?: string
        }
        Update: {
          brand_name?: string | null
          category?: string | null
          cost?: number | null
          created_at?: string
          description?: string | null
          dosage?: string | null
          expiry_date?: string | null
          form?: string | null
          generic_name?: string | null
          id?: string
          lot_number?: string | null
          manufacturer?: string | null
          name?: string
          ndc_number?: string | null
          price?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          instructions: string | null
          medication_id: string
          order_id: string
          quantity: number
          total_price: number | null
          unit_price: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          instructions?: string | null
          medication_id: string
          order_id: string
          quantity: number
          total_price?: number | null
          unit_price?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          instructions?: string | null
          medication_id?: string
          order_id?: string
          quantity?: number
          total_price?: number | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          copay: number | null
          created_at: string
          customer_id: string
          doctor_name: string | null
          id: string
          insurance_coverage: number | null
          notes: string | null
          prescription_number: string | null
          status: string | null
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          copay?: number | null
          created_at?: string
          customer_id: string
          doctor_name?: string | null
          id?: string
          insurance_coverage?: number | null
          notes?: string | null
          prescription_number?: string | null
          status?: string | null
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          copay?: number | null
          created_at?: string
          customer_id?: string
          doctor_name?: string | null
          id?: string
          insurance_coverage?: number | null
          notes?: string | null
          prescription_number?: string | null
          status?: string | null
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          organization: string | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          organization?: string | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          organization?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      role_change_requests: {
        Row: {
          admin_response: string | null
          created_at: string
          from_role: string
          id: string
          organization: string
          processed_at: string | null
          processed_by: string | null
          reason: string | null
          requested_by_email: string
          requested_by_name: string
          status: string
          to_role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_response?: string | null
          created_at?: string
          from_role: string
          id?: string
          organization: string
          processed_at?: string | null
          processed_by?: string | null
          reason?: string | null
          requested_by_email: string
          requested_by_name: string
          status?: string
          to_role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_response?: string | null
          created_at?: string
          from_role?: string
          id?: string
          organization?: string
          processed_at?: string | null
          processed_by?: string | null
          reason?: string | null
          requested_by_email?: string
          requested_by_name?: string
          status?: string
          to_role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
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
  public: {
    Enums: {},
  },
} as const
