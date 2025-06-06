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
      action_items: {
        Row: {
          ai_generated: boolean | null
          assignee_id: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          meeting_id: string | null
          priority: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          ai_generated?: boolean | null
          assignee_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          meeting_id?: string | null
          priority?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          ai_generated?: boolean | null
          assignee_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          meeting_id?: string | null
          priority?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "action_items_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "meeting_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_items_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
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
      audio_settings: {
        Row: {
          auto_gain_control: boolean | null
          created_at: string | null
          echo_cancellation: boolean | null
          id: string
          meeting_id: string | null
          noise_reduction_enabled: boolean | null
          noise_reduction_level: number | null
          settings_data: Json | null
          updated_at: string | null
          voice_enhancement: boolean | null
        }
        Insert: {
          auto_gain_control?: boolean | null
          created_at?: string | null
          echo_cancellation?: boolean | null
          id?: string
          meeting_id?: string | null
          noise_reduction_enabled?: boolean | null
          noise_reduction_level?: number | null
          settings_data?: Json | null
          updated_at?: string | null
          voice_enhancement?: boolean | null
        }
        Update: {
          auto_gain_control?: boolean | null
          created_at?: string | null
          echo_cancellation?: boolean | null
          id?: string
          meeting_id?: string | null
          noise_reduction_enabled?: boolean | null
          noise_reduction_level?: number | null
          settings_data?: Json | null
          updated_at?: string | null
          voice_enhancement?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "audio_settings_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      lobby_queue: {
        Row: {
          approval_status: Database["public"]["Enums"]["approval_status"] | null
          approved_at: string | null
          approved_by: string | null
          device_info: Json | null
          email: string | null
          guest_name: string | null
          host_notes: string | null
          id: string
          joined_lobby_at: string | null
          meeting_id: string | null
          network_quality: Json | null
          rejection_reason: string | null
          user_id: string | null
          wait_time_estimate: number | null
        }
        Insert: {
          approval_status?:
            | Database["public"]["Enums"]["approval_status"]
            | null
          approved_at?: string | null
          approved_by?: string | null
          device_info?: Json | null
          email?: string | null
          guest_name?: string | null
          host_notes?: string | null
          id?: string
          joined_lobby_at?: string | null
          meeting_id?: string | null
          network_quality?: Json | null
          rejection_reason?: string | null
          user_id?: string | null
          wait_time_estimate?: number | null
        }
        Update: {
          approval_status?:
            | Database["public"]["Enums"]["approval_status"]
            | null
          approved_at?: string | null
          approved_by?: string | null
          device_info?: Json | null
          email?: string | null
          guest_name?: string | null
          host_notes?: string | null
          id?: string
          joined_lobby_at?: string | null
          meeting_id?: string | null
          network_quality?: Json | null
          rejection_reason?: string | null
          user_id?: string | null
          wait_time_estimate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lobby_queue_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lobby_queue_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lobby_queue_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_analytics: {
        Row: {
          average_engagement_score: number | null
          created_at: string | null
          engagement_metrics: Json | null
          id: string
          meeting_id: string | null
          participant_count: number | null
          sentiment_analysis: Json | null
          total_silence_time: number | null
          total_speaking_time: number | null
          updated_at: string | null
        }
        Insert: {
          average_engagement_score?: number | null
          created_at?: string | null
          engagement_metrics?: Json | null
          id?: string
          meeting_id?: string | null
          participant_count?: number | null
          sentiment_analysis?: Json | null
          total_silence_time?: number | null
          total_speaking_time?: number | null
          updated_at?: string | null
        }
        Update: {
          average_engagement_score?: number | null
          created_at?: string | null
          engagement_metrics?: Json | null
          id?: string
          meeting_id?: string | null
          participant_count?: number | null
          sentiment_analysis?: Json | null
          total_silence_time?: number | null
          total_speaking_time?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_analytics_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_invitations: {
        Row: {
          email: string
          expires_at: string | null
          id: string
          invitation_token: string | null
          invited_by: string | null
          meeting_id: string | null
          reminder_count: number | null
          responded_at: string | null
          response_status: string | null
          sent_at: string | null
        }
        Insert: {
          email: string
          expires_at?: string | null
          id?: string
          invitation_token?: string | null
          invited_by?: string | null
          meeting_id?: string | null
          reminder_count?: number | null
          responded_at?: string | null
          response_status?: string | null
          sent_at?: string | null
        }
        Update: {
          email?: string
          expires_at?: string | null
          id?: string
          invitation_token?: string | null
          invited_by?: string | null
          meeting_id?: string | null
          reminder_count?: number | null
          responded_at?: string | null
          response_status?: string | null
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_invitations_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_participants: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          device_info: Json | null
          email: string | null
          guest_name: string | null
          id: string
          is_co_host: boolean | null
          is_host: boolean | null
          joined_at: string | null
          left_at: string | null
          location_info: Json | null
          meeting_id: string | null
          role: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          device_info?: Json | null
          email?: string | null
          guest_name?: string | null
          id?: string
          is_co_host?: boolean | null
          is_host?: boolean | null
          joined_at?: string | null
          left_at?: string | null
          location_info?: Json | null
          meeting_id?: string | null
          role?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          device_info?: Json | null
          email?: string | null
          guest_name?: string | null
          id?: string
          is_co_host?: boolean | null
          is_host?: boolean | null
          joined_at?: string | null
          left_at?: string | null
          location_info?: Json | null
          meeting_id?: string | null
          role?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_participants_approved_by"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_participants_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_settings: {
        Row: {
          auto_admit_domains: string[] | null
          created_at: string | null
          id: string
          integration_settings: Json | null
          meeting_id: string | null
          notification_settings: Json | null
          security_settings: Json | null
          time_based_rules: Json | null
          updated_at: string | null
          whitelist_users: string[] | null
        }
        Insert: {
          auto_admit_domains?: string[] | null
          created_at?: string | null
          id?: string
          integration_settings?: Json | null
          meeting_id?: string | null
          notification_settings?: Json | null
          security_settings?: Json | null
          time_based_rules?: Json | null
          updated_at?: string | null
          whitelist_users?: string[] | null
        }
        Update: {
          auto_admit_domains?: string[] | null
          created_at?: string | null
          id?: string
          integration_settings?: Json | null
          meeting_id?: string | null
          notification_settings?: Json | null
          security_settings?: Json | null
          time_based_rules?: Json | null
          updated_at?: string | null
          whitelist_users?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_settings_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_summaries: {
        Row: {
          ai_confidence_score: number | null
          content: string
          created_at: string | null
          decisions_made: Json | null
          id: string
          key_points: Json | null
          meeting_id: string | null
          next_steps: Json | null
          summary_type: string
        }
        Insert: {
          ai_confidence_score?: number | null
          content: string
          created_at?: string | null
          decisions_made?: Json | null
          id?: string
          key_points?: Json | null
          meeting_id?: string | null
          next_steps?: Json | null
          summary_type: string
        }
        Update: {
          ai_confidence_score?: number | null
          content?: string
          created_at?: string | null
          decisions_made?: Json | null
          id?: string
          key_points?: Json | null
          meeting_id?: string | null
          next_steps?: Json | null
          summary_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_summaries_meeting_id_fkey"
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
      meeting_translations: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          id: string
          meeting_id: string | null
          original_text: string
          participant_id: string | null
          source_language: string
          target_language: string
          timestamp_seconds: number
          translated_text: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          meeting_id?: string | null
          original_text: string
          participant_id?: string | null
          source_language: string
          target_language: string
          timestamp_seconds: number
          translated_text: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          meeting_id?: string | null
          original_text?: string
          participant_id?: string | null
          source_language?: string
          target_language?: string
          timestamp_seconds?: number
          translated_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_translations_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_translations_participant_id_fkey"
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
          allow_anonymous: boolean | null
          auto_recording: boolean | null
          background_url: string | null
          company_logo_url: string | null
          created_at: string | null
          creator_id: string | null
          description: string | null
          domain_restriction: string | null
          duration_minutes: number | null
          host_id: string | null
          id: string
          is_active: boolean | null
          is_recording: boolean | null
          link_expiration: string | null
          lobby_enabled: boolean | null
          max_participants: number | null
          meeting_code: string
          meeting_link_expires_at: string | null
          meeting_password: string | null
          participants_count: number | null
          password_protected: boolean | null
          recording_enabled: boolean | null
          require_approval: boolean | null
          scheduled_time: string | null
          settings: Json | null
          shareable_link: string | null
          status: Database["public"]["Enums"]["meeting_status"] | null
          title: string
          transcription_enabled: boolean | null
          updated_at: string | null
          welcome_message: string | null
          whiteboard_enabled: boolean | null
        }
        Insert: {
          ai_features_enabled?: boolean | null
          ai_summary_generated?: boolean | null
          allow_anonymous?: boolean | null
          auto_recording?: boolean | null
          background_url?: string | null
          company_logo_url?: string | null
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          domain_restriction?: string | null
          duration_minutes?: number | null
          host_id?: string | null
          id?: string
          is_active?: boolean | null
          is_recording?: boolean | null
          link_expiration?: string | null
          lobby_enabled?: boolean | null
          max_participants?: number | null
          meeting_code: string
          meeting_link_expires_at?: string | null
          meeting_password?: string | null
          participants_count?: number | null
          password_protected?: boolean | null
          recording_enabled?: boolean | null
          require_approval?: boolean | null
          scheduled_time?: string | null
          settings?: Json | null
          shareable_link?: string | null
          status?: Database["public"]["Enums"]["meeting_status"] | null
          title: string
          transcription_enabled?: boolean | null
          updated_at?: string | null
          welcome_message?: string | null
          whiteboard_enabled?: boolean | null
        }
        Update: {
          ai_features_enabled?: boolean | null
          ai_summary_generated?: boolean | null
          allow_anonymous?: boolean | null
          auto_recording?: boolean | null
          background_url?: string | null
          company_logo_url?: string | null
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          domain_restriction?: string | null
          duration_minutes?: number | null
          host_id?: string | null
          id?: string
          is_active?: boolean | null
          is_recording?: boolean | null
          link_expiration?: string | null
          lobby_enabled?: boolean | null
          max_participants?: number | null
          meeting_code?: string
          meeting_link_expires_at?: string | null
          meeting_password?: string | null
          participants_count?: number | null
          password_protected?: boolean | null
          recording_enabled?: boolean | null
          require_approval?: boolean | null
          scheduled_time?: string | null
          settings?: Json | null
          shareable_link?: string | null
          status?: Database["public"]["Enums"]["meeting_status"] | null
          title?: string
          transcription_enabled?: boolean | null
          updated_at?: string | null
          welcome_message?: string | null
          whiteboard_enabled?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_meetings_creator"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      otp_tokens: {
        Row: {
          attempts: number | null
          created_at: string | null
          expires_at: string
          id: string
          otp_hash: string
          user_id: string | null
        }
        Insert: {
          attempts?: number | null
          created_at?: string | null
          expires_at: string
          id?: string
          otp_hash: string
          user_id?: string | null
        }
        Update: {
          attempts?: number | null
          created_at?: string | null
          expires_at?: string
          id?: string
          otp_hash?: string
          user_id?: string | null
        }
        Relationships: []
      }
      participant_engagement: {
        Row: {
          active_participation_score: number | null
          attention_score: number | null
          created_at: string | null
          engagement_timeline: Json | null
          id: string
          interaction_count: number | null
          meeting_id: string | null
          participant_id: string | null
          speaking_time: number | null
          updated_at: string | null
        }
        Insert: {
          active_participation_score?: number | null
          attention_score?: number | null
          created_at?: string | null
          engagement_timeline?: Json | null
          id?: string
          interaction_count?: number | null
          meeting_id?: string | null
          participant_id?: string | null
          speaking_time?: number | null
          updated_at?: string | null
        }
        Update: {
          active_participation_score?: number | null
          attention_score?: number | null
          created_at?: string | null
          engagement_timeline?: Json | null
          id?: string
          interaction_count?: number | null
          meeting_id?: string | null
          participant_id?: string | null
          speaking_time?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "participant_engagement_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participant_engagement_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "meeting_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email_verified: boolean | null
          full_name: string | null
          id: string
          last_login: string | null
          phone: string | null
          phone_verified: boolean | null
          role: Database["public"]["Enums"]["user_role"] | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email_verified?: boolean | null
          full_name?: string | null
          id: string
          last_login?: string | null
          phone?: string | null
          phone_verified?: boolean | null
          role?: Database["public"]["Enums"]["user_role"] | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email_verified?: boolean | null
          full_name?: string | null
          id?: string
          last_login?: string | null
          phone?: string | null
          phone_verified?: boolean | null
          role?: Database["public"]["Enums"]["user_role"] | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sentiment_analysis: {
        Row: {
          confidence_level: number | null
          created_at: string | null
          emotion_type: string | null
          id: string
          meeting_id: string | null
          participant_id: string | null
          sentiment_score: number
          text_content: string | null
          timestamp_seconds: number
        }
        Insert: {
          confidence_level?: number | null
          created_at?: string | null
          emotion_type?: string | null
          id?: string
          meeting_id?: string | null
          participant_id?: string | null
          sentiment_score: number
          text_content?: string | null
          timestamp_seconds: number
        }
        Update: {
          confidence_level?: number | null
          created_at?: string | null
          emotion_type?: string | null
          id?: string
          meeting_id?: string | null
          participant_id?: string | null
          sentiment_score?: number
          text_content?: string | null
          timestamp_seconds?: number
        }
        Relationships: [
          {
            foreignKeyName: "sentiment_analysis_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sentiment_analysis_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "meeting_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_security: {
        Row: {
          created_at: string | null
          failed_attempts: number | null
          id: string
          last_attempt: string | null
          lockout_until: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          failed_attempts?: number | null
          id?: string
          last_attempt?: string | null
          lockout_until?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          failed_attempts?: number | null
          id?: string
          last_attempt?: string | null
          lockout_until?: string | null
          updated_at?: string | null
          user_id?: string | null
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
      can_join_meeting: {
        Args: { meeting_code_param: string; user_id_param?: string }
        Returns: Json
      }
      generate_meeting_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_shareable_link: {
        Args: { meeting_code: string }
        Returns: string
      }
      handle_failed_login: {
        Args: { user_email: string }
        Returns: Json
      }
      reset_failed_attempts: {
        Args: { user_email: string }
        Returns: undefined
      }
    }
    Enums: {
      approval_status: "pending" | "approved" | "denied"
      meeting_status: "scheduled" | "active" | "completed" | "cancelled"
      participant_role: "host" | "co_host" | "participant"
      participant_status:
        | "invited"
        | "pending"
        | "approved"
        | "denied"
        | "joined"
        | "left"
      user_role: "admin" | "moderator" | "participant"
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
    Enums: {
      approval_status: ["pending", "approved", "denied"],
      meeting_status: ["scheduled", "active", "completed", "cancelled"],
      participant_role: ["host", "co_host", "participant"],
      participant_status: [
        "invited",
        "pending",
        "approved",
        "denied",
        "joined",
        "left",
      ],
      user_role: ["admin", "moderator", "participant"],
    },
  },
} as const
