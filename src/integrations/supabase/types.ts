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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      app_users: {
        Row: {
          auth_uid: string
          cliente_id: number | null
          criado_em: string | null
          email: string | null
          id: number
          nome: string
          papel: Database["public"]["Enums"]["user_role"]
          softwares: string[] | null
        }
        Insert: {
          auth_uid: string
          cliente_id?: number | null
          criado_em?: string | null
          email?: string | null
          id?: number
          nome: string
          papel?: Database["public"]["Enums"]["user_role"]
          softwares?: string[] | null
        }
        Update: {
          auth_uid?: string
          cliente_id?: number | null
          criado_em?: string | null
          email?: string | null
          id?: number
          nome?: string
          papel?: Database["public"]["Enums"]["user_role"]
          softwares?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_app_users_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          ativo: boolean | null
          cnpj: string | null
          criado_em: string | null
          email: string | null
          id: number
          nome: string
          telefone: string | null
        }
        Insert: {
          ativo?: boolean | null
          cnpj?: string | null
          criado_em?: string | null
          email?: string | null
          id?: number
          nome: string
          telefone?: string | null
        }
        Update: {
          ativo?: boolean | null
          cnpj?: string | null
          criado_em?: string | null
          email?: string | null
          id?: number
          nome?: string
          telefone?: string | null
        }
        Relationships: []
      }
      exam_types: {
        Row: {
          criado_em: string | null
          id: number
          nome: string
        }
        Insert: {
          criado_em?: string | null
          id?: number
          nome: string
        }
        Update: {
          criado_em?: string | null
          id?: number
          nome?: string
        }
        Relationships: []
      }
      exams: {
        Row: {
          atualizado_em: string | null
          client_id: number | null
          criado_em: string | null
          exam_type_id: number | null
          id: number
          margem: number | null
          paciente_data_nascimento: string | null
          paciente_nome: string
          radiologista_id: number | null
          software: Database["public"]["Enums"]["exam_software"]
          status: Database["public"]["Enums"]["exam_status"]
          valor_cliente: number | null
          valor_radiologista: number | null
        }
        Insert: {
          atualizado_em?: string | null
          client_id?: number | null
          criado_em?: string | null
          exam_type_id?: number | null
          id?: number
          margem?: number | null
          paciente_data_nascimento?: string | null
          paciente_nome: string
          radiologista_id?: number | null
          software: Database["public"]["Enums"]["exam_software"]
          status?: Database["public"]["Enums"]["exam_status"]
          valor_cliente?: number | null
          valor_radiologista?: number | null
        }
        Update: {
          atualizado_em?: string | null
          client_id?: number | null
          criado_em?: string | null
          exam_type_id?: number | null
          id?: number
          margem?: number | null
          paciente_data_nascimento?: string | null
          paciente_nome?: string
          radiologista_id?: number | null
          software?: Database["public"]["Enums"]["exam_software"]
          status?: Database["public"]["Enums"]["exam_status"]
          valor_cliente?: number | null
          valor_radiologista?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "exams_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exams_exam_type_id_fkey"
            columns: ["exam_type_id"]
            isOneToOne: false
            referencedRelation: "exam_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exams_radiologista_id_fkey"
            columns: ["radiologista_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_participants: {
        Row: {
          id: number
          meeting_id: number | null
          user_id: number | null
        }
        Insert: {
          id?: number
          meeting_id?: number | null
          user_id?: number | null
        }
        Update: {
          id?: number
          meeting_id?: number | null
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_participants_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          criado_em: string | null
          criado_por: number | null
          descricao: string | null
          fim: string
          id: number
          inicio: string
          titulo: string
        }
        Insert: {
          criado_em?: string | null
          criado_por?: number | null
          descricao?: string | null
          fim: string
          id?: number
          inicio: string
          titulo: string
        }
        Update: {
          criado_em?: string | null
          criado_por?: number | null
          descricao?: string | null
          fim?: string
          id?: number
          inicio?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetings_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      price_table_clients: {
        Row: {
          client_id: number | null
          exam_type_id: number | null
          id: number
          valor_cliente: number
        }
        Insert: {
          client_id?: number | null
          exam_type_id?: number | null
          id?: number
          valor_cliente: number
        }
        Update: {
          client_id?: number | null
          exam_type_id?: number | null
          id?: number
          valor_cliente?: number
        }
        Relationships: [
          {
            foreignKeyName: "price_table_clients_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_table_clients_exam_type_id_fkey"
            columns: ["exam_type_id"]
            isOneToOne: false
            referencedRelation: "exam_types"
            referencedColumns: ["id"]
          },
        ]
      }
      price_table_radiologist: {
        Row: {
          client_id: number | null
          exam_type_id: number | null
          id: number
          radiologista_id: number | null
          valor_radiologista: number
        }
        Insert: {
          client_id?: number | null
          exam_type_id?: number | null
          id?: number
          radiologista_id?: number | null
          valor_radiologista: number
        }
        Update: {
          client_id?: number | null
          exam_type_id?: number | null
          id?: number
          radiologista_id?: number | null
          valor_radiologista?: number
        }
        Relationships: [
          {
            foreignKeyName: "price_table_radiologist_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_table_radiologist_exam_type_id_fkey"
            columns: ["exam_type_id"]
            isOneToOne: false
            referencedRelation: "exam_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_table_radiologist_radiologista_id_fkey"
            columns: ["radiologista_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      vacations: {
        Row: {
          criado_em: string | null
          data_fim: string
          data_inicio: string
          id: number
          observacao: string | null
          user_id: number | null
        }
        Insert: {
          criado_em?: string | null
          data_fim: string
          data_inicio: string
          id?: number
          observacao?: string | null
          user_id?: number | null
        }
        Update: {
          criado_em?: string | null
          data_fim?: string
          data_inicio?: string
          id?: number
          observacao?: string | null
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vacations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_identity: {
        Args: never
        Returns: {
          role: Database["public"]["Enums"]["user_role"]
          user_id: number
        }[]
      }
      current_user_id: { Args: never; Returns: number }
      current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      init_current_user: {
        Args: { p_email: string; p_nome: string }
        Returns: {
          auth_uid: string
          cliente_id: number | null
          criado_em: string | null
          email: string | null
          id: number
          nome: string
          papel: Database["public"]["Enums"]["user_role"]
          softwares: string[] | null
        }
        SetofOptions: {
          from: "*"
          to: "app_users"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      exam_software: "Axel" | "Morita"
      exam_status: "Disponível" | "Em análise" | "Finalizado" | "Cancelado"
      user_role: "admin" | "radiologista" | "cliente" | "nenhum"
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
    Enums: {
      exam_software: ["Axel", "Morita"],
      exam_status: ["Disponível", "Em análise", "Finalizado", "Cancelado"],
      user_role: ["admin", "radiologista", "cliente", "nenhum"],
    },
  },
} as const
