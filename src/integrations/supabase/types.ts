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
      ai_conversations: {
        Row: {
          ai_feature_type: string
          created_at: string
          id: string
          meeting_id: string | null
          message: string
          metadata: Json | null
          response: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          ai_feature_type: string
          created_at?: string
          id?: string
          meeting_id?: string | null
          message: string
          metadata?: Json | null
          response?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          ai_feature_type?: string
          created_at?: string
          id?: string
          meeting_id?: string | null
          message?: string
          metadata?: Json | null
          response?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversations_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_meeting_insights: {
        Row: {
          confidence_score: number | null
          content: Json
          created_at: string
          id: string
          insight_type: string
          meeting_id: string | null
        }
        Insert: {
          confidence_score?: number | null
          content: Json
          created_at?: string
          id?: string
          insight_type: string
          meeting_id?: string | null
        }
        Update: {
          confidence_score?: number | null
          content?: Json
          created_at?: string
          id?: string
          insight_type?: string
          meeting_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_meeting_insights_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_participants: {
        Row: {
          guest_name: string | null
          id: string
          is_co_host: boolean | null
          is_host: boolean | null
          joined_at: string | null
          left_at: string | null
          meeting_id: string | null
          role: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          guest_name?: string | null
          id?: string
          is_co_host?: boolean | null
          is_host?: boolean | null
          joined_at?: string | null
          left_at?: string | null
          meeting_id?: string | null
          role?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          guest_name?: string | null
          id?: string
          is_co_host?: boolean | null
          is_host?: boolean | null
          joined_at?: string | null
          left_at?: string | null
          meeting_id?: string | null
          role?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_participants_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_transcriptions: {
        Row: {
          confidence_score: number | null
          created_at: string
          end_time: number
          id: string
          is_final: boolean | null
          language_code: string | null
          meeting_id: string | null
          participant_id: string | null
          start_time: number
          transcript_text: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          end_time: number
          id?: string
          is_final?: boolean | null
          language_code?: string | null
          meeting_id?: string | null
          participant_id?: string | null
          start_time: number
          transcript_text: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          end_time?: number
          id?: string
          is_final?: boolean | null
          language_code?: string | null
          meeting_id?: string | null
          participant_id?: string | null
          start_time?: number
          transcript_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_transcriptions_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_transcriptions_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "meeting_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          ai_features_enabled: boolean | null
          ai_summary_generated: boolean | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          host_id: string | null
          id: string
          is_active: boolean | null
          is_recording: boolean | null
          lobby_enabled: boolean | null
          max_participants: number | null
          meeting_code: string
          participants_count: number | null
          scheduled_time: string | null
          settings: Json | null
          title: string
          transcription_enabled: boolean | null
          updated_at: string | null
          whiteboard_enabled: boolean | null
        }
        Insert: {
          ai_features_enabled?: boolean | null
          ai_summary_generated?: boolean | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          host_id?: string | null
          id?: string
          is_active?: boolean | null
          is_recording?: boolean | null
          lobby_enabled?: boolean | null
          max_participants?: number | null
          meeting_code: string
          participants_count?: number | null
          scheduled_time?: string | null
          settings?: Json | null
          title: string
          transcription_enabled?: boolean | null
          updated_at?: string | null
          whiteboard_enabled?: boolean | null
        }
        Update: {
          ai_features_enabled?: boolean | null
          ai_summary_generated?: boolean | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          host_id?: string | null
          id?: string
          is_active?: boolean | null
          is_recording?: boolean | null
          lobby_enabled?: boolean | null
          max_participants?: number | null
          meeting_code?: string
          participants_count?: number | null
          scheduled_time?: string | null
          settings?: Json | null
          title?: string
          transcription_enabled?: boolean | null
          updated_at?: string | null
          whiteboard_enabled?: boolean | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      whiteboard_data: {
        Row: {
          action_type: string
          created_at: string
          drawing_data: Json
          guest_name: string | null
          id: string
          meeting_id: string
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string
          drawing_data: Json
          guest_name?: string | null
          id?: string
          meeting_id: string
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string
          drawing_data?: Json
          guest_name?: string | null
          id?: string
          meeting_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whiteboard_data_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_meeting_code: {
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
