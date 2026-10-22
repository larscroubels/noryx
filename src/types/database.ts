export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      appointment_events: {
        Row: {
          actor_user_id: string | null;
          appointment_id: string;
          business_id: string;
          created_at: string;
          event: string;
          from_status: Database["public"]["Enums"]["appointment_status"] | null;
          id: number;
          new_starts_at: string | null;
          previous_starts_at: string | null;
          to_status: Database["public"]["Enums"]["appointment_status"] | null;
        };
        ComputedFields: never;
        Insert: {
          actor_user_id?: string | null;
          appointment_id: string;
          business_id: string;
          created_at?: string;
          event: string;
          from_status?: Database["public"]["Enums"]["appointment_status"] | null;
          id?: never;
          new_starts_at?: string | null;
          previous_starts_at?: string | null;
          to_status?: Database["public"]["Enums"]["appointment_status"] | null;
        };
        Update: {
          actor_user_id?: string | null;
          appointment_id?: string;
          business_id?: string;
          created_at?: string;
          event?: string;
          from_status?: Database["public"]["Enums"]["appointment_status"] | null;
          id?: never;
          new_starts_at?: string | null;
          previous_starts_at?: string | null;
          to_status?: Database["public"]["Enums"]["appointment_status"] | null;
        };
        Relationships: [
          {
            foreignKeyName: "appointment_events_appointment_id_fkey";
            columns: ["appointment_id"];
            isOneToOne: false;
            referencedRelation: "appointments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointment_events_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      appointments: {
        Row: {
          blocked_until: string;
          business_id: string;
          cancellation_reason: string | null;
          cancelled_at: string | null;
          cancelled_by: string | null;
          created_at: string;
          created_by: string | null;
          currency: string;
          customer_id: string;
          customer_note: string | null;
          duration_minutes: number;
          ends_at: string;
          id: string;
          internal_note: string | null;
          location_id: string;
          manage_token_hash: string | null;
          price_cents: number;
          service_id: string | null;
          service_name: string;
          source: Database["public"]["Enums"]["appointment_source"];
          staff_id: string;
          starts_at: string;
          status: Database["public"]["Enums"]["appointment_status"];
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          blocked_until: string;
          business_id: string;
          cancellation_reason?: string | null;
          cancelled_at?: string | null;
          cancelled_by?: string | null;
          created_at?: string;
          created_by?: string | null;
          currency: string;
          customer_id: string;
          customer_note?: string | null;
          duration_minutes: number;
          ends_at: string;
          id?: string;
          internal_note?: string | null;
          location_id: string;
          manage_token_hash?: string | null;
          price_cents: number;
          service_id?: string | null;
          service_name: string;
          source?: Database["public"]["Enums"]["appointment_source"];
          staff_id: string;
          starts_at: string;
          status?: Database["public"]["Enums"]["appointment_status"];
          updated_at?: string;
        };
        Update: {
          blocked_until?: string;
          business_id?: string;
          cancellation_reason?: string | null;
          cancelled_at?: string | null;
          cancelled_by?: string | null;
          created_at?: string;
          created_by?: string | null;
          currency?: string;
          customer_id?: string;
          customer_note?: string | null;
          duration_minutes?: number;
          ends_at?: string;
          id?: string;
          internal_note?: string | null;
          location_id?: string;
          manage_token_hash?: string | null;
          price_cents?: number;
          service_id?: string | null;
          service_name?: string;
          source?: Database["public"]["Enums"]["appointment_source"];
          staff_id?: string;
          starts_at?: string;
          status?: Database["public"]["Enums"]["appointment_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "appointments_business_id_customer_id_fkey";
            columns: ["business_id", "customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["business_id", "id"];
          },
          {
            foreignKeyName: "appointments_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_business_id_location_id_fkey";
            columns: ["business_id", "location_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["business_id", "id"];
          },
          {
            foreignKeyName: "appointments_business_id_service_id_fkey";
            columns: ["business_id", "service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["business_id", "id"];
          },
          {
            foreignKeyName: "appointments_business_id_staff_id_fkey";
            columns: ["business_id", "staff_id"];
            isOneToOne: false;
            referencedRelation: "staff_members";
            referencedColumns: ["business_id", "id"];
          },
        ];
      };
      audit_events: {
        Row: {
          action: string;
          actor_user_id: string | null;
          business_id: string | null;
          created_at: string;
          entity_id: string | null;
          entity_type: string | null;
          id: number;
          metadata: NonNullable<Json>;
        };
        ComputedFields: never;
        Insert: {
          action: string;
          actor_user_id?: string | null;
          business_id?: string | null;
          created_at?: string;
          entity_id?: string | null;
          entity_type?: string | null;
          id?: never;
          metadata?: NonNullable<Json>;
        };
        Update: {
          action?: string;
          actor_user_id?: string | null;
          business_id?: string | null;
          created_at?: string;
          entity_id?: string | null;
          entity_type?: string | null;
          id?: never;
          metadata?: NonNullable<Json>;
        };
        Relationships: [
          {
            foreignKeyName: "audit_events_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      business_invitations: {
        Row: {
          accepted_at: string | null;
          accepted_by: string | null;
          business_id: string;
          created_at: string;
          email: string;
          expires_at: string;
          id: string;
          invited_by: string | null;
          revoked_at: string | null;
          role: Database["public"]["Enums"]["member_role"];
          staff_id: string | null;
          token_hash: string;
        };
        ComputedFields: never;
        Insert: {
          accepted_at?: string | null;
          accepted_by?: string | null;
          business_id: string;
          created_at?: string;
          email: string;
          expires_at?: string;
          id?: string;
          invited_by?: string | null;
          revoked_at?: string | null;
          role?: Database["public"]["Enums"]["member_role"];
          staff_id?: string | null;
          token_hash: string;
        };
        Update: {
          accepted_at?: string | null;
          accepted_by?: string | null;
          business_id?: string;
          created_at?: string;
          email?: string;
          expires_at?: string;
          id?: string;
          invited_by?: string | null;
          revoked_at?: string | null;
          role?: Database["public"]["Enums"]["member_role"];
          staff_id?: string | null;
          token_hash?: string;
        };
        Relationships: [
          {
            foreignKeyName: "business_invitations_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "business_invitations_business_id_staff_id_fkey";
            columns: ["business_id", "staff_id"];
            isOneToOne: false;
            referencedRelation: "staff_members";
            referencedColumns: ["business_id", "id"];
          },
        ];
      };
      business_members: {
        Row: {
          business_id: string;
          created_at: string;
          granted_permissions: string[];
          id: string;
          revoked_permissions: string[];
          role: Database["public"]["Enums"]["member_role"];
          status: Database["public"]["Enums"]["member_status"];
          updated_at: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          business_id: string;
          created_at?: string;
          granted_permissions?: string[];
          id?: string;
          revoked_permissions?: string[];
          role: Database["public"]["Enums"]["member_role"];
          status?: Database["public"]["Enums"]["member_status"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          business_id?: string;
          created_at?: string;
          granted_permissions?: string[];
          id?: string;
          revoked_permissions?: string[];
          role?: Database["public"]["Enums"]["member_role"];
          status?: Database["public"]["Enums"]["member_status"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "business_members_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      business_subscriptions: {
        Row: {
          billing_provider: string | null;
          billing_reference: string | null;
          business_id: string;
          current_period_end: string | null;
          plan_id: string;
          status: Database["public"]["Enums"]["subscription_status"];
          trial_ends_at: string | null;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          billing_provider?: string | null;
          billing_reference?: string | null;
          business_id: string;
          current_period_end?: string | null;
          plan_id: string;
          status?: Database["public"]["Enums"]["subscription_status"];
          trial_ends_at?: string | null;
          updated_at?: string;
        };
        Update: {
          billing_provider?: string | null;
          billing_reference?: string | null;
          business_id?: string;
          current_period_end?: string | null;
          plan_id?: string;
          status?: Database["public"]["Enums"]["subscription_status"];
          trial_ends_at?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "business_subscriptions_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: true;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "business_subscriptions_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "plans";
            referencedColumns: ["id"];
          },
        ];
      };
      businesses: {
        Row: {
          booking_allow_staff_choice: boolean;
          booking_buffer_minutes: number;
          booking_cancellation_notice_hours: number;
          booking_enabled: boolean;
          booking_horizon_days: number;
          booking_min_notice_minutes: number;
          booking_requires_approval: boolean;
          booking_slot_interval_minutes: number;
          brand_color: string | null;
          business_type: Database["public"]["Enums"]["business_type"];
          country_code: string;
          cover_path: string | null;
          created_at: string;
          created_by: string | null;
          currency: string;
          description: string | null;
          email: string | null;
          id: string;
          instagram_handle: string | null;
          locale: string;
          logo_path: string | null;
          name: string;
          onboarding_completed_at: string | null;
          phone: string | null;
          shop_enabled: boolean;
          slug: string;
          status: Database["public"]["Enums"]["business_status"];
          timezone: string;
          updated_at: string;
          website_url: string | null;
        };
        ComputedFields: never;
        Insert: {
          booking_allow_staff_choice?: boolean;
          booking_buffer_minutes?: number;
          booking_cancellation_notice_hours?: number;
          booking_enabled?: boolean;
          booking_horizon_days?: number;
          booking_min_notice_minutes?: number;
          booking_requires_approval?: boolean;
          booking_slot_interval_minutes?: number;
          brand_color?: string | null;
          business_type?: Database["public"]["Enums"]["business_type"];
          country_code?: string;
          cover_path?: string | null;
          created_at?: string;
          created_by?: string | null;
          currency?: string;
          description?: string | null;
          email?: string | null;
          id?: string;
          instagram_handle?: string | null;
          locale?: string;
          logo_path?: string | null;
          name: string;
          onboarding_completed_at?: string | null;
          phone?: string | null;
          shop_enabled?: boolean;
          slug: string;
          status?: Database["public"]["Enums"]["business_status"];
          timezone?: string;
          updated_at?: string;
          website_url?: string | null;
        };
        Update: {
          booking_allow_staff_choice?: boolean;
          booking_buffer_minutes?: number;
          booking_cancellation_notice_hours?: number;
          booking_enabled?: boolean;
          booking_horizon_days?: number;
          booking_min_notice_minutes?: number;
          booking_requires_approval?: boolean;
          booking_slot_interval_minutes?: number;
          brand_color?: string | null;
          business_type?: Database["public"]["Enums"]["business_type"];
          country_code?: string;
          cover_path?: string | null;
          created_at?: string;
          created_by?: string | null;
          currency?: string;
          description?: string | null;
          email?: string | null;
          id?: string;
          instagram_handle?: string | null;
          locale?: string;
          logo_path?: string | null;
          name?: string;
          onboarding_completed_at?: string | null;
          phone?: string | null;
          shop_enabled?: boolean;
          slug?: string;
          status?: Database["public"]["Enums"]["business_status"];
          timezone?: string;
          updated_at?: string;
          website_url?: string | null;
        };
        Relationships: [];
      };
      customer_notes: {
        Row: {
          body: string;
          business_id: string;
          created_at: string;
          created_by: string | null;
          customer_id: string;
          id: string;
        };
        ComputedFields: never;
        Insert: {
          body: string;
          business_id: string;
          created_at?: string;
          created_by?: string | null;
          customer_id: string;
          id?: string;
        };
        Update: {
          body?: string;
          business_id?: string;
          created_at?: string;
          created_by?: string | null;
          customer_id?: string;
          id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "customer_notes_business_id_customer_id_fkey";
            columns: ["business_id", "customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["business_id", "id"];
          },
        ];
      };
      customers: {
        Row: {
          business_id: string;
          created_at: string;
          email: string | null;
          first_name: string;
          id: string;
          last_name: string | null;
          marketing_opt_in: boolean;
          phone: string | null;
          source: string;
          updated_at: string;
          user_id: string | null;
        };
        ComputedFields: never;
        Insert: {
          business_id: string;
          created_at?: string;
          email?: string | null;
          first_name: string;
          id?: string;
          last_name?: string | null;
          marketing_opt_in?: boolean;
          phone?: string | null;
          source?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          business_id?: string;
          created_at?: string;
          email?: string | null;
          first_name?: string;
          id?: string;
          last_name?: string | null;
          marketing_opt_in?: boolean;
          phone?: string | null;
          source?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "customers_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      expenses: {
        Row: {
          amount_cents: number;
          business_id: string;
          category: Database["public"]["Enums"]["expense_category"];
          created_at: string;
          created_by: string | null;
          currency: string;
          description: string;
          id: string;
          reference: string | null;
          spent_on: string;
          supplier: string | null;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          amount_cents: number;
          business_id: string;
          category?: Database["public"]["Enums"]["expense_category"];
          created_at?: string;
          created_by?: string | null;
          currency: string;
          description: string;
          id?: string;
          reference?: string | null;
          spent_on: string;
          supplier?: string | null;
          updated_at?: string;
        };
        Update: {
          amount_cents?: number;
          business_id?: string;
          category?: Database["public"]["Enums"]["expense_category"];
          created_at?: string;
          created_by?: string | null;
          currency?: string;
          description?: string;
          id?: string;
          reference?: string | null;
          spent_on?: string;
          supplier?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "expenses_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      inventory_movements: {
        Row: {
          business_id: string;
          created_at: string;
          created_by: string | null;
          id: number;
          note: string | null;
          order_id: string | null;
          product_id: string;
          quantity_change: number;
          reason: Database["public"]["Enums"]["inventory_reason"];
        };
        ComputedFields: never;
        Insert: {
          business_id: string;
          created_at?: string;
          created_by?: string | null;
          id?: never;
          note?: string | null;
          order_id?: string | null;
          product_id: string;
          quantity_change: number;
          reason: Database["public"]["Enums"]["inventory_reason"];
        };
        Update: {
          business_id?: string;
          created_at?: string;
          created_by?: string | null;
          id?: never;
          note?: string | null;
          order_id?: string | null;
          product_id?: string;
          quantity_change?: number;
          reason?: Database["public"]["Enums"]["inventory_reason"];
        };
        Relationships: [
          {
            foreignKeyName: "inventory_movements_business_id_order_id_fkey";
            columns: ["business_id", "order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["business_id", "id"];
          },
          {
            foreignKeyName: "inventory_movements_business_id_product_id_fkey";
            columns: ["business_id", "product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["business_id", "id"];
          },
        ];
      };
      location_hours: {
        Row: {
          business_id: string;
          end_minute: number;
          id: string;
          location_id: string;
          start_minute: number;
          weekday: number;
        };
        ComputedFields: never;
        Insert: {
          business_id: string;
          end_minute: number;
          id?: string;
          location_id: string;
          start_minute: number;
          weekday: number;
        };
        Update: {
          business_id?: string;
          end_minute?: number;
          id?: string;
          location_id?: string;
          start_minute?: number;
          weekday?: number;
        };
        Relationships: [
          {
            foreignKeyName: "location_hours_business_id_location_id_fkey";
            columns: ["business_id", "location_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["business_id", "id"];
          },
        ];
      };
      locations: {
        Row: {
          address_line1: string | null;
          address_line2: string | null;
          business_id: string;
          city: string | null;
          country_code: string;
          created_at: string;
          id: string;
          is_active: boolean;
          name: string;
          phone: string | null;
          postal_code: string | null;
          sort_order: number;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          address_line1?: string | null;
          address_line2?: string | null;
          business_id: string;
          city?: string | null;
          country_code?: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name: string;
          phone?: string | null;
          postal_code?: string | null;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          address_line1?: string | null;
          address_line2?: string | null;
          business_id?: string;
          city?: string | null;
          country_code?: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          phone?: string | null;
          postal_code?: string | null;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "locations_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          appointment_id: string | null;
          attempts: number;
          business_id: string;
          channel: Database["public"]["Enums"]["notification_channel"];
          created_at: string;
          id: string;
          last_error: string | null;
          payload: NonNullable<Json>;
          processed_at: string | null;
          recipient: string;
          status: Database["public"]["Enums"]["notification_status"];
          template: string;
        };
        ComputedFields: never;
        Insert: {
          appointment_id?: string | null;
          attempts?: number;
          business_id: string;
          channel?: Database["public"]["Enums"]["notification_channel"];
          created_at?: string;
          id?: string;
          last_error?: string | null;
          payload?: NonNullable<Json>;
          processed_at?: string | null;
          recipient: string;
          status?: Database["public"]["Enums"]["notification_status"];
          template: string;
        };
        Update: {
          appointment_id?: string | null;
          attempts?: number;
          business_id?: string;
          channel?: Database["public"]["Enums"]["notification_channel"];
          created_at?: string;
          id?: string;
          last_error?: string | null;
          payload?: NonNullable<Json>;
          processed_at?: string | null;
          recipient?: string;
          status?: Database["public"]["Enums"]["notification_status"];
          template?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_appointment_id_fkey";
            columns: ["appointment_id"];
            isOneToOne: false;
            referencedRelation: "appointments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      order_items: {
        Row: {
          business_id: string;
          id: string;
          line_total_cents: number;
          order_id: string;
          product_id: string | null;
          product_name: string;
          quantity: number;
          unit_price_cents: number;
        };
        ComputedFields: never;
        Insert: {
          business_id: string;
          id?: string;
          line_total_cents: number;
          order_id: string;
          product_id?: string | null;
          product_name: string;
          quantity: number;
          unit_price_cents: number;
        };
        Update: {
          business_id?: string;
          id?: string;
          line_total_cents?: number;
          order_id?: string;
          product_id?: string | null;
          product_name?: string;
          quantity?: number;
          unit_price_cents?: number;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_business_id_order_id_fkey";
            columns: ["business_id", "order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["business_id", "id"];
          },
          {
            foreignKeyName: "order_items_business_id_product_id_fkey";
            columns: ["business_id", "product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["business_id", "id"];
          },
        ];
      };
      orders: {
        Row: {
          business_id: string;
          cancelled_at: string | null;
          created_at: string;
          currency: string;
          customer_email: string | null;
          customer_id: string | null;
          customer_name: string;
          customer_phone: string | null;
          fulfilment: string;
          id: string;
          note: string | null;
          order_number: number;
          payment_status: Database["public"]["Enums"]["order_payment_status"];
          source: string;
          status: Database["public"]["Enums"]["order_status"];
          total_cents: number;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          business_id: string;
          cancelled_at?: string | null;
          created_at?: string;
          currency: string;
          customer_email?: string | null;
          customer_id?: string | null;
          customer_name: string;
          customer_phone?: string | null;
          fulfilment?: string;
          id?: string;
          note?: string | null;
          order_number?: never;
          payment_status?: Database["public"]["Enums"]["order_payment_status"];
          source?: string;
          status?: Database["public"]["Enums"]["order_status"];
          total_cents: number;
          updated_at?: string;
        };
        Update: {
          business_id?: string;
          cancelled_at?: string | null;
          created_at?: string;
          currency?: string;
          customer_email?: string | null;
          customer_id?: string | null;
          customer_name?: string;
          customer_phone?: string | null;
          fulfilment?: string;
          id?: string;
          note?: string | null;
          order_number?: never;
          payment_status?: Database["public"]["Enums"]["order_payment_status"];
          source?: string;
          status?: Database["public"]["Enums"]["order_status"];
          total_cents?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_business_id_customer_id_fkey";
            columns: ["business_id", "customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["business_id", "id"];
          },
          {
            foreignKeyName: "orders_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      payments: {
        Row: {
          amount_cents: number;
          appointment_id: string | null;
          business_id: string;
          created_at: string;
          currency: string;
          customer_id: string | null;
          id: string;
          method: Database["public"]["Enums"]["payment_method"];
          note: string | null;
          paid_at: string;
          recorded_by: string | null;
          refunded_at: string | null;
          refunded_by: string | null;
          status: Database["public"]["Enums"]["payment_status"];
        };
        ComputedFields: never;
        Insert: {
          amount_cents: number;
          appointment_id?: string | null;
          business_id: string;
          created_at?: string;
          currency: string;
          customer_id?: string | null;
          id?: string;
          method: Database["public"]["Enums"]["payment_method"];
          note?: string | null;
          paid_at?: string;
          recorded_by?: string | null;
          refunded_at?: string | null;
          refunded_by?: string | null;
          status?: Database["public"]["Enums"]["payment_status"];
        };
        Update: {
          amount_cents?: number;
          appointment_id?: string | null;
          business_id?: string;
          created_at?: string;
          currency?: string;
          customer_id?: string | null;
          id?: string;
          method?: Database["public"]["Enums"]["payment_method"];
          note?: string | null;
          paid_at?: string;
          recorded_by?: string | null;
          refunded_at?: string | null;
          refunded_by?: string | null;
          status?: Database["public"]["Enums"]["payment_status"];
        };
        Relationships: [
          {
            foreignKeyName: "payments_business_id_appointment_id_fkey";
            columns: ["business_id", "appointment_id"];
            isOneToOne: false;
            referencedRelation: "appointments";
            referencedColumns: ["business_id", "id"];
          },
          {
            foreignKeyName: "payments_business_id_customer_id_fkey";
            columns: ["business_id", "customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["business_id", "id"];
          },
          {
            foreignKeyName: "payments_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      permissions: {
        Row: {
          description: string;
          key: string;
        };
        ComputedFields: never;
        Insert: {
          description: string;
          key: string;
        };
        Update: {
          description?: string;
          key?: string;
        };
        Relationships: [];
      };
      plans: {
        Row: {
          currency: string;
          description: string;
          features: string[];
          id: string;
          is_active: boolean;
          max_customers: number | null;
          max_members: number | null;
          max_staff: number | null;
          monthly_price_cents: number | null;
          name: string;
          sort_order: number;
        };
        ComputedFields: never;
        Insert: {
          currency?: string;
          description: string;
          features?: string[];
          id: string;
          is_active?: boolean;
          max_customers?: number | null;
          max_members?: number | null;
          max_staff?: number | null;
          monthly_price_cents?: number | null;
          name: string;
          sort_order?: number;
        };
        Update: {
          currency?: string;
          description?: string;
          features?: string[];
          id?: string;
          is_active?: boolean;
          max_customers?: number | null;
          max_members?: number | null;
          max_staff?: number | null;
          monthly_price_cents?: number | null;
          name?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      platform_admins: {
        Row: {
          granted_at: string;
          note: string | null;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          granted_at?: string;
          note?: string | null;
          user_id: string;
        };
        Update: {
          granted_at?: string;
          note?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          business_id: string;
          category: string | null;
          cost_cents: number | null;
          created_at: string;
          description: string | null;
          id: string;
          image_path: string | null;
          is_active: boolean;
          is_online: boolean;
          low_stock_threshold: number;
          name: string;
          price_cents: number;
          sku: string | null;
          stock_quantity: number;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          business_id: string;
          category?: string | null;
          cost_cents?: number | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          image_path?: string | null;
          is_active?: boolean;
          is_online?: boolean;
          low_stock_threshold?: number;
          name: string;
          price_cents: number;
          sku?: string | null;
          stock_quantity?: number;
          updated_at?: string;
        };
        Update: {
          business_id?: string;
          category?: string | null;
          cost_cents?: number | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          image_path?: string | null;
          is_active?: boolean;
          is_online?: boolean;
          low_stock_threshold?: number;
          name?: string;
          price_cents?: number;
          sku?: string | null;
          stock_quantity?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_path: string | null;
          created_at: string;
          full_name: string | null;
          id: string;
          locale: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          avatar_path?: string | null;
          created_at?: string;
          full_name?: string | null;
          id: string;
          locale?: string;
          updated_at?: string;
        };
        Update: {
          avatar_path?: string | null;
          created_at?: string;
          full_name?: string | null;
          id?: string;
          locale?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      role_permissions: {
        Row: {
          permission: string;
          role: Database["public"]["Enums"]["member_role"];
        };
        ComputedFields: never;
        Insert: {
          permission: string;
          role: Database["public"]["Enums"]["member_role"];
        };
        Update: {
          permission?: string;
          role?: Database["public"]["Enums"]["member_role"];
        };
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_fkey";
            columns: ["permission"];
            isOneToOne: false;
            referencedRelation: "permissions";
            referencedColumns: ["key"];
          },
        ];
      };
      service_categories: {
        Row: {
          business_id: string;
          created_at: string;
          id: string;
          name: string;
          sort_order: number;
        };
        ComputedFields: never;
        Insert: {
          business_id: string;
          created_at?: string;
          id?: string;
          name: string;
          sort_order?: number;
        };
        Update: {
          business_id?: string;
          created_at?: string;
          id?: string;
          name?: string;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "service_categories_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      services: {
        Row: {
          buffer_after_minutes: number;
          business_id: string;
          category_id: string | null;
          created_at: string;
          description: string | null;
          duration_minutes: number;
          id: string;
          image_path: string | null;
          is_active: boolean;
          is_online_bookable: boolean;
          name: string;
          price_cents: number;
          promo_price_cents: number | null;
          sort_order: number;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          buffer_after_minutes?: number;
          business_id: string;
          category_id?: string | null;
          created_at?: string;
          description?: string | null;
          duration_minutes: number;
          id?: string;
          image_path?: string | null;
          is_active?: boolean;
          is_online_bookable?: boolean;
          name: string;
          price_cents: number;
          promo_price_cents?: number | null;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          buffer_after_minutes?: number;
          business_id?: string;
          category_id?: string | null;
          created_at?: string;
          description?: string | null;
          duration_minutes?: number;
          id?: string;
          image_path?: string | null;
          is_active?: boolean;
          is_online_bookable?: boolean;
          name?: string;
          price_cents?: number;
          promo_price_cents?: number | null;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "services_business_id_category_id_fkey";
            columns: ["business_id", "category_id"];
            isOneToOne: false;
            referencedRelation: "service_categories";
            referencedColumns: ["business_id", "id"];
          },
          {
            foreignKeyName: "services_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      staff_members: {
        Row: {
          avatar_path: string | null;
          bio: string | null;
          business_id: string;
          created_at: string;
          display_name: string;
          email: string | null;
          id: string;
          is_active: boolean;
          is_bookable: boolean;
          job_title: string | null;
          location_id: string | null;
          phone: string | null;
          sort_order: number;
          updated_at: string;
          user_id: string | null;
        };
        ComputedFields: never;
        Insert: {
          avatar_path?: string | null;
          bio?: string | null;
          business_id: string;
          created_at?: string;
          display_name: string;
          email?: string | null;
          id?: string;
          is_active?: boolean;
          is_bookable?: boolean;
          job_title?: string | null;
          location_id?: string | null;
          phone?: string | null;
          sort_order?: number;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          avatar_path?: string | null;
          bio?: string | null;
          business_id?: string;
          created_at?: string;
          display_name?: string;
          email?: string | null;
          id?: string;
          is_active?: boolean;
          is_bookable?: boolean;
          job_title?: string | null;
          location_id?: string | null;
          phone?: string | null;
          sort_order?: number;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "staff_members_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "staff_members_business_id_location_id_fkey";
            columns: ["business_id", "location_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["business_id", "id"];
          },
        ];
      };
      staff_services: {
        Row: {
          business_id: string;
          duration_minutes: number | null;
          price_cents: number | null;
          service_id: string;
          staff_id: string;
        };
        ComputedFields: never;
        Insert: {
          business_id: string;
          duration_minutes?: number | null;
          price_cents?: number | null;
          service_id: string;
          staff_id: string;
        };
        Update: {
          business_id?: string;
          duration_minutes?: number | null;
          price_cents?: number | null;
          service_id?: string;
          staff_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "staff_services_business_id_service_id_fkey";
            columns: ["business_id", "service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["business_id", "id"];
          },
          {
            foreignKeyName: "staff_services_business_id_staff_id_fkey";
            columns: ["business_id", "staff_id"];
            isOneToOne: false;
            referencedRelation: "staff_members";
            referencedColumns: ["business_id", "id"];
          },
        ];
      };
      staff_time_off: {
        Row: {
          business_id: string;
          created_at: string;
          created_by: string | null;
          ends_at: string;
          id: string;
          kind: Database["public"]["Enums"]["time_off_kind"];
          note: string | null;
          staff_id: string;
          starts_at: string;
        };
        ComputedFields: never;
        Insert: {
          business_id: string;
          created_at?: string;
          created_by?: string | null;
          ends_at: string;
          id?: string;
          kind?: Database["public"]["Enums"]["time_off_kind"];
          note?: string | null;
          staff_id: string;
          starts_at: string;
        };
        Update: {
          business_id?: string;
          created_at?: string;
          created_by?: string | null;
          ends_at?: string;
          id?: string;
          kind?: Database["public"]["Enums"]["time_off_kind"];
          note?: string | null;
          staff_id?: string;
          starts_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "staff_time_off_business_id_staff_id_fkey";
            columns: ["business_id", "staff_id"];
            isOneToOne: false;
            referencedRelation: "staff_members";
            referencedColumns: ["business_id", "id"];
          },
        ];
      };
      staff_working_hours: {
        Row: {
          business_id: string;
          end_minute: number;
          id: string;
          staff_id: string;
          start_minute: number;
          weekday: number;
        };
        ComputedFields: never;
        Insert: {
          business_id: string;
          end_minute: number;
          id?: string;
          staff_id: string;
          start_minute: number;
          weekday: number;
        };
        Update: {
          business_id?: string;
          end_minute?: number;
          id?: string;
          staff_id?: string;
          start_minute?: number;
          weekday?: number;
        };
        Relationships: [
          {
            foreignKeyName: "staff_working_hours_business_id_staff_id_fkey";
            columns: ["business_id", "staff_id"];
            isOneToOne: false;
            referencedRelation: "staff_members";
            referencedColumns: ["business_id", "id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      accept_invitation: { Args: { p_token: string }; Returns: string };
      admin_list_businesses: {
        Args: Record<PropertyKey, never>;
        Returns: {
          appointments_30d: number;
          booking_enabled: boolean;
          business_type: Database["public"]["Enums"]["business_type"];
          created_at: string;
          id: string;
          member_count: number;
          name: string;
          owner_email: string;
          slug: string;
          staff_count: number;
          status: Database["public"]["Enums"]["business_status"];
        }[];
      };
      admin_platform_stats: { Args: Record<PropertyKey, never>; Returns: Json };
      admin_set_business_status: {
        Args: {
          p_business_id: string;
          p_reason: string;
          p_status: Database["public"]["Enums"]["business_status"];
        };
        Returns: undefined;
      };
      admin_set_subscription: {
        Args: {
          p_business_id: string;
          p_plan_id: string;
          p_reason: string;
          p_status: Database["public"]["Enums"]["subscription_status"];
        };
        Returns: undefined;
      };
      appointment_paid_cents: { Args: { p_appointment_id: string }; Returns: number };
      business_effective_plan: { Args: { p_business_id: string }; Returns: string };
      business_has_feature: {
        Args: { p_business_id: string; p_feature: string };
        Returns: boolean;
      };
      business_plan_limit: { Args: { p_business_id: string; p_limit: string }; Returns: number };
      can_manage: { Args: { p_business_id: string; p_permission: string }; Returns: boolean };
      can_manage_appointment: {
        Args: { p_business_id: string; p_staff_id: string };
        Returns: boolean;
      };
      can_view_appointment: {
        Args: { p_business_id: string; p_staff_id: string };
        Returns: boolean;
      };
      can_view_customer: {
        Args: { p_business_id: string; p_customer_id: string };
        Returns: boolean;
      };
      cancel_booking_by_token: { Args: { p_reason?: string; p_token: string }; Returns: undefined };
      cancel_order: { Args: { p_order_id: string }; Returns: undefined };
      create_business: {
        Args: {
          p_business_type?: Database["public"]["Enums"]["business_type"];
          p_country_code?: string;
          p_currency?: string;
          p_locale?: string;
          p_name: string;
          p_slug: string;
          p_timezone?: string;
        };
        Returns: string;
      };
      create_invitation: {
        Args: {
          p_business_id: string;
          p_email: string;
          p_role: Database["public"]["Enums"]["member_role"];
          p_staff_id?: string;
        };
        Returns: string;
      };
      create_online_booking: {
        Args: {
          p_business_id: string;
          p_customer_note?: string;
          p_email: string;
          p_first_name: string;
          p_last_name: string;
          p_location_id: string;
          p_marketing_opt_in?: boolean;
          p_phone: string;
          p_service_id: string;
          p_staff_id: string;
          p_starts_at: string;
        };
        Returns: Json;
      };
      create_online_order: {
        Args: {
          p_business_id: string;
          p_email: string;
          p_first_name: string;
          p_items: Json;
          p_last_name: string;
          p_note?: string;
          p_phone: string;
        };
        Returns: Json;
      };
      current_plan: { Args: { p_business_id: string }; Returns: string };
      get_booking_by_token: { Args: { p_token: string }; Returns: Json };
      get_invitation: { Args: { p_token: string }; Returns: Json };
      get_public_business: { Args: { p_slug: string }; Returns: Json };
      get_public_business_data: { Args: { p_slug: string }; Returns: Json };
      get_public_busy_periods: {
        Args: { p_business_id: string; p_from: string; p_to: string };
        Returns: {
          ends_at: string;
          staff_id: string;
          starts_at: string;
        }[];
      };
      get_public_products: { Args: { p_slug: string }; Returns: Json };
      has_business_permission: {
        Args: { p_business_id: string; p_permission: string };
        Returns: boolean;
      };
      is_business_member: { Args: { p_business_id: string }; Returns: boolean };
      is_own_staff: { Args: { p_staff_id: string }; Returns: boolean };
      is_platform_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
      issue_booking_token: { Args: { p_appointment_id: string }; Returns: string };
      list_business_members: {
        Args: { p_business_id: string };
        Returns: {
          created_at: string;
          email: string;
          full_name: string;
          granted_permissions: string[];
          id: string;
          revoked_permissions: string[];
          role: Database["public"]["Enums"]["member_role"];
          staff_id: string;
          status: Database["public"]["Enums"]["member_status"];
          user_id: string;
        }[];
      };
      log_audit_event: {
        Args: {
          p_action: string;
          p_business_id: string;
          p_entity_id?: string;
          p_entity_type?: string;
          p_metadata?: Json;
        };
        Returns: undefined;
      };
      my_business_permissions: { Args: { p_business_id: string }; Returns: string[] };
      my_business_role: {
        Args: { p_business_id: string };
        Returns: Database["public"]["Enums"]["member_role"];
      };
      remove_member: { Args: { p_member_id: string }; Returns: undefined };
      revoke_invitation: { Args: { p_invitation_id: string }; Returns: undefined };
      set_location_hours: { Args: { p_hours: Json; p_location_id: string }; Returns: undefined };
      set_staff_working_hours: { Args: { p_hours: Json; p_staff_id: string }; Returns: undefined };
      shares_business_with: { Args: { p_user_id: string }; Returns: boolean };
      update_member: {
        Args: {
          p_granted?: string[];
          p_member_id: string;
          p_revoked?: string[];
          p_role: Database["public"]["Enums"]["member_role"];
        };
        Returns: undefined;
      };
    };
    Enums: {
      appointment_source: "online" | "staff";
      appointment_status: "pending" | "confirmed" | "completed" | "cancelled" | "no_show";
      business_status: "active" | "suspended" | "closed";
      business_type:
        | "hair_salon"
        | "barbershop"
        | "beauty_salon"
        | "nail_studio"
        | "lash_brow_studio"
        | "skincare_clinic"
        | "independent_professional"
        | "other";
      expense_category:
        | "products"
        | "rent"
        | "utilities"
        | "salaries"
        | "marketing"
        | "equipment"
        | "software"
        | "training"
        | "other";
      inventory_reason:
        | "initial"
        | "restock"
        | "adjustment"
        | "damage"
        | "return"
        | "sale"
        | "order"
        | "order_cancelled";
      member_role: "owner" | "manager" | "staff";
      member_status: "active" | "disabled";
      notification_channel: "email" | "sms";
      notification_status: "pending" | "sent" | "failed" | "skipped";
      order_payment_status: "unpaid" | "paid" | "refunded";
      order_status: "pending" | "confirmed" | "ready" | "completed" | "cancelled";
      payment_method: "cash" | "card" | "bancontact" | "bank_transfer" | "voucher" | "other";
      payment_status: "recorded" | "refunded";
      subscription_status: "trialing" | "active" | "past_due" | "cancelled";
      time_off_kind: "holiday" | "sick" | "break" | "training" | "other";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      appointment_source: ["online", "staff"],
      appointment_status: ["pending", "confirmed", "completed", "cancelled", "no_show"],
      business_status: ["active", "suspended", "closed"],
      business_type: [
        "hair_salon",
        "barbershop",
        "beauty_salon",
        "nail_studio",
        "lash_brow_studio",
        "skincare_clinic",
        "independent_professional",
        "other",
      ],
      expense_category: [
        "products",
        "rent",
        "utilities",
        "salaries",
        "marketing",
        "equipment",
        "software",
        "training",
        "other",
      ],
      inventory_reason: [
        "initial",
        "restock",
        "adjustment",
        "damage",
        "return",
        "sale",
        "order",
        "order_cancelled",
      ],
      member_role: ["owner", "manager", "staff"],
      member_status: ["active", "disabled"],
      notification_channel: ["email", "sms"],
      notification_status: ["pending", "sent", "failed", "skipped"],
      order_payment_status: ["unpaid", "paid", "refunded"],
      order_status: ["pending", "confirmed", "ready", "completed", "cancelled"],
      payment_method: ["cash", "card", "bancontact", "bank_transfer", "voucher", "other"],
      payment_status: ["recorded", "refunded"],
      subscription_status: ["trialing", "active", "past_due", "cancelled"],
      time_off_kind: ["holiday", "sick", "break", "training", "other"],
    },
  },
} as const;
