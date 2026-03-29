// Nexus - Database Types
// Auto-generated from Supabase schema

import type { Database } from './database.types'

// Re-export Database type
export type { Database }

// Common types extracted for easier usage
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Integration = Database['public']['Tables']['integrations']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type Thread = Database['public']['Tables']['threads']['Row']
export type Attachment = Database['public']['Tables']['attachments']['Row']

// Insert types
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type IntegrationInsert = Database['public']['Tables']['integrations']['Insert']
export type MessageInsert = Database['public']['Tables']['messages']['Insert']
export type ThreadInsert = Database['public']['Tables']['threads']['Insert']
export type AttachmentInsert = Database['public']['Tables']['attachments']['Insert']

// Update types
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type IntegrationUpdate = Database['public']['Tables']['integrations']['Update']
export type MessageUpdate = Database['public']['Tables']['messages']['Update']
export type ThreadUpdate = Database['public']['Tables']['threads']['Update']
export type AttachmentUpdate = Database['public']['Tables']['attachments']['Update']

// Enums
export type Provider = Database['public']['Enums']['provider']
export type MessageStatus = Database['public']['Enums']['message_status']
export type IntegrationStatus = Database['public']['Enums']['integration_status']

// View types
export type MessageDetail = Database['public']['Views']['message_details']['Row']
export type UnreadCount = Database['public']['Views']['unread_counts']['Row']
