export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      assets: {
        Row: {
          id: string;
          name: string;
          category: Database["public"]["Enums"]["asset_category"];
          status: Database["public"]["Enums"]["asset_status"];
          cover_image: string | null;
          purchase_date: string | null;
          purchase_price: number | null;
          notes: string | null;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: Database["public"]["Enums"]["asset_category"];
          status?: Database["public"]["Enums"]["asset_status"];
          cover_image?: string | null;
          purchase_date?: string | null;
          purchase_price?: number | null;
          notes?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: Database["public"]["Enums"]["asset_category"];
          status?: Database["public"]["Enums"]["asset_status"];
          cover_image?: string | null;
          purchase_date?: string | null;
          purchase_price?: number | null;
          notes?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      components: {
        Row: {
          id: string;
          asset_id: string;
          name: string;
          brand: string | null;
          model: string | null;
          specs: Json | null;
          condition: Database["public"]["Enums"]["component_condition"];
          installed_date: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          asset_id: string;
          name: string;
          brand?: string | null;
          model?: string | null;
          specs?: Json | null;
          condition?: Database["public"]["Enums"]["component_condition"];
          installed_date?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          asset_id?: string;
          name?: string;
          brand?: string | null;
          model?: string | null;
          specs?: Json | null;
          condition?: Database["public"]["Enums"]["component_condition"];
          installed_date?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "components_asset_id_fkey";
            columns: ["asset_id"];
            isOneToOne: false;
            referencedRelation: "assets";
            referencedColumns: ["id"];
          },
        ];
      };
      asset_logs: {
        Row: {
          id: string;
          asset_id: string;
          type: Database["public"]["Enums"]["log_type"];
          title: string;
          description: string | null;
          date: string;
          mileage: number | null;
          cost: number | null;
          performed_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          asset_id: string;
          type?: Database["public"]["Enums"]["log_type"];
          title: string;
          description?: string | null;
          date?: string;
          mileage?: number | null;
          cost?: number | null;
          performed_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          asset_id?: string;
          type?: Database["public"]["Enums"]["log_type"];
          title?: string;
          description?: string | null;
          date?: string;
          mileage?: number | null;
          cost?: number | null;
          performed_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "asset_logs_asset_id_fkey";
            columns: ["asset_id"];
            isOneToOne: false;
            referencedRelation: "assets";
            referencedColumns: ["id"];
          },
        ];
      };
      wishlist_items: {
        Row: {
          id: string;
          asset_id: string;
          name: string;
          brand: string | null;
          url: string | null;
          estimated_price: number | null;
          priority: Database["public"]["Enums"]["wishlist_priority"];
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          asset_id: string;
          name: string;
          brand?: string | null;
          url?: string | null;
          estimated_price?: number | null;
          priority?: Database["public"]["Enums"]["wishlist_priority"];
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          asset_id?: string;
          name?: string;
          brand?: string | null;
          url?: string | null;
          estimated_price?: number | null;
          priority?: Database["public"]["Enums"]["wishlist_priority"];
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "wishlist_items_asset_id_fkey";
            columns: ["asset_id"];
            isOneToOne: false;
            referencedRelation: "assets";
            referencedColumns: ["id"];
          },
        ];
      };
      app_pin: {
        Row: {
          id: boolean;
          pin_hash: string;
          created_at: string;
        };
        Insert: {
          id?: boolean;
          pin_hash: string;
          created_at?: string;
        };
        Update: {
          id?: boolean;
          pin_hash?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      asset_category: "VEHICLE" | "RIG" | "PERIPHERAL" | "NETWORK";
      asset_status: "ACTIVE" | "STORED" | "SOLD" | "WISHLIST";
      component_condition:
        | "STOCK"
        | "UPGRADED"
        | "AFTERMARKET"
        | "WORN"
        | "FAILED";
      log_type: "MAINTENANCE" | "UPGRADE" | "REPAIR" | "INSPECTION" | "NOTE";
      wishlist_priority: "LOW" | "MEDIUM" | "HIGH";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
