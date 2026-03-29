// Nexus - Production-Grade Authentication Service
// Handles OTP, magic links, and 30-day session management with Supabase

import { supabase } from '../../lib/supabaseClient'
import type { User, Session } from '@supabase/supabase-js'

// Session management constants
export const SESSION_DURATION_DAYS = 30
export const SESSION_STORAGE_KEY = 'nexus_login_timestamp'
export const OTP_COOLDOWN_SECONDS = 60
export const OTP_EXPIRY_MINUTES = 10

// Authentication error types
export enum AuthError {
  INVALID_OTP = 'invalid_otp',
  EXPIRED_OTP = 'expired_otp',
  RATE_LIMITED = 'rate_limited',
  NETWORK_ERROR = 'network_error',
  SESSION_EXPIRED = 'session_expired',
  INVALID_CREDENTIALS = 'invalid_credentials',
  EMAIL_NOT_CONFIRMED = 'email_not_confirmed',
  UNKNOWN_ERROR = 'unknown_error'
}

// Custom session data interface
export interface CustomSessionData {
  loginTimestamp: number
  userId: string
  email: string
}

export class AuthService {
  // ===========================================
  // OTP & Magic Link Authentication
  // ===========================================

  /**
   * Send OTP to user's email
   * @param email User email address
   * @param shouldCreateUser Whether to create user if not exists
   */
  static async sendOTP(
    email: string, 
    shouldCreateUser: boolean = false
  ): Promise<{ success: boolean; error?: AuthError; message?: string }> {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser,
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        // Handle specific OTP errors
        if (error.message?.includes('rate limit')) {
          return { 
            success: false, 
            error: AuthError.RATE_LIMITED, 
            message: `Please wait ${OTP_COOLDOWN_SECONDS} seconds before requesting another OTP` 
          }
        }
        
        if (error.message?.includes('Invalid email')) {
          return { 
            success: false, 
            error: AuthError.INVALID_CREDENTIALS, 
            message: 'Please enter a valid email address' 
          }
        }

        return { 
          success: false, 
          error: AuthError.UNKNOWN_ERROR, 
          message: 'Failed to send OTP. Please try again.' 
        }
      }

      // Store OTP request timestamp for cooldown
      this.setOTPTimestamp(email)

