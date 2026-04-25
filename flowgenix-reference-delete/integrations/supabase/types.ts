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
      agent_config: {
        Row: {
          default_model_id: string | null
          enable_calculator: boolean
          enable_router: boolean
          enable_web_search: boolean
          id: string
          name: string
          singleton: boolean
          stream_delay_ms: number
          system_prompt: string
          temperature: number
          updated_at: string
        }
        Insert: {
          default_model_id?: string | null
          enable_calculator?: boolean
          enable_router?: boolean
          enable_web_search?: boolean
          id?: string
          name?: string
          singleton?: boolean
          stream_delay_ms?: number
          system_prompt?: string
          temperature?: number
          updated_at?: string
        }
        Update: {
          default_model_id?: string | null
          enable_calculator?: boolean
          enable_router?: boolean
          enable_web_search?: boolean
          id?: string
          name?: string
          singleton?: boolean
          stream_delay_ms?: number
          system_prompt?: string
          temperature?: number
          updated_at?: string
        }
        Relationships: []
      }
      chat_threads: {
        Row: {
          created_at: string
          id: string
          scope: string
          title: string
          updated_at: string
          workflow_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          scope?: string
          title?: string
          updated_at?: string
          workflow_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          scope?: string
          title?: string
          updated_at?: string
          workflow_id?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          meta: string | null
          role: string
          thread_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          meta?: string | null
          role: string
          thread_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          meta?: string | null
          role?: string
          thread_id?: string | null
        }
        Relationships: []
      }
      models: {
        Row: {
          api_key: string
          base_url: string
          capabilities: string[]
          created_at: string
          id: string
          label: string
          last_latency_ms: number | null
          last_test_at: string | null
          last_test_message: string | null
          last_test_ok: boolean | null
          model: string
          provider: string
          strengths: string | null
        }
        Insert: {
          api_key?: string
          base_url?: string
          capabilities?: string[]
          created_at?: string
          id?: string
          label: string
          last_latency_ms?: number | null
          last_test_at?: string | null
          last_test_message?: string | null
          last_test_ok?: boolean | null
          model?: string
          provider?: string
          strengths?: string | null
        }
        Update: {
          api_key?: string
          base_url?: string
          capabilities?: string[]
          created_at?: string
          id?: string
          label?: string
          last_latency_ms?: number | null
          last_test_at?: string | null
          last_test_message?: string | null
          last_test_ok?: boolean | null
          model?: string
          provider?: string
          strengths?: string | null
        }
        Relationships: []
      }
      node_credentials: {
        Row: {
          config: Json
          created_at: string
          id: string
          kind: string
          name: string
          secret_id: string | null
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          id?: string
          kind: string
          name: string
          secret_id?: string | null
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          kind?: string
          name?: string
          secret_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "node_credentials_secret_id_fkey"
            columns: ["secret_id"]
            isOneToOne: false
            referencedRelation: "node_secrets"
            referencedColumns: ["id"]
          },
        ]
      }
      node_secrets: {
        Row: {
          created_at: string
          id: string
          kind: string
          name: string
          secrets: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          name: string
          secrets?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          name?: string
          secrets?: Json
          updated_at?: string
        }
        Relationships: []
      }
      rag_docs: {
        Row: {
          chunks: Json
          created_at: string
          id: string
          name: string
        }
        Insert: {
          chunks?: Json
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          chunks?: Json
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      workflow_run_logs: {
        Row: {
          created_at: string
          data: Json | null
          duration_ms: number | null
          id: string
          message: string | null
          node_id: string
          node_kind: string | null
          node_label: string | null
          run_id: string
          status: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          duration_ms?: number | null
          id?: string
          message?: string | null
          node_id: string
          node_kind?: string | null
          node_label?: string | null
          run_id: string
          status?: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          duration_ms?: number | null
          id?: string
          message?: string | null
          node_id?: string
          node_kind?: string | null
          node_label?: string | null
          run_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_run_logs_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "workflow_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_runs: {
        Row: {
          error: string | null
          finished_at: string | null
          id: string
          input: Json | null
          output: Json | null
          started_at: string
          status: string
          trigger: string
          workflow_id: string
        }
        Insert: {
          error?: string | null
          finished_at?: string | null
          id?: string
          input?: Json | null
          output?: Json | null
          started_at?: string
          status?: string
          trigger?: string
          workflow_id: string
        }
        Update: {
          error?: string | null
          finished_at?: string | null
          id?: string
          input?: Json | null
          output?: Json | null
          started_at?: string
          status?: string
          trigger?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_runs_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          created_at: string
          edges: Json
          failure_webhook_url: string | null
          id: string
          is_template: boolean
          name: string
          nodes: Json
          schedule_cron: string | null
          schedule_enabled: boolean
          status: string
          updated_at: string
          webhook_token: string | null
        }
        Insert: {
          created_at?: string
          edges?: Json
          failure_webhook_url?: string | null
          id?: string
          is_template?: boolean
          name?: string
          nodes?: Json
          schedule_cron?: string | null
          schedule_enabled?: boolean
          status?: string
          updated_at?: string
          webhook_token?: string | null
        }
        Update: {
          created_at?: string
          edges?: Json
          failure_webhook_url?: string | null
          id?: string
          is_template?: boolean
          name?: string
          nodes?: Json
          schedule_cron?: string | null
          schedule_enabled?: boolean
          status?: string
          updated_at?: string
          webhook_token?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      schedule_workflow_cron: {
        Args: {
          _anon_key: string
          _cron: string
          _fn_url: string
          _workflow_id: string
        }
        Returns: undefined
      }
      unschedule_workflow_cron: {
        Args: { _workflow_id: string }
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
