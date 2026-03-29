// Nexus - Authentication Feature
// Export all authentication services, components, and utilities

export { AuthService, AuthError, SESSION_DURATION_DAYS } from './authService'
export type { CustomSessionData } from './authService'
export { AuthProvider, useAuth } from './AuthProvider'
export type { AuthContextType, AuthState } from './AuthProvider'
export { 
  ProtectedRoute, 
  PublicRoute, 
  RoleProtectedRoute, 
  SessionWrapper, 
  AuthStateDisplay,
  DefaultLoadingComponent,
  DefaultAuthFallback 
} from './ProtectedRoute'
export type { 
  ProtectedRouteProps, 
  PublicRouteProps, 
  RoleProtectedRouteProps,
  SessionWrapperProps,
  AuthStateDisplayProps 
} from './ProtectedRoute'
