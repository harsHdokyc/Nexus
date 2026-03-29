// Nexus - Threads Service
// Handles thread-related operations with Supabase

import { supabase } from '../lib/supabaseClient'
import type { 
  Thread, 
  ThreadInsert, 
  ThreadUpdate,
  Provider
} from '../types'

export class ThreadsService {
  // Get all threads for the current user
  static async getUserThreads(
    limit: number = 50,
    offset: number = 0,
    archived: boolean = false
  ): Promise<{ data: Thread[] | null; error: any; count: number | null }> {
    const { data, error, count } = await supabase
      .from('threads')
      .select('*', { count: 'exact' })
      .eq('is_archived', archived)
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1)

    return { data, error, count }
  }

  // Get threads by platform
  static async getThreadsByPlatform(
    platform: Provider,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ data: Thread[] | null; error: any; count: number | null }> {
    const { data, error, count } = await supabase
      .from('threads')
      .select('*', { count: 'exact' })
      .eq('platform', platform)
      .eq('is_archived', false)
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1)

    return { data, error, count }
  }

  // Get single thread by ID
  static async getThread(id: string): Promise<{ data: Thread | null; error: any }> {
    const { data, error } = await supabase
      .from('threads')
      .select('*')
      .eq('id', id)
      .single()

    return { data, error }
  }

  // Get thread by external ID
  static async getThreadByExternalId(
    platform: Provider,
    externalThreadId: string
  ): Promise<{ data: Thread | null; error: any }> {
    const { data, error } = await supabase
      .from('threads')
      .select('*')
      .eq('platform', platform)
      .eq('external_thread_id', externalThreadId)
      .single()

    return { data, error }
  }

  // Create new thread
  static async createThread(thread: ThreadInsert): Promise<{ data: Thread | null; error: any }> {
    const { data, error } = await supabase
      .from('threads')
      .insert(thread)
      .select()
      .single()

    return { data, error }
  }

  // Update thread
  static async updateThread(
    id: string, 
    updates: ThreadUpdate
  ): Promise<{ data: Thread | null; error: any }> {
    const { data, error } = await supabase
      .from('threads')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    return { data, error }
  }

  // Delete thread
  static async deleteThread(id: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('threads')
      .delete()
      .eq('id', id)

    return { error }
  }

  // Archive thread
  static async archiveThread(id: string): Promise<{ data: Thread | null; error: any }> {
    return this.updateThread(id, { 
      is_archived: true,
      updated_at: new Date().toISOString()
    })
  }

  // Unarchive thread
  static async unarchiveThread(id: string): Promise<{ data: Thread | null; error: any }> {
    return this.updateThread(id, { 
      is_archived: false,
      updated_at: new Date().toISOString()
    })
  }

  // Search threads by subject or participants
  static async searchThreads(
    query: string,
    limit: number = 20
  ): Promise<{ data: Thread[] | null; error: any }> {
    const { data, error } = await supabase
      .from('threads')
      .select('*')
      .or(`subject.ilike.%${query}%,last_message_preview.ilike.%${query}%`)
      .eq('is_archived', false)
      .order('last_message_at', { ascending: false })
      .limit(limit)

    return { data, error }
  }

  // Get thread statistics for current user
  static async getThreadStats(): Promise<{
    total: number
    active: number
    archived: number
    byPlatform: Record<Provider, number>
  }> {
    const { data: threads, error } = await this.getUserThreads(1000) // Get more for stats
    
    if (error || !threads) {
      return { 
        total: 0, 
        active: 0, 
        archived: 0,
        byPlatform: {} as Record<Provider, number>
      }
    }

    const stats = threads.reduce(
      (acc, thread) => {
        acc.total++
        if (!thread.is_archived) {
          acc.active++
        } else {
          acc.archived++
        }
        acc.byPlatform[thread.platform] = (acc.byPlatform[thread.platform] || 0) + 1
        return acc
      },
      { 
        total: 0, 
        active: 0, 
        archived: 0,
        byPlatform: {} as Record<Provider, number>
      }
    )

    return stats
  }

  // Find or create thread based on external ID
  static async findOrCreateThread(
    platform: Provider,
    externalThreadId: string | null,
    subject: string | null,
    userId: string
  ): Promise<{ data: Thread | null; error: any; created: boolean }> {
    // If no external thread ID, we can't find existing thread
    if (!externalThreadId) {
      // Create new thread without external ID
      const newThread: ThreadInsert = {
        user_id: userId,
        platform,
        external_thread_id: null,
        subject,
        participant_count: 1,
        message_count: 0,
        last_message_at: new Date().toISOString(),
        last_message_preview: null,
        is_archived: false,
        metadata: {}
      }

      const result = await this.createThread(newThread)
      return { ...result, created: true }
    }

    // Try to find existing thread
    const { data: existingThread, error: findError } = await this.getThreadByExternalId(
      platform, 
      externalThreadId
    )

    if (findError && findError.code !== 'PGRST116') { // Not found error
      return { data: null, error: findError, created: false }
    }

    if (existingThread) {
      return { data: existingThread, error: null, created: false }
    }

    // Create new thread
    const newThread: ThreadInsert = {
      user_id: userId,
      platform,
      external_thread_id: externalThreadId,
      subject,
      participant_count: 1,
      message_count: 0,
      last_message_at: new Date().toISOString(),
      last_message_preview: null,
      is_archived: false,
      metadata: {}
    }

    const result = await this.createThread(newThread)
    return { ...result, created: true }
  }

  // Update thread participant count
  static async updateParticipantCount(
    threadId: string,
    count: number
  ): Promise<{ data: Thread | null; error: any }> {
    return this.updateThread(threadId, { 
      participant_count: count,
      updated_at: new Date().toISOString()
    })
  }

  // Real-time subscription to threads
  static subscribeToThreads(
    callback: (payload: any) => void,
    userId?: string
  ) {
    return supabase
      .channel('threads-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'threads',
          ...(userId && { filter: `user_id=eq.${userId}` })
        },
        callback
      )
      .subscribe()
  }

  // Unsubscribe from threads
  static unsubscribeFromThreads(subscription: any) {
    supabase.removeChannel(subscription)
  }
}
