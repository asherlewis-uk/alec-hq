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
      // ─── Dual-Workspace Catalog Tables (Phase 1) ────────────
      workspaces: {
        Row: {
          id: string;
          slug: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      workspace_credentials: {
        Row: {
          workspace_id: string;
          pin_hash: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          workspace_id: string;
          pin_hash: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          workspace_id?: string;
          pin_hash?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workspace_credentials_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: true;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      catalog_assets: {
        Row: {
          id: string;
          slug: string | null;
          name: string;
          category: Database["public"]["Enums"]["asset_category"];
          summary: string | null;
          manufacturer: string | null;
          model: string | null;
          cover_image: string | null;
          specs: Json | null;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug?: string | null;
          name: string;
          category: Database["public"]["Enums"]["asset_category"];
          summary?: string | null;
          manufacturer?: string | null;
          model?: string | null;
          cover_image?: string | null;
          specs?: Json | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string | null;
          name?: string;
          category?: Database["public"]["Enums"]["asset_category"];
          summary?: string | null;
          manufacturer?: string | null;
          model?: string | null;
          cover_image?: string | null;
          specs?: Json | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      catalog_media: {
        Row: {
          id: string;
          catalog_asset_id: string;
          url: string;
          alt_text: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          catalog_asset_id: string;
          url: string;
          alt_text?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          catalog_asset_id?: string;
          url?: string;
          alt_text?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "catalog_media_catalog_asset_id_fkey";
            columns: ["catalog_asset_id"];
            isOneToOne: false;
            referencedRelation: "catalog_assets";
            referencedColumns: ["id"];
          },
        ];
      };
      catalog_asset_values: {
        Row: {
          id: string;
          catalog_asset_id: string;
          value_amount: number | null;
          value_currency: string;
          source: string | null;
          effective_at: string;
          captured_at: string;
        };
        Insert: {
          id?: string;
          catalog_asset_id: string;
          value_amount?: number | null;
          value_currency?: string;
          source?: string | null;
          effective_at?: string;
          captured_at?: string;
        };
        Update: {
          id?: string;
          catalog_asset_id?: string;
          value_amount?: number | null;
          value_currency?: string;
          source?: string | null;
          effective_at?: string;
          captured_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "catalog_asset_values_catalog_asset_id_fkey";
            columns: ["catalog_asset_id"];
            isOneToOne: false;
            referencedRelation: "catalog_assets";
            referencedColumns: ["id"];
          },
        ];
      };
      workspace_configurations: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          kind: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          kind: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          name?: string;
          kind?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workspace_configurations_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      configuration_slots: {
        Row: {
          id: string;
          workspace_id: string;
          configuration_id: string;
          slot_key: string;
          label: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          configuration_id: string;
          slot_key: string;
          label: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          configuration_id?: string;
          slot_key?: string;
          label?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "configuration_slots_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "configuration_slots_configuration_id_fkey";
            columns: ["configuration_id"];
            isOneToOne: false;
            referencedRelation: "workspace_configurations";
            referencedColumns: ["id"];
          },
        ];
      };
      workspace_asset_links: {
        Row: {
          id: string;
          workspace_id: string;
          catalog_asset_id: string;
          local_status: Database["public"]["Enums"]["asset_status"];
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          catalog_asset_id: string;
          local_status?: Database["public"]["Enums"]["asset_status"];
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          catalog_asset_id?: string;
          local_status?: Database["public"]["Enums"]["asset_status"];
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workspace_asset_links_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "workspace_asset_links_catalog_asset_id_fkey";
            columns: ["catalog_asset_id"];
            isOneToOne: false;
            referencedRelation: "catalog_assets";
            referencedColumns: ["id"];
          },
        ];
      };
      slot_assignments: {
        Row: {
          id: string;
          workspace_id: string;
          configuration_slot_id: string;
          catalog_asset_id: string;
          workspace_asset_link_id: string | null;
          installed_at: string | null;
          removed_at: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          configuration_slot_id: string;
          catalog_asset_id: string;
          workspace_asset_link_id?: string | null;
          installed_at?: string | null;
          removed_at?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          configuration_slot_id?: string;
          catalog_asset_id?: string;
          workspace_asset_link_id?: string | null;
          installed_at?: string | null;
          removed_at?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "slot_assignments_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "slot_assignments_configuration_slot_id_fkey";
            columns: ["configuration_slot_id"];
            isOneToOne: false;
            referencedRelation: "configuration_slots";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "slot_assignments_catalog_asset_id_fkey";
            columns: ["catalog_asset_id"];
            isOneToOne: false;
            referencedRelation: "catalog_assets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "slot_assignments_workspace_asset_link_id_fkey";
            columns: ["workspace_asset_link_id"];
            isOneToOne: false;
            referencedRelation: "workspace_asset_links";
            referencedColumns: ["id"];
          },
        ];
      };
      workspace_logs: {
        Row: {
          id: string;
          workspace_id: string;
          workspace_asset_link_id: string | null;
          slot_assignment_id: string | null;
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
          workspace_id: string;
          workspace_asset_link_id?: string | null;
          slot_assignment_id?: string | null;
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
          workspace_id?: string;
          workspace_asset_link_id?: string | null;
          slot_assignment_id?: string | null;
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
            foreignKeyName: "workspace_logs_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "workspace_logs_workspace_asset_link_id_fkey";
            columns: ["workspace_asset_link_id"];
            isOneToOne: false;
            referencedRelation: "workspace_asset_links";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "workspace_logs_slot_assignment_id_fkey";
            columns: ["slot_assignment_id"];
            isOneToOne: false;
            referencedRelation: "slot_assignments";
            referencedColumns: ["id"];
          },
        ];
      };
      workspace_wishlist_items: {
        Row: {
          id: string;
          workspace_id: string;
          catalog_asset_id: string | null;
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
          workspace_id: string;
          catalog_asset_id?: string | null;
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
          workspace_id?: string;
          catalog_asset_id?: string | null;
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
            foreignKeyName: "workspace_wishlist_items_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "workspace_wishlist_items_catalog_asset_id_fkey";
            columns: ["catalog_asset_id"];
            isOneToOne: false;
            referencedRelation: "catalog_assets";
            referencedColumns: ["id"];
          },
        ];
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
