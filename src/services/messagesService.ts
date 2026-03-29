// Nexus - Messages Service
// Handles all message-related operations with Supabase

import { supabase } from '../lib/supabaseClient'
import type { 
  Message, 
  MessageInsert, 
  MessageUpdate,
  MessageStatus,
  Provider,
  MessageDetail,
  UnreadCount
} from '../types'

export class MessagesService {
  // Get messages for the current user with pagination
  static async getUserMessages(
    limit: number = 50,
    offset: number = 0,
    status?: MessageStatus,
    platform?: Provider
  ): Promise<{ data: Message[] | null; error: any; count: number | null }> {
    let query = supabase
      .from('messages')
      .select('*', { count: 'exact' })
      .order('received_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    if (platform) {
      query = query.eq('platform', platform)
    }

    const { data, error, count } = await query

    return { data, error, count }
  }

  // Get message details with integration information
  static async getMessageDetails(
    limit: number = 50,
    offset: number = 0,
    status?: MessageStatus,
    platform?: Provider
  ): Promise<{ data: MessageDetail[] | null; error: any; count: number | null }> {
    let query = supabase
      .from('message_details')
      .select('*', { count: 'exact' })
      .order('received_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    if (platform) {
      query = query.eq('platform', platform)
    }

    const { data, error, count } = await query

    return { data, error, count }
  }

  // Get single message by ID
  static async getMessage(id: string): Promise<{ data: Message | null; error: any }> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('id', id)
      .single()

    return { data, error }
  }

  // Get messages by thread ID
  static async getThreadMessages(
    threadId: string,
    limit: number = 50
  ): Promise<{ data: Message[] | null; error: any }> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('thread_id', threadId)
      .order('received_at', { ascending: true })
      .limit(limit)

    return { data, error }
  }

  // Get messages by integration
  static async getIntegrationMessages(
    integrationId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ data: Message[] | null; error: any; count: number | null }> {
    const { data, error, count } = await supabase
      .from('messages')
      .select('*', { count: 'exact' })
      .eq('integration_id', integrationId)
      .order('received_at', { ascending: false })
      .range(offset, offset + limit - 1)

    return { data, error, count }
  }

  // Create new message
  static async createMessage(message: MessageInsert): Promise<{ data: Message | null; error: any }> {
    const { data, error } = await supabase
      .from('messages')
      .insert(message)
      .select()
      .single()

    return { data, error }
  }

  // Create multiple messages (batch insert)
  static async createMessages(messages: MessageInsert[]): Promise<{ data: Message[] | null; error: any }> {
    const { data, error } = await supabase
      .from('messages')
      .insert(messages)
      .select()

    return { data, error }
  }

  // Update message
  static async updateMessage(
    id: string, 
    updates: MessageUpdate
  ): Promise<{ data: Message | null; error: any }> {
    const { data, error } = await supabase
      .from('messages')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    return { data, error }
  }

  // Delete message
  static async deleteMessage(id: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', id)

    return { error }
  }

  // Mark message as read
  static async markAsRead(id: string): Promise<{ data: Message | null; error: any }> {
    return this.updateMessage(id, { 
      status: 'read',
      updated_at: new Date().toISOString()
    })
  }

  // Mark message as archived
  static async markAsArchived(id: string): Promise<{ data: Message | null; error: any }> {
    return this.updateMessage(id, { 
      status: 'archived',
      updated_at: new Date().toISOString()
    })
  }

  // Mark multiple messages as read
  static async markMultipleAsRead(ids: string[]): Promise<{ data: Message[] | null; error: any }> {
    const { data, error } = await supabase
      .from('messages')
      .update({ 
        status: 'read',
        updated_at: new Date().toISOString()
      })
      .in('id', ids)
      .select()

    return { data, error }
  }

  // Mark all messages as read for a user or platform
  static async markAllAsRead(
    platform?: Provider
  ): Promise<{ data: Message[] | null; error: any }> {
    let query = supabase
      .from('messages')
      .update({ 
        status: 'read',
        updated_at: new Date().toISOString()
      })
      .eq('status', 'unread')

    if (platform) {
      query = query.eq('platform', platform)
    }

    const { data, error } = await query.select()

    return { data, error }
  }

  // Search messages by content
  static async searchMessages(
    query: string,
    limit: number = 20
  ): Promise<{ data: Message[] | null; error: any }> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .textSearch('content', query)
      .order('received_at', { ascending: false })
      .limit(limit)

    return { data, error }
  }

  // Search messages by sender
  static async searchBySender(
    senderName: string,
    limit: number = 20
  ): Promise<{ data: Message[] | null; error: any }> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .ilike('sender_name', `%${senderName}%`)
      .order('received_at', { ascending: false })
      .limit(limit)

    return { data, error }
  }

  // Get unread counts for current user
  static async getUnreadCounts(): Promise<{ data: UnreadCount | null; error: any }> {
    const { data, error } = await supabase
      .from('unread_counts')
      .select('*')
      .single()

    return { data, error }
  }

  // Get message statistics for current user
  static async getMessageStats(): Promise<{
    total: number
    unread: number
    byPlatform: Record<Provider, number>
    byStatus: Record<MessageStatus, number>
  }> {
    const { data: messages, error } = await this.getUserMessages(1000) // Get more for stats
    
    if (error || !messages) {
      return { 
        total: 0, 
        unread: 0, 
        byPlatform: {} as Record<Provider, number>,
        byStatus: {} as Record<MessageStatus, number>
      }
    }

    const stats = messages.reduce(
      (acc, message) => {
        acc.total++
        if (message.status === 'unread') {
          acc.unread++
        }
        acc.byPlatform[message.platform] = (acc.byPlatform[message.platform] || 0) + 1
        acc.byStatus[message.status] = (acc.byStatus[message.status] || 0) + 1
        return acc
      },
      { 
        total: 0, 
        unread: 0, 
        byPlatform: {} as Record<Provider, number>,
        byStatus: {} as Record<MessageStatus, number>
      }
    )

    return stats
  }

  // Get messages from a specific date range
  static async getMessagesByDateRange(
    startDate: string,
    endDate: string,
    limit: number = 100
  ): Promise<{ data: Message[] | null; error: any }> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .gte('received_at', startDate)
      .lte('received_at', endDate)
      .order('received_at', { ascending: false })
      .limit(limit)

    return { data, error }
  }

  // Check if external message already exists
  static async messageExists(
    integrationId: string,
    externalMessageId: string
  ): Promise<boolean> {
    const { data, error } = await supabase
      .from('messages')
      .select('id')
      .eq('integration_id', integrationId)
      .eq('external_message_id', externalMessageId)
      .single()

    return !error && !!data
  }

  // Real-time subscription to messages
  static subscribeToMessages(
    callback: (payload: any) => void,
    userId?: string
  ) {
    return supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          ...(userId && { filter: `user_id=eq.${userId}` })
        },
        callback
      )
      .subscribe()
  }

  // Unsubscribe from messages
  static unsubscribeFromMessages(subscription: any) {
    supabase.removeChannel(subscription)
  }
}