      return { 
        success: true, 
        message: `OTP sent to ${email}. Check your inbox (and spam folder).` 
      }
    } catch (error) {
      console.error('OTP send error:', error)
      return { 
        success: false, 
        error: AuthError.NETWORK_ERROR, 
        message: 'Network error. Please check your connection.' 
      }
    }
  }

  /**
   * Verify OTP and sign in user
   * @param email User email
   * @param token OTP token
   * @param rememberMe Whether to extend session (30 days)
   */
  static async verifyOTP(
    email: string, 
    token: string, 
    rememberMe: boolean = false
  ): Promise<{ 
    success: boolean; 
    user?: User; 
    session?: Session; 
    error?: AuthError; 
    message?: string 
  }> {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email'
      })

      if (error) {
        // Handle specific OTP verification errors
        if (error.message?.includes('Invalid OTP')) {
          return { 
            success: false, 
            error: AuthError.INVALID_OTP, 
            message: 'Invalid OTP. Please check and try again.' 
          }
        }

        if (error.message?.includes('expired')) {
          return { 
            success: false, 
            error: AuthError.EXPIRED_OTP, 
            message: 'OTP has expired. Please request a new one.' 
          }
        }

        return { 
          success: false, 
          error: AuthError.UNKNOWN_ERROR, 
          message: 'OTP verification failed. Please try again.' 
        }
      }

      if (data.session && data.user) {
        // Store custom session data for 30-day tracking
        if (rememberMe) {
          this.setCustomSessionData(data.user.id, data.user.email!)
        }

        return { 
          success: true, 
          user: data.user, 
          session: data.session,
          message: 'Successfully signed in!' 
        }
      }

      return { 
        success: false, 
        error: AuthError.UNKNOWN_ERROR, 
        message: 'Authentication failed. Please try again.' 
      }
    } catch (error) {
      console.error('OTP verification error:', error)
      return { 
        success: false, 
        error: AuthError.NETWORK_ERROR, 
        message: 'Network error during verification. Please try again.' 
      }
    }
  }

  /**
   * Send magic link for passwordless sign-in
   * @param email User email address
   */
  static async sendMagicLink(email: string): Promise<{ success: boolean; error?: AuthError; message?: string }> {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        if (error.message?.includes('rate limit')) {
          return { 
            success: false, 
            error: AuthError.RATE_LIMITED, 
            message: `Please wait ${OTP_COOLDOWN_SECONDS} seconds before requesting another link` 
          }
        }

        return { 
          success: false, 
          error: AuthError.UNKNOWN_ERROR, 
          message: 'Failed to send magic link. Please try again.' 
        }
      }

      return { 
        success: true, 
        message: `Magic link sent to ${email}. Check your inbox.` 
      }
    } catch (error) {
      console.error('Magic link error:', error)
      return { 
        success: false, 
        error: AuthError.NETWORK_ERROR, 
        message: 'Network error. Please try again.' 
      }
    }
  }

  // ===========================================
  // Session Management (30-Day Control)
  // ===========================================

  /**
   * Get current user with session validation
   */
  static async getCurrentUser(): Promise<{ 
    user: User | null; 
    session: Session | null; 
    isValid: boolean; 
    error?: AuthError 
  }> {
    try {
      const { data, error } = await supabase.auth.getUser()
      
      if (error) {
        // Handle session errors
        if (error.message?.includes('Invalid JWT')) {
          this.clearCustomSessionData()
          return { user: null, session: null, isValid: false, error: AuthError.SESSION_EXPIRED }
        }
        
        return { user: null, session: null, isValid: false, error: AuthError.UNKNOWN_ERROR }
      }

      const user = data.user
      const session = (data as any).session || null

      if (!user || !session) {
        this.clearCustomSessionData()
        return { user, session, isValid: false }
      }

      // Check custom 30-day expiration
      const customSession = this.getCustomSessionData()
      if (customSession && this.isSessionExpired(customSession.loginTimestamp)) {
        // Force logout due to 30-day expiration
        await this.forceLogout()
        return { user: null, session: null, isValid: false, error: AuthError.SESSION_EXPIRED }
      }

      return { user, session, isValid: true }
    } catch (error) {
      console.error('Get current user error:', error)
      return { user: null, session: null, isValid: false, error: AuthError.NETWORK_ERROR }
    }
  }

  /**
   * Get current session with validation
   */
  static async getCurrentSession(): Promise<{ 
    session: Session | null; 
    isValid: boolean; 
    error?: AuthError 
  }> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        if (error.message?.includes('Invalid JWT')) {
          this.clearCustomSessionData()
          return { session: null, isValid: false, error: AuthError.SESSION_EXPIRED }
        }
        
        return { session: null, isValid: false, error: AuthError.UNKNOWN_ERROR }
      }

      if (!session) {
        this.clearCustomSessionData()
        return { session: null, isValid: false }
      }

      // Check custom 30-day expiration
      const customSession = this.getCustomSessionData()
      if (customSession && this.isSessionExpired(customSession.loginTimestamp)) {
        await this.forceLogout()
        return { session: null, isValid: false, error: AuthError.SESSION_EXPIRED }
      }

      return { session, isValid: true }
    } catch (error) {
      console.error('Get session error:', error)
      return { session: null, isValid: false, error: AuthError.NETWORK_ERROR }
    }
  }

  /**
   * Force logout and clear all session data
   */
  static async forceLogout(): Promise<{ success: boolean; error?: string }> {
    try {
      // Clear Supabase session
      const { error } = await supabase.auth.signOut()
      
      // Clear custom session data
      this.clearCustomSessionData()
      
      // Clear any additional local storage
      localStorage.removeItem('supabase.auth.token')
      sessionStorage.removeItem('supabase.auth.token')

      if (error) {
        console.error('Force logout error:', error)
        return { success: false, error: 'Logout failed. Please clear browser data.' }
      }

      return { success: true }
    } catch (error) {
      console.error('Force logout error:', error)
      return { success: false, error: 'Logout failed. Please clear browser data.' }
    }
  }

  // ===========================================
  // Custom Session Data Management
  // ===========================================

  /**
   * Store custom session data for 30-day tracking
   */
  private static setCustomSessionData(userId: string, email: string): void {
    const sessionData: CustomSessionData = {
      loginTimestamp: Date.now(),
      userId,
      email
    }
    
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData))
  }

  /**
   * Get custom session data
   */
  static getCustomSessionData(): CustomSessionData | null {
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY)
      if (!stored) return null
      
      return JSON.parse(stored) as CustomSessionData
    } catch (error) {
      console.error('Error parsing session data:', error)
      return null
    }
  }

  /**
   * Clear custom session data
   */
  static clearCustomSessionData(): void {
    localStorage.removeItem(SESSION_STORAGE_KEY)
  }

  /**
   * Check if session has expired (30 days)
   */
  static isSessionExpired(loginTimestamp: number): boolean {
    const sessionAge = Date.now() - loginTimestamp
    const maxAge = SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000 // 30 days in ms
    return sessionAge > maxAge
  }

  /**
   * Get remaining session time in days
   */
  static getSessionDaysRemaining(): number {
    const customSession = this.getCustomSessionData()
    if (!customSession) return 0
    
    const sessionAge = Date.now() - customSession.loginTimestamp
    const maxAge = SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000
    const remaining = maxAge - sessionAge
    
    return Math.max(0, Math.ceil(remaining / (24 * 60 * 60 * 1000)))
  }

  // ===========================================
  // OTP Cooldown Management
  // ===========================================

  /**
   * Store OTP request timestamp for cooldown
   */
  private static setOTPTimestamp(email: string): void {
    const key = `otp_cooldown_${email.replace(/[^a-zA-Z0-9]/g, '')}`
    localStorage.setItem(key, Date.now().toString())
  }

  /**
   * Check if OTP is still in cooldown period
   */
  static getOTPCooldownRemaining(email: string): number {
    const key = `otp_cooldown_${email.replace(/[^a-zA-Z0-9]/g, '')}`
    const timestamp = localStorage.getItem(key)
    
    if (!timestamp) return 0
    
    const elapsed = Date.now() - parseInt(timestamp)
    const remaining = Math.max(0, OTP_COOLDOWN_SECONDS * 1000 - elapsed)
    
    return Math.ceil(remaining / 1000) // Return seconds
  }

  // ===========================================
  // Auth State Change Listener
  // ===========================================

  /**
   * Listen to auth state changes
   */
  static onAuthStateChange(
    callback: (event: string, session: Session | null) => void
  ) {
    return supabase.auth.onAuthStateChange(callback)
  }

  // ===========================================
  // Legacy Methods (for compatibility)
  // ===========================================

  /**
   * Sign up with email and password (legacy)
   */
  static async signUp(email: string, password: string): Promise<{ data: any; error: any }> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })
    return { data, error }
  }

  /**
   * Sign in with password (legacy)
   */
  static async signIn(email: string, password: string): Promise<{ data: any; error: any }> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  }

  /**
   * Sign in with OAuth provider (legacy)
   */
  static async signInWithOAuth(provider: 'google' | 'github' | 'discord'): Promise<{ data: any; error: any }> {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    return { data, error }
  }

  /**
   * Reset password (legacy)
   */
  static async resetPassword(email: string): Promise<{ data: any; error: any }> {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })
    return { data, error }
  }

  /**
   * Update password (legacy)
   */
  static async updatePassword(newPassword: string): Promise<{ data: any; error: any }> {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    })
    return { data, error }
  }
}
