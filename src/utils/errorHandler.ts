// Nexus - Comprehensive Error Handling System
// Production-grade error handling for authentication and general use

import { AuthError } from '../features/auth/authService'

// ===========================================
// Error Types and Interfaces
// ===========================================

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ErrorCategory {
  AUTHENTICATION = 'authentication',
  NETWORK = 'network',
  VALIDATION = 'validation',
  SYSTEM = 'system',
  USER_INPUT = 'user_input',
  PERMISSION = 'permission',
  RATE_LIMIT = 'rate_limit'
}

export interface AppError {
  id: string
  message: string
  code: string
  category: ErrorCategory
  severity: ErrorSeverity
  timestamp: Date
  context?: Record<string, any>
  stack?: string
  userId?: string
  sessionId?: string
  resolved: boolean
  retryable: boolean
}

export interface ErrorReport {
  error: AppError
  userAgent: string
  url: string
  timestamp: Date
  environment: 'development' | 'staging' | 'production'
}

export interface ErrorHandlerConfig {
  enableLogging: boolean
  enableReporting: boolean
  enableUserNotifications: boolean
  maxErrorsPerSession: number
  errorReportingEndpoint?: string
  enableRetry: boolean
  retryAttempts: number
}

// ===========================================
// Error Handler Class
// ===========================================

export class ErrorHandler {
  private static instance: ErrorHandler
  private config: ErrorHandlerConfig
  private errors: AppError[] = []
  private errorCounts: Map<string, number> = new Map()
  private retryAttempts: Map<string, number> = new Map()

  private constructor(config: Partial<ErrorHandlerConfig> = {}) {
    this.config = {
      enableLogging: true,
      enableReporting: true,
      enableUserNotifications: true,
      maxErrorsPerSession: 100,
      enableRetry: true,
      retryAttempts: 3,
      ...config
    }

    // Set up global error handlers
    this.setupGlobalHandlers()
  }

