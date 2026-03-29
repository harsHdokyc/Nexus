// Nexus - Session Monitoring and Cleanup Utilities
// Production-grade session management with monitoring and security

import React from 'react'
import { AuthService, CustomSessionData, SESSION_DURATION_DAYS } from '../features/auth/authService'

// ===========================================
// Session Monitoring Configuration
// ===========================================

export interface SessionMonitorConfig {
  checkInterval: number // in seconds
  warningThreshold: number // days before expiration to show warning
  enableAutoCleanup: boolean
  enableActivityTracking: boolean
  enableSecurityMonitoring: boolean
}

export interface SessionInfo {
  isValid: boolean
  expiresAt: Date | null
  daysRemaining: number
  isExpiringSoon: boolean
  lastActivity: Date | null
  securityFlags: SecurityFlags
}

export interface SecurityFlags {
  suspiciousActivity: boolean
  multipleSessions: boolean
  longInactivePeriod: boolean
  unusualLocation: boolean
}

export interface ActivityEvent {
  type: 'login' | 'logout' | 'otp_sent' | 'otp_verified' | 'session_extended' | 'security_alert'
  timestamp: Date
  metadata: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

// ===========================================
// Default Configuration
// ===========================================

const DEFAULT_CONFIG: SessionMonitorConfig = {
  checkInterval: 300, // 5 minutes
  warningThreshold: 3, // 3 days before expiration
  enableAutoCleanup: true,
  enableActivityTracking: true,
  enableSecurityMonitoring: true
}

// ===========================================
// Session Monitor Class
// ===========================================

export class SessionMonitor {
  private config: SessionMonitorConfig
  private intervalId: NodeJS.Timeout | null = null
  private isMonitoring = false
  private lastCheck: Date | null = null
  private activityLog: ActivityEvent[] = []
  private securityFlags: SecurityFlags = {
    suspiciousActivity: false,
    multipleSessions: false,
    longInactivePeriod: false,
    unusualLocation: false
  }

  constructor(config: Partial<SessionMonitorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  // ===========================================
  // Monitoring Control
  // ===========================================

  start(): void {
    if (this.isMonitoring) {
      console.warn('Session monitoring is already started')
      return
    }

    this.isMonitoring = true
    this.lastCheck = new Date()

    // Start periodic checks
    this.intervalId = setInterval(() => {
      this.performHealthCheck()
    }, this.config.checkInterval * 1000)

    // Log monitoring start
    this.logActivity('session_extended', { action: 'monitoring_started' })

    console.log('Session monitoring started')
  }

  stop(): void {
    if (!this.isMonitoring) {
      console.warn('Session monitoring is not running')
      return
    }

    this.isMonitoring = false

    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }

    // Log monitoring stop
    this.logActivity('session_extended', { action: 'monitoring_stopped' })

    console.log('Session monitoring stopped')
  }

  // ===========================================
  // Session Health Check
  // ===========================================

  private async performHealthCheck(): Promise<void> {
    try {
      const sessionInfo = await this.getSessionInfo()
      this.lastCheck = new Date()

      // Check for security issues
      if (this.config.enableSecurityMonitoring) {
        await this.performSecurityCheck(sessionInfo)
      }

      // Check expiration warning
      if (sessionInfo.isExpiringSoon) {
        this.handleExpirationWarning(sessionInfo)
      }

      // Auto-cleanup if enabled
      if (this.config.enableAutoCleanup && !sessionInfo.isValid) {
        this.handleInvalidSession()
      }

    } catch (error) {
      console.error('Session health check failed:', error)
      this.logActivity('security_alert', { error: error.message })
    }
  }

  // ===========================================
  // Session Information
  // ===========================================

  async getSessionInfo(): Promise<SessionInfo> {
    const customSession = AuthService.getCustomSessionData()
    const daysRemaining = AuthService.getSessionDaysRemaining()

    let expiresAt: Date | null = null
    let isValid = false

    if (customSession) {
      expiresAt = new Date(customSession.loginTimestamp + (SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000))
      isValid = !AuthService.isSessionExpired(customSession.loginTimestamp)
    }

    return {
      isValid,
      expiresAt,
      daysRemaining,
      isExpiringSoon: daysRemaining > 0 && daysRemaining <= this.config.warningThreshold,
      lastActivity: this.lastCheck,
      securityFlags: this.securityFlags
    }
  }

  // ===========================================
  // Security Monitoring
  // ===========================================

  private async performSecurityCheck(sessionInfo: SessionInfo): Promise<void> {
    const flags: SecurityFlags = {
      suspiciousActivity: false,
      multipleSessions: false,
      longInactivePeriod: false,
      unusualLocation: false
    }

    // Check for suspicious activity patterns
    flags.suspiciousActivity = this.detectSuspiciousActivity()

    // Check for multiple active sessions
    flags.multipleSessions = await this.detectMultipleSessions()

    // Check for long inactive periods
    flags.longInactivePeriod = this.detectLongInactivePeriod()

    // Check for unusual location (if IP tracking is available)
    flags.unusualLocation = this.detectUnusualLocation()

    this.securityFlags = flags

    // Log security alerts if any flags are set
    if (Object.values(flags).some(flag => flag)) {
      this.logActivity('security_alert', { securityFlags: flags })
    }
  }

