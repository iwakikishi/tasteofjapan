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
      menus: {
        Row: {
          categories: string[] | null
          created_at: string
          descriptions: string | null
          id: string
          name: string | null
          price: number | null
          price_after: number | null
          stock: number | null
          vendor: string | null
        }
        Insert: {
          categories?: string[] | null
          created_at?: string
          descriptions?: string | null
          id?: string
          name?: string | null
          price?: number | null
          price_after?: number | null
          stock?: number | null
          vendor?: string | null
        }
        Update: {
          categories?: string[] | null
          created_at?: string
          descriptions?: string | null
          id?: string
          name?: string | null
          price?: number | null
          price_after?: number | null
          stock?: number | null
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menus_vendor_fkey"
            columns: ["vendor"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          id: string
          user: string | null
          vendor: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          user?: string | null
          vendor?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          user?: string | null
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_fkey"
            columns: ["user"]
            isOneToOne: false
            referencedRelation: "user_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_vendor_fkey"
            columns: ["vendor"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profile: {
        Row: {
          created_at: string
          first_name: string
          id: string
          last_name: string | null
          user: string | null
        }
        Insert: {
          created_at?: string
          first_name: string
          id?: string
          last_name?: string | null
          user?: string | null
        }
        Update: {
          created_at?: string
          first_name?: string
          id?: string
          last_name?: string | null
          user?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profile_user_fkey"
            columns: ["user"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          categories: string[] | null
          created_at: string
          descriptions: string | null
          id: string
          images: Json[] | null
          logo: string | null
          menus: string | null
          name: string | null
        }
        Insert: {
          categories?: string[] | null
          created_at?: string
          descriptions?: string | null
          id?: string
          images?: Json[] | null
          logo?: string | null
          menus?: string | null
          name?: string | null
        }
        Update: {
          categories?: string[] | null
          created_at?: string
          descriptions?: string | null
          id?: string
          images?: Json[] | null
          logo?: string | null
          menus?: string | null
          name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendors_menus_fkey"
            columns: ["menus"]
            isOneToOne: false
            referencedRelation: "menus"
            referencedColumns: ["id"]
          },
        ]
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
