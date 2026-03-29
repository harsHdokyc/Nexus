// Nexus - Production-Grade Authentication Provider
// Manages authentication state with 30-day session control and OTP flows

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { AuthService, AuthError, CustomSessionData } from './authService'

// ===========================================
// Type Definitions
// ===========================================

export interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  error: AuthError | null
  customSession: CustomSessionData | null
  sessionDaysRemaining: number
}

export interface AuthContextType extends AuthState {
  // OTP Authentication
  sendOTP: (email: string, shouldCreateUser?: boolean) => Promise<{ success: boolean; message?: string; error?: AuthError }>
  verifyOTP: (email: string, token: string, rememberMe?: boolean) => Promise<{ success: boolean; message?: string; error?: AuthError }>
  sendMagicLink: (email: string) => Promise<{ success: boolean; message?: string; error?: AuthError }>
  
  // Session Management
  signOut: () => Promise<{ success: boolean; error?: string }>
  refreshSession: () => Promise<void>
  
  // OTP Cooldown
  getOTPCooldownRemaining: (email: string) => number
  
  // Legacy Methods
  signIn: (email: string, password: string) => Promise<{ success: boolean; message?: string; error?: AuthError }>
  signUp: (email: string, password: string) => Promise<{ success: boolean; message?: string; error?: AuthError }>
}

