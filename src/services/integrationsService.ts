// Nexus - Integrations Service
// Handles all integration-related operations with Supabase

import { supabase } from '../lib/supabaseClient'
import type { 
  Integration, 
  IntegrationInsert, 
  IntegrationUpdate,
  Provider,
  IntegrationStatus 
} from '../types'

export class IntegrationsService {
  // Get all integrations for the current user
  static async getUserIntegrations(): Promise<{ data: Integration[] | null; error: any }> {
    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .order('created_at', { ascending: false })

    return { data, error }
  }

  // Get integrations by provider
  static async getIntegrationsByProvider(provider: Provider): Promise<{ data: Integration[] | null; error: any }> {
    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('provider', provider)
      .order('created_at', { ascending: false })

    return { data, error }
  }

  // Get single integration by ID
  static async getIntegration(id: string): Promise<{ data: Integration | null; error: any }> {
    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('id', id)
      .single()

    return { data, error }
  }

  // Create new integration
  static async createIntegration(integration: IntegrationInsert): Promise<{ data: Integration | null; error: any }> {
    const { data, error } = await supabase
      .from('integrations')
      .insert(integration)
      .select()
      .single()

    return { data, error }
  }

  // Update integration
  static async updateIntegration(
    id: string, 
    updates: IntegrationUpdate
  ): Promise<{ data: Integration | null; error: any }> {
    const { data, error } = await supabase
      .from('integrations')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    return { data, error }
  }

  // Delete integration
  static async deleteIntegration(id: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('integrations')
      .delete()
      .eq('id', id)

    return { error }
  }

  // Update integration status
  static async updateIntegrationStatus(
    id: string, 
    status: IntegrationStatus
  ): Promise<{ data: Integration | null; error: any }> {
    return this.updateIntegration(id, { 
      status,
      updated_at: new Date().toISOString()
    })
  }

  // Update tokens (for OAuth refresh)
  static async updateTokens(
    id: string,
    accessToken: string,
    refreshToken?: string,
    tokenExpiry?: string
  ): Promise<{ data: Integration | null; error: any }> {
    return this.updateIntegration(id, {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_expiry: tokenExpiry,
      last_sync_at: new Date().toISOString()
    })
  }

  // Check if user has integration for specific provider and account
  static async hasIntegration(
    provider: Provider, 
    accountIdentifier: string
  ): Promise<boolean> {
    const { data, error } = await supabase
      .from('integrations')
      .select('id')
      .eq('provider', provider)
      .eq('account_identifier', accountIdentifier)
      .single()

    return !error && !!data
  }

  // Get active integrations only
  static async getActiveIntegrations(): Promise<{ data: Integration[] | null; error: any }> {
    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    return { data, error }
  }

  // Get integrations that need token refresh
  static async getExpiredIntegrations(): Promise<{ data: Integration[] | null; error: any }> {
    const now = new Date().toISOString()
    
    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('status', 'active')
      .lt('token_expiry', now)
      .order('token_expiry', { ascending: true })

    return { data, error }
  }

  // Search integrations by account name or identifier
  static async searchIntegrations(query: string): Promise<{ data: Integration[] | null; error: any }> {
    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .or(`account_name.ilike.%${query}%,account_identifier.ilike.%${query}%`)
      .order('created_at', { ascending: false })

    return { data, error }
  }

  // Get integration statistics for current user
  static async getIntegrationStats(): Promise<{
    total: number
    active: number
    byProvider: Record<Provider, number>
  }> {
    const { data: integrations, error } = await this.getUserIntegrations()
    
    if (error || !integrations) {
      return { total: 0, active: 0, byProvider: {} as Record<Provider, number> }
    }

    const stats = integrations.reduce(
      (acc, integration) => {
        acc.total++
        if (integration.status === 'active') {
          acc.active++
        }
        acc.byProvider[integration.provider] = (acc.byProvider[integration.provider] || 0) + 1
        return acc
      },
      { total: 0, active: 0, byProvider: {} as Record<Provider, number> }
    )

    return stats
  }
}