  static getInstance(config?: Partial<ErrorHandlerConfig>): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler(config)
    }
    return ErrorHandler.instance
  }

  // ===========================================
  // Error Creation and Handling
  // ===========================================

  createError(
    message: string,
    code: string,
    category: ErrorCategory,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context?: Record<string, any>,
    originalError?: Error
  ): AppError {
    const error: AppError = {
      id: this.generateErrorId(),
      message,
      code,
      category,
      severity,
      timestamp: new Date(),
      context,
      stack: originalError?.stack,
      userId: this.getCurrentUserId(),
      sessionId: this.getCurrentSessionId(),
      resolved: false,
      retryable: this.isRetryableError(category, code)
    }

    this.handleError(error)
    return error
  }

  private handleError(error: AppError): void {
    // Add to error list
    this.errors.push(error)

    // Update error counts
    const key = `${error.category}:${error.code}`
    this.errorCounts.set(key, (this.errorCounts.get(key) || 0) + 1)

    // Log error
    if (this.config.enableLogging) {
      this.logError(error)
    }

    // Report error
    if (this.config.enableReporting) {
      this.reportError(error)
    }

    // Notify user
    if (this.config.enableUserNotifications) {
      this.notifyUser(error)
    }

    // Check error limits
    this.checkErrorLimits()

    // Cleanup old errors
    this.cleanupOldErrors()
  }

  // ===========================================
  // Authentication Error Handling
  // ===========================================

  handleAuthError(authError: AuthError, context?: Record<string, any>): AppError {
    const mapping = this.getAuthErrorMapping(authError)
    
    return this.createError(
      mapping.message,
      mapping.code,
      ErrorCategory.AUTHENTICATION,
      mapping.severity,
      { ...context, originalAuthError: authError }
    )
  }

  private getAuthErrorMapping(authError: AuthError): {
    message: string
    code: string
    severity: ErrorSeverity
  } {
    switch (authError) {
      case AuthError.INVALID_OTP:
        return {
          message: 'The OTP code you entered is invalid. Please check and try again.',
          code: 'AUTH_INVALID_OTP',
          severity: ErrorSeverity.MEDIUM
        }
      case AuthError.EXPIRED_OTP:
        return {
          message: 'The OTP code has expired. Please request a new one.',
          code: 'AUTH_EXPIRED_OTP',
          severity: ErrorSeverity.MEDIUM
        }
      case AuthError.RATE_LIMITED:
        return {
          message: 'Too many attempts. Please wait before trying again.',
          code: 'AUTH_RATE_LIMITED',
          severity: ErrorSeverity.HIGH
        }
      case AuthError.SESSION_EXPIRED:
        return {
          message: 'Your session has expired. Please sign in again.',
          code: 'AUTH_SESSION_EXPIRED',
          severity: ErrorSeverity.HIGH
        }
      case AuthError.NETWORK_ERROR:
        return {
          message: 'Network error. Please check your connection and try again.',
          code: 'AUTH_NETWORK_ERROR',
          severity: ErrorSeverity.MEDIUM
        }
      case AuthError.INVALID_CREDENTIALS:
        return {
          message: 'Invalid credentials. Please check your email and try again.',
          code: 'AUTH_INVALID_CREDENTIALS',
          severity: ErrorSeverity.MEDIUM
        }
      case AuthError.EMAIL_NOT_CONFIRMED:
        return {
          message: 'Please confirm your email address before signing in.',
          code: 'AUTH_EMAIL_NOT_CONFIRMED',
          severity: ErrorSeverity.MEDIUM
        }
      default:
        return {
          message: 'An authentication error occurred. Please try again.',
          code: 'AUTH_UNKNOWN_ERROR',
          severity: ErrorSeverity.HIGH
        }
    }
  }

  // ===========================================
  // Retry Logic
  // ===========================================

  async retryOperation<T>(
    operation: () => Promise<T>,
    errorKey: string,
    maxAttempts?: number
  ): Promise<T> {
    const attempts = maxAttempts || this.config.retryAttempts
    const currentAttempts = this.retryAttempts.get(errorKey) || 0

    if (currentAttempts >= attempts) {
      throw this.createError(
        `Operation failed after ${attempts} attempts`,
        'RETRY_EXHAUSTED',
        ErrorCategory.SYSTEM,
        ErrorSeverity.HIGH,
        { errorKey, attempts }
      )
    }

    try {
      const result = await operation()
      // Reset retry attempts on success
      this.retryAttempts.delete(errorKey)
      return result
    } catch (error) {
      this.retryAttempts.set(errorKey, currentAttempts + 1)
      
      // Add delay before retry
      if (currentAttempts < attempts - 1) {
        await this.delay(Math.pow(2, currentAttempts) * 1000) // Exponential backoff
        return this.retryOperation(operation, errorKey, maxAttempts)
      }
      
      throw error
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // ===========================================
  // Error Reporting and Logging
  // ===========================================

  private logError(error: AppError): void {
    const logLevel = this.getLogLevel(error.severity)
    const logMessage = `[${error.category.toUpperCase()}] ${error.message}`
    
    console[logLevel]({
      id: error.id,
      message: logMessage,
      code: error.code,
      timestamp: error.timestamp,
      context: error.context,
      stack: error.stack
    })
  }

  private getLogLevel(severity: ErrorSeverity): 'error' | 'warn' | 'info' | 'debug' {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        return 'error'
      case ErrorSeverity.MEDIUM:
        return 'warn'
      case ErrorSeverity.LOW:
        return 'info'
      default:
        return 'debug'
    }
  }

  private async reportError(error: AppError): Promise<void> {
    if (!this.config.errorReportingEndpoint) return

    const report: ErrorReport = {
      error,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date(),
      environment: this.getEnvironment()
    }

    try {
      await fetch(this.config.errorReportingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(report)
      })
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError)
    }
  }

  private notifyUser(error: AppError): void {
    // Dispatch custom event for UI components to handle
    window.dispatchEvent(new CustomEvent('appError', {
      detail: {
        id: error.id,
        message: error.message,
        severity: error.severity,
        category: error.category,
        retryable: error.retryable
      }
    }))
  }

  // ===========================================
  // Utility Methods
  // ===========================================

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private getCurrentUserId(): string | undefined {
    // This would typically get the current user ID from auth context
    // For now, return undefined as we don't have access to auth context here
    return undefined
  }

  private getCurrentSessionId(): string | undefined {
    // This would typically get the current session ID
    // For now, return undefined
    return undefined
  }

  private isRetryableError(category: ErrorCategory, code: string): boolean {
    // Define which errors are retryable
    const retryableCategories = [ErrorCategory.NETWORK, ErrorCategory.SYSTEM]
    const nonRetryableCodes = ['AUTH_INVALID_CREDENTIALS', 'AUTH_INVALID_OTP', 'PERMISSION_DENIED']
    
    return retryableCategories.includes(category) && !nonRetryableCodes.includes(code)
  }

  private getEnvironment(): 'development' | 'staging' | 'production' {
    // Determine environment based on URL or other indicators
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'development'
    }
    if (window.location.hostname.includes('staging') || window.location.hostname.includes('test')) {
      return 'staging'
    }
    return 'production'
  }

  private checkErrorLimits(): void {
    if (this.errors.length > this.config.maxErrorsPerSession) {
      console.warn(`Error limit exceeded: ${this.errors.length} errors in session`)
      
      // Create critical error for error limit exceeded
      this.createError(
        `Error limit exceeded: ${this.errors.length} errors in session`,
        'ERROR_LIMIT_EXCEEDED',
        ErrorCategory.SYSTEM,
        ErrorSeverity.CRITICAL,
        { errorCount: this.errors.length, limit: this.config.maxErrorsPerSession }
      )
    }
  }

  private cleanupOldErrors(): void {
    // Keep only last 50 errors to prevent memory leaks
    if (this.errors.length > 50) {
      this.errors = this.errors.slice(-50)
    }
  }

  private setupGlobalHandlers(): void {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.createError(
        `Unhandled promise rejection: ${event.reason}`,
        'UNHANDLED_PROMISE_REJECTION',
        ErrorCategory.SYSTEM,
        ErrorSeverity.HIGH,
        { reason: event.reason }
      )
    })

    // Handle uncaught errors (in development)
    if (this.getEnvironment() === 'development') {
      window.addEventListener('error', (event) => {
        this.createError(
          `Uncaught error: ${event.message}`,
          'UNCAUGHT_ERROR',
          ErrorCategory.SYSTEM,
          ErrorSeverity.CRITICAL,
          {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            error: event.error
          },
          event.error
        )
      })
    }
  }

  // ===========================================
  // Public API
  // ===========================================

  getErrors(): AppError[] {
    return [...this.errors]
  }

  getErrorById(id: string): AppError | undefined {
    return this.errors.find(error => error.id === id)
  }

  getErrorsByCategory(category: ErrorCategory): AppError[] {
    return this.errors.filter(error => error.category === category)
  }

  getErrorStats(): {
    total: number
    byCategory: Record<ErrorCategory, number>
    bySeverity: Record<ErrorSeverity, number>
    unresolved: number
  } {
    const stats = {
      total: this.errors.length,
      byCategory: {} as Record<ErrorCategory, number>,
      bySeverity: {} as Record<ErrorSeverity, number>,
      unresolved: 0
    }

    this.errors.forEach(error => {
      stats.byCategory[error.category] = (stats.byCategory[error.category] || 0) + 1
      stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1
      if (!error.resolved) stats.unresolved++
    })

    return stats
  }

  markErrorResolved(id: string): void {
    const error = this.getErrorById(id)
    if (error) {
      error.resolved = true
    }
  }

  clearErrors(): void {
    this.errors = []
    this.errorCounts.clear()
    this.retryAttempts.clear()
  }
}

// ===========================================
// Convenience Functions
// ===========================================

export const handleError = (
  message: string,
  code: string,
  category: ErrorCategory,
  severity?: ErrorSeverity,
  context?: Record<string, any>
): AppError => {
  const errorHandler = ErrorHandler.getInstance()
  return errorHandler.createError(message, code, category, severity, context)
}

export const handleAuthError = (
  authError: AuthError,
  context?: Record<string, any>
): AppError => {
  const errorHandler = ErrorHandler.getInstance()
  return errorHandler.handleAuthError(authError, context)
}

export const retryOperation = async <T>(
  operation: () => Promise<T>,
  errorKey: string,
  maxAttempts?: number
): Promise<T> => {
  const errorHandler = ErrorHandler.getInstance()
  return errorHandler.retryOperation(operation, errorKey, maxAttempts)
}

// ===========================================
// Export
// ===========================================

export default ErrorHandler
