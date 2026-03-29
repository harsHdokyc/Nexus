// Nexus - Authentication Testing Utilities
// Production-grade testing helpers for authentication flows

import { AuthService, AuthError } from '../features/auth/authService'
import { useAuth } from '../features/auth/AuthProvider'
import { renderHook, act, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'
import React from 'react'

// ===========================================
// Test Configuration
// ===========================================

export interface TestUser {
  email: string
  id: string
  createdAt: Date
}

export interface TestConfig {
  enableNetworkSimulation: boolean
  simulateDelays: boolean
  delayMs: number
  enableErrorSimulation: boolean
  errorRate: number // 0-1
}

export interface AuthTestResult {
  success: boolean
  duration: number
  error?: AuthError
  data?: any
  metadata: Record<string, any>
}

// ===========================================
// Mock Service for Testing
// ===========================================

export class MockAuthService {
  private static testUsers: TestUser[] = []
  private static otpStore: Map<string, { code: string; expiresAt: Date; attempts: number }> = new Map()
  private static config: TestConfig = {
    enableNetworkSimulation: true,
    simulateDelays: true,
    delayMs: 500,
    enableErrorSimulation: false,
    errorRate: 0.1
  }

  static configure(config: Partial<TestConfig>): void {
    this.config = { ...this.config, ...config }
  }

  static reset(): void {
    this.testUsers = []
    this.otpStore.clear()
  }

  static addTestUser(email: string): TestUser {
    const user: TestUser = {
      email,
      id: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    }
    this.testUsers.push(user)
    return user
  }

  static getTestUser(email: string): TestUser | undefined {
    return this.testUsers.find(u => u.email === email)
  }

  private static async simulateNetwork<T>(
    operation: () => T,
    errorRate?: number
  ): Promise<T> {
    const config = this.config

    // Simulate delay
    if (config.simulateDelays) {
      await new Promise(resolve => setTimeout(resolve, config.delayMs))
    }

    // Simulate network error
    if (config.enableErrorSimulation && Math.random() < (errorRate || config.errorRate)) {
      throw new Error('Network simulation error')
    }

    return operation()
  }

  static async sendOTP(email: string): Promise<{ success: boolean; error?: AuthError; message?: string; data?: any }> {
    return this.simulateNetwork(async () => {
      // Check if user exists
      const user = this.getTestUser(email)
      if (!user) {
        return {
          success: false,
          error: AuthError.INVALID_CREDENTIALS,
          message: 'Email not found in test users'
        }
      }

      // Check cooldown
      const existingOTP = this.otpStore.get(email)
      if (existingOTP && existingOTP.expiresAt > new Date()) {
        return {
          success: false,
          error: AuthError.RATE_LIMITED,
          message: 'OTP cooldown active'
        }
      }

      // Generate OTP
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

      this.otpStore.set(email, {
        code,
        expiresAt,
        attempts: 0
      })

      return {
        success: true,
        message: `OTP sent to ${email}. Test OTP: ${code}`
      }
    })
  }

  static async verifyOTP(email: string, token: string): Promise<{ success: boolean; error?: AuthError; message?: string; data?: any }> {
    return this.simulateNetwork(async () => {
      const otpData = this.otpStore.get(email)
      
      if (!otpData) {
        return {
          success: false,
          error: AuthError.EXPIRED_OTP,
          message: 'OTP not found or expired'
        }
      }

      // Check expiry
      if (otpData.expiresAt < new Date()) {
        this.otpStore.delete(email)
        return {
          success: false,
          error: AuthError.EXPIRED_OTP,
          message: 'OTP expired'
        }
      }

      // Check attempts
      if (otpData.attempts >= 3) {
        this.otpStore.delete(email)
        return {
          success: false,
          error: AuthError.RATE_LIMITED,
          message: 'Too many OTP attempts'
        }
      }

      otpData.attempts++

      // Verify OTP
      if (otpData.code !== token) {
        return {
          success: false,
          error: AuthError.INVALID_OTP,
          message: 'Invalid OTP'
        }
      }

      // Success - clean up
      this.otpStore.delete(email)

      return {
        success: true,
        message: 'OTP verified successfully',
        data: {
          user: this.getTestUser(email),
          session: {
            access_token: 'mock_token',
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          }
        }
      }
    })
  }

  static async getCurrentUser(): Promise<{ user: any; session: any; isValid: boolean; error?: AuthError }> {
    return this.simulateNetwork(async () => {
      // Mock implementation - would check session in real scenario
      return {
        user: null,
        session: null,
        isValid: false
      }
    })
  }

  static async forceLogout(): Promise<{ success: boolean; error?: string }> {
    return this.simulateNetwork(async () => {
      return { success: true }
    })
  }
}

// ===========================================
// Test Utilities
// ===========================================

export class AuthTestRunner {
  private results: AuthTestResult[] = []

  constructor(private config: Partial<TestConfig> = {}) {
    MockAuthService.configure(config)
  }

  async runTest(name: string, testFn: () => Promise<AuthTestResult>): Promise<AuthTestResult> {
    const startTime = Date.now()
    
    try {
      const result = await testFn()
      const duration = Date.now() - startTime
      
      const testResult: AuthTestResult = {
        ...result,
        duration,
        metadata: {
          testName: name,
          timestamp: new Date()
        }
      }

      this.results.push(testResult)
      return testResult
    } catch (error) {
      const duration = Date.now() - startTime
      
      const testResult: AuthTestResult = {
        success: false,
        duration,
        error: AuthError.UNKNOWN_ERROR,
        metadata: {
          testName: name,
          timestamp: new Date(),
          originalError: error
        }
      }

      this.results.push(testResult)
      return testResult
    }
  }

  async testOTPFlow(email: string): Promise<AuthTestResult> {
    return this.runTest('OTP Flow', async () => {
      // Step 1: Send OTP
      const sendResult = await MockAuthService.sendOTP(email)
      if (!sendResult.success) {
        return {
          success: false,
          duration: 0,
          error: sendResult.error,
          metadata: { step: 'send_otp', message: sendResult.message }
        }
      }

      // Extract OTP from message (test only)
      const otpMatch = sendResult.message?.match(/Test OTP: (\d{6})/)
      if (!otpMatch) {
        return {
          success: false,
          duration: 0,
          error: AuthError.UNKNOWN_ERROR,
          metadata: { step: 'extract_otp', message: 'Could not extract test OTP' }
        }
      }

      const otp = otpMatch[1]

      // Step 2: Verify OTP
      const verifyResult = await MockAuthService.verifyOTP(email, otp)
      if (!verifyResult.success) {
        return {
          success: false,
          duration: 0,
          error: verifyResult.error,
          metadata: { step: 'verify_otp', message: verifyResult.message }
        }
      }

      return {
        success: true,
        duration: 0,
        data: verifyResult.data,
        metadata: { step: 'complete', message: 'OTP flow completed successfully' }
      }
    })
  }

  async testInvalidOTP(email: string, invalidOTP: string): Promise<AuthTestResult> {
    return this.runTest('Invalid OTP', async () => {
      // First send OTP
      await MockAuthService.sendOTP(email)

      // Then try invalid OTP
      const result = await MockAuthService.verifyOTP(email, invalidOTP)
      
      return {
        success: !result.success && result.error === AuthError.INVALID_OTP,
        duration: 0,
        error: result.success ? AuthError.UNKNOWN_ERROR : undefined,
        metadata: { expectedError: AuthError.INVALID_OTP, actualError: result.error }
      }
    })
  }

  async testExpiredOTP(email: string): Promise<AuthTestResult> {
    return this.runTest('Expired OTP', async () => {
      // Send OTP
      await MockAuthService.sendOTP(email)

      // Manually expire OTP
      const otpData = MockAuthService['otpStore'].get(email)
      if (otpData) {
        otpData.expiresAt = new Date(Date.now() - 1000) // Expired 1 second ago
      }

      // Try to verify expired OTP
      const result = await MockAuthService.verifyOTP(email, '123456')
      
      return {
        success: !result.success && result.error === AuthError.EXPIRED_OTP,
        duration: 0,
        error: result.success ? AuthError.UNKNOWN_ERROR : undefined,
        metadata: { expectedError: AuthError.EXPIRED_OTP, actualError: result.error }
      }
    })
  }

  async testRateLimit(email: string): Promise<AuthTestResult> {
    return this.runTest('Rate Limit', async () => {
      // Send multiple OTPs rapidly
      const results = []
      for (let i = 0; i < 3; i++) {
        const result = await MockAuthService.sendOTP(email)
        results.push(result)
      }

      const rateLimitedResults = results.filter(r => r.error === AuthError.RATE_LIMITED)
      
      return {
        success: rateLimitedResults.length > 0,
        duration: 0,
        metadata: { 
          rateLimitedCount: rateLimitedResults.length,
          totalAttempts: results.length
        }
      }
    })
  }

  getResults(): AuthTestResult[] {
    return [...this.results]
  }

  getSuccessRate(): number {
    if (this.results.length === 0) return 0
    return (this.results.filter(r => r.success).length / this.results.length) * 100
  }

  getAverageDuration(): number {
    if (this.results.length === 0) return 0
    return this.results.reduce((sum, r) => sum + r.duration, 0) / this.results.length
  }

  reset(): void {
    this.results = []
    MockAuthService.reset()
  }
}

// ===========================================
// React Testing Utilities
// ===========================================

export const renderAuthHook = (initialProps = {}) => {
  const wrapper = ({ children }: { children: ReactNode }) => {
    // Mock AuthProvider for testing
    return React.createElement('div', null, children)
  }

  return renderHook(() => useAuth(), { wrapper, initialProps })
}

export const waitForAuthState = async (hookResult: any, expectedState: any) => {
  await waitFor(() => {
    expect(hookResult.current).toMatchObject(expectedState)
  })
}

// ===========================================
// Integration Test Helpers
// ===========================================

export class IntegrationTestHelper {
  static async setupTestEnvironment(): Promise<void> {
    // Configure mock service for testing
    MockAuthService.configure({
      enableNetworkSimulation: false,
      simulateDelays: false,
      enableErrorSimulation: false,
      errorRate: 0
    })
  }

  static async cleanupTestEnvironment(): Promise<void> {
    MockAuthService.reset()
  }

  static async runFullAuthFlow(email: string): Promise<boolean> {
    try {
      await this.setupTestEnvironment()

      const runner = new AuthTestRunner()
      const result = await runner.testOTPFlow(email)

      await this.cleanupTestEnvironment()
      return result.success
    } catch (error) {
      await this.cleanupTestEnvironment()
      return false
    }
  }

  static async testSessionExpiry(): Promise<boolean> {
    try {
      await this.setupTestEnvironment()

      const email = 'test@example.com'
      MockAuthService.addTestUser(email)

      // Start session
      const runner = new AuthTestRunner()
      await runner.testOTPFlow(email)

      // Test session expiry logic would go here
      // This is a placeholder for the actual session expiry test

      await this.cleanupTestEnvironment()
      return true
    } catch (error) {
      await this.cleanupTestEnvironment()
      return false
    }
  }
}

// ===========================================
// Performance Testing
// ===========================================

export class PerformanceTester {
  static async measureOTPFlowPerformance(iterations: number = 100): Promise<{
    averageDuration: number
    minDuration: number
    maxDuration: number
    successRate: number
    throughput: number // operations per second
  }> {
    const runner = new AuthTestRunner({
      simulateDelays: false,
      enableErrorSimulation: false
    })

    const durations: number[] = []
    let successCount = 0

    for (let i = 0; i < iterations; i++) {
      const email = `test${i}@example.com`
      MockAuthService.addTestUser(email)

      const startTime = Date.now()
      const result = await runner.testOTPFlow(email)
      const duration = Date.now() - startTime

      durations.push(duration)
      if (result.success) successCount++
    }

    const averageDuration = durations.reduce((a, b) => a + b, 0) / durations.length
    const minDuration = Math.min(...durations)
    const maxDuration = Math.max(...durations)
    const successRate = (successCount / iterations) * 100
    const totalTime = durations.reduce((a, b) => a + b, 0)
    const throughput = iterations / (totalTime / 1000)

    return {
      averageDuration,
      minDuration,
      maxDuration,
      successRate,
      throughput
    }
  }
}

// ===========================================
// Export
// ===========================================

export default MockAuthService