  private detectSuspiciousActivity(): boolean {
    // Check for rapid OTP requests
    const recentOTPRequests = this.activityLog.filter(
      event => event.type === 'otp_sent' && 
      Date.now() - event.timestamp.getTime() < 5 * 60 * 1000 // 5 minutes
    )

    return recentOTPRequests.length > 3
  }

  private async detectMultipleSessions(): Promise<boolean> {
    // This would typically check with the backend
    // For now, we'll use a simple heuristic based on activity patterns
    const recentLogins = this.activityLog.filter(
      event => event.type === 'login' && 
      Date.now() - event.timestamp.getTime() < 60 * 60 * 1000 // 1 hour
    )

    return recentLogins.length > 1
  }

  private detectLongInactivePeriod(): boolean {
    if (!this.lastCheck) return false

    const inactiveHours = (Date.now() - this.lastCheck.getTime()) / (1000 * 60 * 60)
    return inactiveHours > 24 // 24 hours
  }

  private detectUnusualLocation(): boolean {
    // This would typically compare IP addresses with known locations
    // For now, return false as we don't have IP tracking in this implementation
    return false
  }

  // ===========================================
  // Event Handlers
  // ===========================================

  private handleExpirationWarning(sessionInfo: SessionInfo): void {
    const warningMessage = `Session expires in ${sessionInfo.daysRemaining} days`
    
    // Dispatch custom event for UI components to handle
    window.dispatchEvent(new CustomEvent('sessionExpiring', {
      detail: {
        daysRemaining: sessionInfo.daysRemaining,
        expiresAt: sessionInfo.expiresAt
      }
    }))

    console.warn(warningMessage)
  }

  private handleInvalidSession(): void {
    // Dispatch session expired event
    window.dispatchEvent(new CustomEvent('sessionExpired', {
      detail: {
        reason: 'expired',
        timestamp: new Date()
      }
    }))

    // Force logout
    AuthService.forceLogout()
  }

  // ===========================================
  // Activity Logging
  // ===========================================

  logActivity(type: ActivityEvent['type'], metadata: Record<string, any> = {}): void {
    if (!this.config.enableActivityTracking) return

    const event: ActivityEvent = {
      type,
      timestamp: new Date(),
      metadata,
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent
    }

    this.activityLog.push(event)

    // Keep only last 100 events to prevent memory leaks
    if (this.activityLog.length > 100) {
      this.activityLog = this.activityLog.slice(-100)
    }
  }

  private getClientIP(): string | undefined {
    // In a real implementation, this would get the client IP from headers or a service
    // For now, return undefined as we can't reliably get client IP in browser
    return undefined
  }

  // ===========================================
  // Utility Methods
  // ===========================================

  getActivityLog(limit: number = 50): ActivityEvent[] {
    return this.activityLog.slice(-limit)
  }

  getSecurityFlags(): SecurityFlags {
    return { ...this.securityFlags }
  }

  isSessionExpiringSoon(): boolean {
    const daysRemaining = AuthService.getSessionDaysRemaining()
    return daysRemaining > 0 && daysRemaining <= this.config.warningThreshold
  }

  extendSession(): void {
    // This would typically call a backend API to extend the session
    // For now, we'll just log the activity
    this.logActivity('session_extended', { action: 'manual_extension' })
  }

  forceLogout(): void {
    this.stop()
    AuthService.forceLogout()
  }

  // ===========================================
  // Cleanup
  // ===========================================

  destroy(): void {
    this.stop()
    this.activityLog = []
    this.securityFlags = {
      suspiciousActivity: false,
      multipleSessions: false,
      longInactivePeriod: false,
      unusualLocation: false
    }
  }
}

// ===========================================
// Singleton Instance
// ===========================================

let sessionMonitorInstance: SessionMonitor | null = null

export const getSessionMonitor = (config?: Partial<SessionMonitorConfig>): SessionMonitor => {
  if (!sessionMonitorInstance) {
    sessionMonitorInstance = new SessionMonitor(config)
  }
  return sessionMonitorInstance
}

export const destroySessionMonitor = (): void => {
  if (sessionMonitorInstance) {
    sessionMonitorInstance.destroy()
    sessionMonitorInstance = null
  }
}

// ===========================================
// React Hook Integration
// ===========================================

export const useSessionMonitor = (config?: Partial<SessionMonitorConfig>) => {
  const monitor = getSessionMonitor(config)

  React.useEffect(() => {
    // Start monitoring when hook is used
    monitor.start()

    // Set up event listeners
    const handleSessionExpiring = (event: CustomEvent) => {
      console.warn('Session expiring soon:', event.detail)
    }

    const handleSessionExpired = (event: CustomEvent) => {
      console.error('Session expired:', event.detail)
    }

    window.addEventListener('sessionExpiring', handleSessionExpiring as EventListener)
    window.addEventListener('sessionExpired', handleSessionExpired as EventListener)

    // Cleanup on unmount
    return () => {
      window.removeEventListener('sessionExpiring', handleSessionExpiring as EventListener)
      window.removeEventListener('sessionExpired', handleSessionExpired as EventListener)
      monitor.stop()
    }
  }, [monitor])

  return {
    monitor,
    isExpiringSoon: monitor.isSessionExpiringSoon(),
    securityFlags: monitor.getSecurityFlags(),
    extendSession: () => monitor.extendSession(),
    forceLogout: () => monitor.forceLogout()
  }
}

// ===========================================
// Export
// ===========================================

export default SessionMonitor
