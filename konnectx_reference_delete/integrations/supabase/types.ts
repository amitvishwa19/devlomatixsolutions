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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      wa_account_credentials: {
        Row: {
          access_token: string
          created_at: string
          id: string
          phone_number_id: string
          token_preview: string
          updated_at: string
        }
        Insert: {
          access_token: string
          created_at?: string
          id?: string
          phone_number_id: string
          token_preview: string
          updated_at?: string
        }
        Update: {
          access_token?: string
          created_at?: string
          id?: string
          phone_number_id?: string
          token_preview?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wa_account_credentials_phone_number_id_fkey"
            columns: ["phone_number_id"]
            isOneToOne: true
            referencedRelation: "wa_phone_numbers"
            referencedColumns: ["id"]
          },
        ]
      }
      wa_ai_config: {
        Row: {
          created_at: string
          custom_api_key: string
          custom_base_url: string
          custom_model: string
          id: string
          model: string
          provider: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          custom_api_key?: string
          custom_base_url?: string
          custom_model?: string
          id?: string
          model?: string
          provider?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          custom_api_key?: string
          custom_base_url?: string
          custom_model?: string
          id?: string
          model?: string
          provider?: string
          updated_at?: string
        }
        Relationships: []
      }
      wa_assignees: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      wa_automation_rules: {
        Row: {
          case_sensitive: boolean
          cooldown_minutes: number
          created_at: string
          enabled: boolean
          id: string
          last_triggered_at: string | null
          match_keywords: string[]
          match_mode: string
          metadata: Json
          name: string
          office_hours: Json
          priority: number
          reply_body: string | null
          reply_type: string
          rule_type: string
          template_id: string | null
          template_language: string | null
          trigger_count: number
          updated_at: string
        }
        Insert: {
          case_sensitive?: boolean
          cooldown_minutes?: number
          created_at?: string
          enabled?: boolean
          id?: string
          last_triggered_at?: string | null
          match_keywords?: string[]
          match_mode?: string
          metadata?: Json
          name: string
          office_hours?: Json
          priority?: number
          reply_body?: string | null
          reply_type?: string
          rule_type?: string
          template_id?: string | null
          template_language?: string | null
          trigger_count?: number
          updated_at?: string
        }
        Update: {
          case_sensitive?: boolean
          cooldown_minutes?: number
          created_at?: string
          enabled?: boolean
          id?: string
          last_triggered_at?: string | null
          match_keywords?: string[]
          match_mode?: string
          metadata?: Json
          name?: string
          office_hours?: Json
          priority?: number
          reply_body?: string | null
          reply_type?: string
          rule_type?: string
          template_id?: string | null
          template_language?: string | null
          trigger_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wa_automation_rules_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "wa_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      wa_billing_events: {
        Row: {
          billable: boolean
          category: string
          conversation_provider_id: string | null
          created_at: string
          id: string
          message_id: string | null
          occurred_at: string
          origin_type: string | null
          phone_number_id: string | null
          pricing_model: string | null
          raw: Json
          recipient_phone: string | null
        }
        Insert: {
          billable?: boolean
          category?: string
          conversation_provider_id?: string | null
          created_at?: string
          id?: string
          message_id?: string | null
          occurred_at?: string
          origin_type?: string | null
          phone_number_id?: string | null
          pricing_model?: string | null
          raw?: Json
          recipient_phone?: string | null
        }
        Update: {
          billable?: boolean
          category?: string
          conversation_provider_id?: string | null
          created_at?: string
          id?: string
          message_id?: string | null
          occurred_at?: string
          origin_type?: string | null
          phone_number_id?: string | null
          pricing_model?: string | null
          raw?: Json
          recipient_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wa_billing_events_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "wa_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wa_billing_events_phone_number_id_fkey"
            columns: ["phone_number_id"]
            isOneToOne: false
            referencedRelation: "wa_phone_numbers"
            referencedColumns: ["id"]
          },
        ]
      }
      wa_campaign_recipients: {
        Row: {
          campaign_id: string
          contact_id: string | null
          created_at: string
          error_message: string | null
          id: string
          provider_message_id: string | null
          recipient_phone: string
          sent_at: string | null
          status: string
          updated_at: string
          variables: Json
          variant: string | null
        }
        Insert: {
          campaign_id: string
          contact_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          provider_message_id?: string | null
          recipient_phone: string
          sent_at?: string | null
          status?: string
          updated_at?: string
          variables?: Json
          variant?: string | null
        }
        Update: {
          campaign_id?: string
          contact_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          provider_message_id?: string | null
          recipient_phone?: string
          sent_at?: string | null
          status?: string
          updated_at?: string
          variables?: Json
          variant?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wa_campaign_recipients_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "wa_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wa_campaign_recipients_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "wa_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      wa_campaigns: {
        Row: {
          audience_filter: Json
          completed_at: string | null
          created_at: string
          delivered_count: number
          failed_count: number
          id: string
          metadata: Json
          name: string
          pacing_per_minute: number
          phone_number_id: string | null
          read_count: number
          scheduled_at: string | null
          sent_count: number
          started_at: string | null
          status: string
          template_id: string | null
          total_count: number
          updated_at: string
          variable_mapping: Json
          variants: Json
        }
        Insert: {
          audience_filter?: Json
          completed_at?: string | null
          created_at?: string
          delivered_count?: number
          failed_count?: number
          id?: string
          metadata?: Json
          name: string
          pacing_per_minute?: number
          phone_number_id?: string | null
          read_count?: number
          scheduled_at?: string | null
          sent_count?: number
          started_at?: string | null
          status?: string
          template_id?: string | null
          total_count?: number
          updated_at?: string
          variable_mapping?: Json
          variants?: Json
        }
        Update: {
          audience_filter?: Json
          completed_at?: string | null
          created_at?: string
          delivered_count?: number
          failed_count?: number
          id?: string
          metadata?: Json
          name?: string
          pacing_per_minute?: number
          phone_number_id?: string | null
          read_count?: number
          scheduled_at?: string | null
          sent_count?: number
          started_at?: string | null
          status?: string
          template_id?: string | null
          total_count?: number
          updated_at?: string
          variable_mapping?: Json
          variants?: Json
        }
        Relationships: [
          {
            foreignKeyName: "wa_campaigns_phone_number_id_fkey"
            columns: ["phone_number_id"]
            isOneToOne: false
            referencedRelation: "wa_phone_numbers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wa_campaigns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "wa_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      wa_contacts: {
        Row: {
          created_at: string
          custom_fields: Json
          id: string
          last_message_at: string | null
          lifecycle_stage: string | null
          metadata: Json
          name: string
          notes: string | null
          opt_out_reason: string | null
          opted_out_at: string | null
          phone_number: string
          source: string
          status: string
          tags: string[]
          updated_at: string
        }
        Insert: {
          created_at?: string
          custom_fields?: Json
          id?: string
          last_message_at?: string | null
          lifecycle_stage?: string | null
          metadata?: Json
          name: string
          notes?: string | null
          opt_out_reason?: string | null
          opted_out_at?: string | null
          phone_number: string
          source?: string
          status?: string
          tags?: string[]
          updated_at?: string
        }
        Update: {
          created_at?: string
          custom_fields?: Json
          id?: string
          last_message_at?: string | null
          lifecycle_stage?: string | null
          metadata?: Json
          name?: string
          notes?: string | null
          opt_out_reason?: string | null
          opted_out_at?: string | null
          phone_number?: string
          source?: string
          status?: string
          tags?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      wa_conversations: {
        Row: {
          assigned_to: string | null
          contact_id: string | null
          created_at: string
          external_contact_phone: string
          id: string
          labels: string[]
          last_message_at: string | null
          last_message_preview: string | null
          metadata: Json
          phone_number_id: string | null
          status: string
          unread_count: number
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          contact_id?: string | null
          created_at?: string
          external_contact_phone: string
          id?: string
          labels?: string[]
          last_message_at?: string | null
          last_message_preview?: string | null
          metadata?: Json
          phone_number_id?: string | null
          status?: string
          unread_count?: number
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          contact_id?: string | null
          created_at?: string
          external_contact_phone?: string
          id?: string
          labels?: string[]
          last_message_at?: string | null
          last_message_preview?: string | null
          metadata?: Json
          phone_number_id?: string | null
          status?: string
          unread_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wa_conversations_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "wa_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wa_conversations_phone_number_id_fkey"
            columns: ["phone_number_id"]
            isOneToOne: false
            referencedRelation: "wa_phone_numbers"
            referencedColumns: ["id"]
          },
        ]
      }
      wa_media_assets: {
        Row: {
          created_at: string
          file_size: number | null
          filename: string
          id: string
          media_type: string
          metadata: Json
          mime_type: string
          phone_number_id: string | null
          provider_media_id: string | null
          source_url: string | null
          updated_at: string
          usage_count: number
        }
        Insert: {
          created_at?: string
          file_size?: number | null
          filename: string
          id?: string
          media_type: string
          metadata?: Json
          mime_type: string
          phone_number_id?: string | null
          provider_media_id?: string | null
          source_url?: string | null
          updated_at?: string
          usage_count?: number
        }
        Update: {
          created_at?: string
          file_size?: number | null
          filename?: string
          id?: string
          media_type?: string
          metadata?: Json
          mime_type?: string
          phone_number_id?: string | null
          provider_media_id?: string | null
          source_url?: string | null
          updated_at?: string
          usage_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "wa_media_assets_phone_number_id_fkey"
            columns: ["phone_number_id"]
            isOneToOne: false
            referencedRelation: "wa_phone_numbers"
            referencedColumns: ["id"]
          },
        ]
      }
      wa_messages: {
        Row: {
          ai_summary: string | null
          auto_tags: string[]
          body: string | null
          contact_id: string | null
          conversation_id: string | null
          created_at: string
          delivered_at: string | null
          direction: string
          error_message: string | null
          id: string
          media_id: string | null
          media_mime_type: string | null
          media_url: string | null
          message_type: string
          phone_number_id: string | null
          provider_message_id: string | null
          raw_payload: Json
          read_at: string | null
          sent_at: string | null
          sentiment: string | null
          status: string
          template_language: string | null
          template_name: string | null
          updated_at: string
        }
        Insert: {
          ai_summary?: string | null
          auto_tags?: string[]
          body?: string | null
          contact_id?: string | null
          conversation_id?: string | null
          created_at?: string
          delivered_at?: string | null
          direction: string
          error_message?: string | null
          id?: string
          media_id?: string | null
          media_mime_type?: string | null
          media_url?: string | null
          message_type?: string
          phone_number_id?: string | null
          provider_message_id?: string | null
          raw_payload?: Json
          read_at?: string | null
          sent_at?: string | null
          sentiment?: string | null
          status?: string
          template_language?: string | null
          template_name?: string | null
          updated_at?: string
        }
        Update: {
          ai_summary?: string | null
          auto_tags?: string[]
          body?: string | null
          contact_id?: string | null
          conversation_id?: string | null
          created_at?: string
          delivered_at?: string | null
          direction?: string
          error_message?: string | null
          id?: string
          media_id?: string | null
          media_mime_type?: string | null
          media_url?: string | null
          message_type?: string
          phone_number_id?: string | null
          provider_message_id?: string | null
          raw_payload?: Json
          read_at?: string | null
          sent_at?: string | null
          sentiment?: string | null
          status?: string
          template_language?: string | null
          template_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wa_messages_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "wa_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wa_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "wa_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wa_messages_phone_number_id_fkey"
            columns: ["phone_number_id"]
            isOneToOne: false
            referencedRelation: "wa_phone_numbers"
            referencedColumns: ["id"]
          },
        ]
      }
      wa_outbound_webhook_deliveries: {
        Row: {
          attempt_number: number
          created_at: string
          error_message: string | null
          event_type: string
          http_status: number | null
          id: string
          latency_ms: number | null
          request_payload: Json
          response_body: string | null
          status: string
          target_url: string
          webhook_id: string | null
        }
        Insert: {
          attempt_number?: number
          created_at?: string
          error_message?: string | null
          event_type: string
          http_status?: number | null
          id?: string
          latency_ms?: number | null
          request_payload?: Json
          response_body?: string | null
          status?: string
          target_url: string
          webhook_id?: string | null
        }
        Update: {
          attempt_number?: number
          created_at?: string
          error_message?: string | null
          event_type?: string
          http_status?: number | null
          id?: string
          latency_ms?: number | null
          request_payload?: Json
          response_body?: string | null
          status?: string
          target_url?: string
          webhook_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wa_outbound_webhook_deliveries_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "wa_outbound_webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      wa_outbound_webhooks: {
        Row: {
          created_at: string
          enabled: boolean
          events: string[]
          failure_count: number
          id: string
          last_delivery_at: string | null
          last_error: string | null
          last_status: string | null
          metadata: Json
          name: string
          secret: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          events?: string[]
          failure_count?: number
          id?: string
          last_delivery_at?: string | null
          last_error?: string | null
          last_status?: string | null
          metadata?: Json
          name: string
          secret?: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          events?: string[]
          failure_count?: number
          id?: string
          last_delivery_at?: string | null
          last_error?: string | null
          last_status?: string | null
          metadata?: Json
          name?: string
          secret?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      wa_phone_numbers: {
        Row: {
          created_at: string
          display_name: string
          id: string
          is_default: boolean
          last_verified_at: string | null
          metadata: Json
          phone_number: string
          phone_number_id: string
          quality_rating: string | null
          status: string
          updated_at: string
          verified_name: string | null
          waba_id: string
        }
        Insert: {
          created_at?: string
          display_name: string
          id?: string
          is_default?: boolean
          last_verified_at?: string | null
          metadata?: Json
          phone_number: string
          phone_number_id: string
          quality_rating?: string | null
          status?: string
          updated_at?: string
          verified_name?: string | null
          waba_id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          is_default?: boolean
          last_verified_at?: string | null
          metadata?: Json
          phone_number?: string
          phone_number_id?: string
          quality_rating?: string | null
          status?: string
          updated_at?: string
          verified_name?: string | null
          waba_id?: string
        }
        Relationships: []
      }
      wa_quick_replies: {
        Row: {
          body: string
          category: string | null
          created_at: string
          id: string
          shortcut: string
          updated_at: string
        }
        Insert: {
          body: string
          category?: string | null
          created_at?: string
          id?: string
          shortcut: string
          updated_at?: string
        }
        Update: {
          body?: string
          category?: string | null
          created_at?: string
          id?: string
          shortcut?: string
          updated_at?: string
        }
        Relationships: []
      }
      wa_segments: {
        Row: {
          created_at: string
          description: string | null
          filter: Json
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          filter?: Json
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          filter?: Json
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      wa_send_attempts: {
        Row: {
          attempt_number: number
          created_at: string
          error_code: string | null
          error_message: string | null
          http_status: number | null
          id: string
          kind: string
          latency_ms: number | null
          message_id: string | null
          phone_number_id: string | null
          provider_message_id: string | null
          recipient_phone: string | null
          request_payload: Json
          response_payload: Json
          stage: string
          status: string
          template_id: string | null
          template_name: string | null
          updated_at: string
        }
        Insert: {
          attempt_number?: number
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          http_status?: number | null
          id?: string
          kind?: string
          latency_ms?: number | null
          message_id?: string | null
          phone_number_id?: string | null
          provider_message_id?: string | null
          recipient_phone?: string | null
          request_payload?: Json
          response_payload?: Json
          stage?: string
          status?: string
          template_id?: string | null
          template_name?: string | null
          updated_at?: string
        }
        Update: {
          attempt_number?: number
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          http_status?: number | null
          id?: string
          kind?: string
          latency_ms?: number | null
          message_id?: string | null
          phone_number_id?: string | null
          provider_message_id?: string | null
          recipient_phone?: string | null
          request_payload?: Json
          response_payload?: Json
          stage?: string
          status?: string
          template_id?: string | null
          template_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      wa_templates: {
        Row: {
          category: string
          components: Json
          created_at: string
          id: string
          language: string
          metadata: Json
          name: string
          rejection_reason: string | null
          status: string
          updated_at: string
          variables: Json
          waba_id: string
        }
        Insert: {
          category: string
          components?: Json
          created_at?: string
          id?: string
          language: string
          metadata?: Json
          name: string
          rejection_reason?: string | null
          status?: string
          updated_at?: string
          variables?: Json
          waba_id: string
        }
        Update: {
          category?: string
          components?: Json
          created_at?: string
          id?: string
          language?: string
          metadata?: Json
          name?: string
          rejection_reason?: string | null
          status?: string
          updated_at?: string
          variables?: Json
          waba_id?: string
        }
        Relationships: []
      }
      wa_test_numbers: {
        Row: {
          created_at: string
          id: string
          label: string
          phone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          phone: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          phone?: string
          updated_at?: string
        }
        Relationships: []
      }
      wa_webhook_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          payload: Json
          processed: boolean
          processing_error: string | null
          provider_message_id: string | null
          provider_object: string | null
          received_at: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          payload?: Json
          processed?: boolean
          processing_error?: string | null
          provider_message_id?: string | null
          provider_object?: string | null
          received_at?: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          payload?: Json
          processed?: boolean
          processing_error?: string | null
          provider_message_id?: string | null
          provider_object?: string | null
          received_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_ai_config_safe: {
        Args: never
        Returns: {
          custom_api_key_preview: string
          custom_base_url: string
          custom_model: string
          has_custom_api_key: boolean
          model: string
          provider: string
          updated_at: string
        }[]
      }
      set_default_wa_phone_number: {
        Args: { _phone_number_uuid: string }
        Returns: undefined
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
  public: {
    Enums: {},
  },
} as const