// ===========================================
// Context Creation
// ===========================================

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ===========================================
// AuthProvider Component
// ===========================================

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // State management
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
    customSession: null,
    sessionDaysRemaining: 0
  })

  // Loading states for specific operations
  const [isSendingOTP, setIsSendingOTP] = useState(false)
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  // ===========================================
  // Initialize Authentication State
  // ===========================================

  const initializeAuth = async (): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

      // Get current user with session validation
      const { user, session, isValid, error } = await AuthService.getCurrentUser()
      
      if (error) {
        setAuthState(prev => ({
          ...prev,
          user: null,
          session: null,
          isAuthenticated: false,
          error,
          isLoading: false,
          customSession: null,
          sessionDaysRemaining: 0
        }))
        return
      }

      // Get custom session data
      const customSession = AuthService.getCustomSessionData()
      const sessionDaysRemaining = AuthService.getSessionDaysRemaining()

      setAuthState(prev => ({
        ...prev,
        user,
        session,
        isAuthenticated: isValid && !!user,
        error: null,
        isLoading: false,
        customSession,
        sessionDaysRemaining
      }))
    } catch (error) {
      console.error('Auth initialization error:', error)
      setAuthState(prev => ({
        ...prev,
        user: null,
        session: null,
        isAuthenticated: false,
        error: AuthError.NETWORK_ERROR,
        isLoading: false,
        customSession: null,
        sessionDaysRemaining: 0
      }))
    }
  }

  // ===========================================
  // Auth State Change Listener
  // ===========================================

  useEffect(() => {
    // Initialize auth on mount
    initializeAuth()

    // Listen to auth state changes
    const { data: { subscription } } = AuthService.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email)

      if (event === 'SIGNED_IN' && session) {
        // User signed in
        const customSession = AuthService.getCustomSessionData()
        const sessionDaysRemaining = AuthService.getSessionDaysRemaining()

        setAuthState(prev => ({
          ...prev,
          user: session.user,
          session,
          isAuthenticated: true,
          error: null,
          isLoading: false,
          customSession,
          sessionDaysRemaining
        }))
      } else if (event === 'SIGNED_OUT') {
        // User signed out
        setAuthState(prev => ({
          ...prev,
          user: null,
          session: null,
          isAuthenticated: false,
          error: null,
          isLoading: false,
          customSession: null,
          sessionDaysRemaining: 0
        }))
      } else if (event === 'TOKEN_REFRESHED') {
        // Token refreshed
        const customSession = AuthService.getCustomSessionData()
        const sessionDaysRemaining = AuthService.getSessionDaysRemaining()

        setAuthState(prev => ({
          ...prev,
          session,
          customSession,
          sessionDaysRemaining
        }))
      }
    })

    // Cleanup subscription
    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  // ===========================================
  // OTP Authentication Methods
  // ===========================================

  const sendOTP = async (
    email: string, 
    shouldCreateUser: boolean = false
  ): Promise<{ success: boolean; message?: string; error?: AuthError }> => {
    if (isSendingOTP) {
      return { success: false, message: 'OTP request already in progress' }
    }

    setIsSendingOTP(true)
    setAuthState(prev => ({ ...prev, error: null }))

    try {
      const result = await AuthService.sendOTP(email, shouldCreateUser)
      
      if (result.success) {
        setAuthState(prev => ({ ...prev, error: null }))
      } else {
        setAuthState(prev => ({ ...prev, error: result.error || null }))
      }

      return result
    } finally {
      setIsSendingOTP(false)
    }
  }

  const verifyOTP = async (
    email: string, 
    token: string, 
    rememberMe: boolean = false
  ): Promise<{ success: boolean; message?: string; error?: AuthError }> => {
    if (isVerifyingOTP) {
      return { success: false, message: 'OTP verification already in progress' }
    }

    setIsVerifyingOTP(true)
    setAuthState(prev => ({ ...prev, error: null }))

    try {
      const result = await AuthService.verifyOTP(email, token, rememberMe)
      
      if (result.success && result.user && result.session) {
        const customSession = AuthService.getCustomSessionData()
        const sessionDaysRemaining = AuthService.getSessionDaysRemaining()

        setAuthState(prev => ({
          ...prev,
          user: result.user!,
          session: result.session!,
          isAuthenticated: true,
          error: null,
          customSession,
          sessionDaysRemaining
        }))
      } else {
        setAuthState(prev => ({ ...prev, error: result.error || null }))
      }

      return result
    } finally {
      setIsVerifyingOTP(false)
    }
  }

  const sendMagicLink = async (
    email: string
  ): Promise<{ success: boolean; message?: string; error?: AuthError }> => {
    if (isSendingOTP) {
      return { success: false, message: 'Magic link request already in progress' }
    }

    setIsSendingOTP(true)
    setAuthState(prev => ({ ...prev, error: null }))

    try {
      const result = await AuthService.sendMagicLink(email)
      
      if (!result.success) {
        setAuthState(prev => ({ ...prev, error: result.error || null }))
      }

      return result
    } finally {
      setIsSendingOTP(false)
    }
  }

  // ===========================================
  // Session Management Methods
  // ===========================================

  const signOut = async (): Promise<{ success: boolean; error?: string }> => {
    if (isSigningOut) {
      return { success: false, error: 'Sign out already in progress' }
    }

    setIsSigningOut(true)
    setAuthState(prev => ({ ...prev, error: null }))

    try {
      const result = await AuthService.forceLogout()
      
      if (result.success) {
        setAuthState(prev => ({
          ...prev,
          user: null,
          session: null,
          isAuthenticated: false,
          error: null,
          customSession: null,
          sessionDaysRemaining: 0
        }))
      } else {
        setAuthState(prev => ({ ...prev, error: AuthError.UNKNOWN_ERROR }))
      }

      return result
    } finally {
      setIsSigningOut(false)
    }
  }

  const refreshSession = async (): Promise<void> => {
    await initializeAuth()
  }

  // ===========================================
  // Legacy Authentication Methods
  // ===========================================

  const signIn = async (
    email: string, 
    password: string
  ): Promise<{ success: boolean; message?: string; error?: AuthError }> => {
    try {
      const { data, error } = await AuthService.signIn(email, password)
      
      if (error) {
        const authError = error.message?.includes('Invalid') 
          ? AuthError.INVALID_CREDENTIALS 
          : AuthError.UNKNOWN_ERROR
        
        setAuthState(prev => ({ ...prev, error: authError }))
        return { success: false, error: authError }
      }

      if (data.session && data.user) {
        setAuthState(prev => ({
          ...prev,
          user: data.user,
          session: data.session,
          isAuthenticated: true,
          error: null
        }))
        
        return { success: true, message: 'Successfully signed in!' }
      }

      return { success: false, error: AuthError.UNKNOWN_ERROR }
    } catch (error) {
      console.error('Sign in error:', error)
      setAuthState(prev => ({ ...prev, error: AuthError.NETWORK_ERROR }))
      return { success: false, error: AuthError.NETWORK_ERROR }
    }
  }

  const signUp = async (
    email: string, 
    password: string
  ): Promise<{ success: boolean; message?: string; error?: AuthError }> => {
    try {
      const { data, error } = await AuthService.signUp(email, password)
      
      if (error) {
        const authError = error.message?.includes('already registered') 
          ? AuthError.INVALID_CREDENTIALS 
          : AuthError.UNKNOWN_ERROR
        
        setAuthState(prev => ({ ...prev, error: authError }))
        return { success: false, error: authError }
      }

      return { success: true, message: 'Account created! Please check your email to verify.' }
    } catch (error) {
      console.error('Sign up error:', error)
      setAuthState(prev => ({ ...prev, error: AuthError.NETWORK_ERROR }))
      return { success: false, error: AuthError.NETWORK_ERROR }
    }
  }

  // ===========================================
  // Utility Methods
  // ===========================================

  const getOTPCooldownRemaining = (email: string): number => {
    return AuthService.getOTPCooldownRemaining(email)
  }

  // ===========================================
  // Context Value
  // ===========================================

  const contextValue: AuthContextType = {
    ...authState,
    sendOTP,
    verifyOTP,
    sendMagicLink,
    signOut,
    refreshSession,
    getOTPCooldownRemaining,
    signIn,
    signUp
  }

  // ===========================================
  // Render
  // ===========================================

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// ===========================================
// Custom Hook
// ===========================================

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}

// ===========================================
// Export Context
// ===========================================

export { AuthContext }
