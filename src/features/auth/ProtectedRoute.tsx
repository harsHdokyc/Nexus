// Nexus - Production-Grade Protected Route Component
// Provides route protection with authentication state management

import React, { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthProvider'
import { AuthError } from './authService'

// ===========================================
// Type Definitions
// ===========================================

export interface ProtectedRouteProps {
  children: ReactNode
  redirectTo?: string
  requireAuth?: boolean
  fallback?: ReactNode
  loadingComponent?: ReactNode
}

export interface PublicRouteProps {
  children: ReactNode
  redirectTo?: string
  fallback?: ReactNode
  loadingComponent?: ReactNode
}

// ===========================================
// Loading Components
// ===========================================

const DefaultLoadingComponent = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
)

const DefaultAuthFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
      <p className="text-gray-600 mb-4">Please sign in to access this page.</p>
      <div className="animate-pulse bg-gray-200 h-10 w-32 rounded mx-auto"></div>
    </div>
  </div>
)

// ===========================================
// Protected Route Component
// ===========================================

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/signin',
  requireAuth = true,
  fallback = <DefaultAuthFallback />,
  loadingComponent = <DefaultLoadingComponent />
}) => {
  const { isAuthenticated, isLoading, error } = useAuth()
  const location = useLocation()

  // Show loading state while checking authentication
  if (isLoading) {
    return <>{loadingComponent}</>
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // Store the attempted location for redirect after login
    const state = { from: location.pathname + location.search }
    return <Navigate to={redirectTo} state={state} replace />
  }

  // If there's an authentication error, show fallback
  if (error === AuthError.SESSION_EXPIRED) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-red-600 mb-2">Session Expired</h2>
          <p className="text-gray-600 mb-4">Your session has expired. Please sign in again.</p>
          <Navigate to={redirectTo} replace />
        </div>
      </div>
    )
  }

  // If authentication is not required or user is authenticated, render children
  return <>{children}</>
}

// ===========================================
// Public Route Component (for auth pages)
// ===========================================

export const PublicRoute: React.FC<PublicRouteProps> = ({
  children,
  redirectTo = '/dashboard',
  fallback = <DefaultAuthFallback />,
  loadingComponent = <DefaultLoadingComponent />
}) => {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  // Show loading state while checking authentication
  if (isLoading) {
    return <>{loadingComponent}</>
  }

  // If user is already authenticated, redirect to dashboard
  if (isAuthenticated) {
    // Check if there's a stored redirect location
    const state = location.state as { from?: string }
    const from = state?.from || redirectTo
    return <Navigate to={from} replace />
  }

  // If user is not authenticated, render children (login/signup pages)
  return <>{children}</>
}

// ===========================================
// Role-Based Protected Route (Future Enhancement)
// ===========================================

export interface RoleProtectedRouteProps extends Omit<ProtectedRouteProps, 'requireAuth'> {
  requiredRoles?: string[]
  userRoles?: string[]
  unauthorizedFallback?: ReactNode
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  userRoles = [],
  unauthorizedFallback = (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-red-600 mb-2">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to access this page.</p>
      </div>
    </div>
  ),
  ...protectedRouteProps
}) => {
  const { isAuthenticated, isLoading } = useAuth()

  // First check basic authentication
  if (isLoading) {
    return <DefaultLoadingComponent />
  }

  if (!isAuthenticated) {
    return <ProtectedRoute {...protectedRouteProps}>{null}</ProtectedRoute>
  }

  // Check role-based access
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role))
    
    if (!hasRequiredRole) {
      return <>{unauthorizedFallback}</>
    }
  }

  // User is authenticated and has required roles
  return <>{children}</>
}

// ===========================================
// Session Expiration Wrapper
// ===========================================

export interface SessionWrapperProps {
  children: ReactNode
  onSessionExpired?: () => void
  checkInterval?: number // in seconds
}

export const SessionWrapper: React.FC<SessionWrapperProps> = ({
  children,
  onSessionExpired,
  checkInterval = 300 // 5 minutes
}) => {
  const { sessionDaysRemaining, isAuthenticated, signOut } = useAuth()

  React.useEffect(() => {
    if (!isAuthenticated || sessionDaysRemaining <= 0) return

    const interval = setInterval(() => {
      if (sessionDaysRemaining <= 0) {
        onSessionExpired?.()
        signOut()
      }
    }, checkInterval * 1000)

    return () => clearInterval(interval)
  }, [isAuthenticated, sessionDaysRemaining, checkInterval, onSessionExpired, signOut])

  return <>{children}</>
}

// ===========================================
// Authentication State Component
// ===========================================

export interface AuthStateDisplayProps {
  showLoading?: boolean
  showError?: boolean
  customLoadingComponent?: ReactNode
  customErrorComponent?: ReactNode
}

export const AuthStateDisplay: React.FC<AuthStateDisplayProps> = ({
  showLoading = true,
  showError = true,
  customLoadingComponent,
  customErrorComponent
}) => {
  const { isLoading, error, isAuthenticated } = useAuth()

  // Show loading state
  if (isLoading && showLoading) {
    return <>{customLoadingComponent || <DefaultLoadingComponent />}</>
  }

  // Show error state
  if (error && showError) {
    const errorComponent = customErrorComponent || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-red-600 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">
            {error === AuthError.SESSION_EXPIRED && 'Your session has expired. Please sign in again.'}
            {error === AuthError.NETWORK_ERROR && 'Network error. Please check your connection.'}
            {error === AuthError.UNKNOWN_ERROR && 'An error occurred. Please try again.'}
          </p>
        </div>
      </div>
    )
    return <>{errorComponent}</>
  }

  // Show nothing if authenticated or no error
  return null
}

// ===========================================
// Export Components
// ===========================================

export {
  ProtectedRoute as default,
  DefaultLoadingComponent,
  DefaultAuthFallback
}
