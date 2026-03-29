// Nexus - Database Types
// This file should be generated using: npm run generate-types
// For now, includes manual type definitions based on schema

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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          timezone: string
          notification_preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          timezone?: string
          notification_preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          timezone?: string
          notification_preferences?: Json
          updated_at?: string
        }
      }
      integrations: {
        Row: {
          id: string
          user_id: string
          provider: 'email' | 'slack' | 'twitter' | 'teams' | 'meet'
          account_identifier: string
          account_name: string | null
          access_token: string | null
          refresh_token: string | null
          token_expiry: string | null
          status: 'active' | 'inactive' | 'error' | 'expired'
          metadata: Json
          last_sync_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          provider: 'email' | 'slack' | 'twitter' | 'teams' | 'meet'
          account_identifier: string
          account_name?: string | null
          access_token?: string | null
          refresh_token?: string | null
          token_expiry?: string | null
          status?: 'active' | 'inactive' | 'error' | 'expired'
          metadata?: Json
          last_sync_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          provider?: 'email' | 'slack' | 'twitter' | 'teams' | 'meet'
          account_identifier?: string
          account_name?: string | null
          access_token?: string | null
          refresh_token?: string | null
          token_expiry?: string | null
          status?: 'active' | 'inactive' | 'error' | 'expired'
          metadata?: Json
          last_sync_at?: string | null
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          user_id: string
          integration_id: string
          external_message_id: string
          platform: 'email' | 'slack' | 'twitter' | 'teams' | 'meet'
          sender_name: string | null
          sender_email: string | null
          sender_avatar: string | null
          subject: string | null
          content: string
          content_type: string
          status: 'unread' | 'read' | 'archived' | 'deleted'
          metadata: Json
          thread_id: string | null
          parent_message_id: string | null
          received_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          integration_id: string
          external_message_id: string
          platform: 'email' | 'slack' | 'twitter' | 'teams' | 'meet'
          sender_name?: string | null
          sender_email?: string | null
          sender_avatar?: string | null
          subject?: string | null
          content: string
          content_type?: string
          status?: 'unread' | 'read' | 'archived' | 'deleted'
          metadata?: Json
          thread_id?: string | null
          parent_message_id?: string | null
          received_at: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          integration_id?: string
          external_message_id?: string
          platform?: 'email' | 'slack' | 'twitter' | 'teams' | 'meet'
          sender_name?: string | null
          sender_email?: string | null
          sender_avatar?: string | null
          subject?: string | null
          content?: string
          content_type?: string
          status?: 'unread' | 'read' | 'archived' | 'deleted'
          metadata?: Json
          thread_id?: string | null
          parent_message_id?: string | null
          received_at?: string
          updated_at?: string
        }
      }
      threads: {
        Row: {
          id: string
          user_id: string
          platform: 'email' | 'slack' | 'twitter' | 'teams' | 'meet'
          external_thread_id: string | null
          subject: string | null
          participant_count: number
          message_count: number
          last_message_at: string | null
          last_message_preview: string | null
          is_archived: boolean
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          platform: 'email' | 'slack' | 'twitter' | 'teams' | 'meet'
          external_thread_id?: string | null
          subject?: string | null
          participant_count?: number
          message_count?: number
          last_message_at?: string | null
          last_message_preview?: string | null
          is_archived?: boolean
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          platform?: 'email' | 'slack' | 'twitter' | 'teams' | 'meet'
          external_thread_id?: string | null
          subject?: string | null
          participant_count?: number
          message_count?: number
          last_message_at?: string | null
          last_message_preview?: string | null
          is_archived?: boolean
          metadata?: Json
          updated_at?: string
        }
      }
      attachments: {
        Row: {
          id: string
          message_id: string
          filename: string
          file_type: string | null
          file_size: number | null
          file_url: string | null
          thumbnail_url: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          message_id: string
          filename: string
          file_type?: string | null
          file_size?: number | null
          file_url?: string | null
          thumbnail_url?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          message_id?: string
          filename?: string
          file_type?: string | null
          file_size?: number | null
          file_url?: string | null
          thumbnail_url?: string | null
          metadata?: Json
        }
      }
    }
    Views: {
      message_details: {
        Row: {
          id: string
          user_id: string
          integration_id: string
          external_message_id: string
          platform: 'email' | 'slack' | 'twitter' | 'teams' | 'meet'
          sender_name: string | null
          sender_email: string | null
          sender_avatar: string | null
          subject: string | null
          content: string
          content_type: string
          status: 'unread' | 'read' | 'archived' | 'deleted'
          metadata: Json
          thread_id: string | null
          parent_message_id: string | null
          received_at: string
          created_at: string
          updated_at: string
          integration_provider: 'email' | 'slack' | 'twitter' | 'teams' | 'meet'
          integration_account_name: string | null
          integration_account_identifier: string
        }
      }
      unread_counts: {
        Row: {
          user_id: string
          unread_count: number
          email_unread: number
          slack_unread: number
          twitter_unread: number
          teams_unread: number
          meet_unread: number
        }
      }
    }
    Functions: {
      handle_new_user: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      update_updated_at_column: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      update_thread_stats: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
    }
    Enums: {
      provider: 'email' | 'slack' | 'twitter' | 'teams' | 'meet'
      message_status: 'unread' | 'read' | 'archived' | 'deleted'
      integration_status: 'active' | 'inactive' | 'error' | 'expired'
    }
  }
}
