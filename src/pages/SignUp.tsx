// Nexus - Production-Grade Sign Up Page
// Uses OTP-based authentication with our production auth system

import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/features/auth'
import { PublicRoute } from '@/features/auth/ProtectedRoute'
import { AuthError } from '@/features/auth/authService'

// ===========================================
// Component
// ===========================================

const SignUp = () => {
  const navigate = useNavigate()
  
  // Auth hooks
  const { sendOTP, verifyOTP, isAuthenticated, isLoading, error } = useAuth()
  
  // Component state
  const [email, setEmail] = useState('')
  const [otp, setOTP] = useState('')
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, isLoading, navigate])

  // Handle auth errors
  React.useEffect(() => {
    if (error) {
      setSubmitError(getErrorMessage(error))
    }
  }, [error])

  // Get user-friendly error message
  const getErrorMessage = (error: AuthError): string => {
    switch (error) {
      case AuthError.INVALID_OTP:
        return 'Invalid OTP. Please check and try again.'
      case AuthError.EXPIRED_OTP:
        return 'OTP has expired. Please request a new one.'
      case AuthError.RATE_LIMITED:
        return 'Too many attempts. Please wait before trying again.'
      case AuthError.NETWORK_ERROR:
        return 'Network error. Please check your connection and try again.'
      case AuthError.INVALID_CREDENTIALS:
        return 'Invalid email address. Please check and try again.'
      case AuthError.EMAIL_NOT_CONFIRMED:
        return 'Email not confirmed. Please check your inbox.'
      default:
        return 'An error occurred. Please try again.'
    }
  }

  // Clear messages
  const clearMessages = () => {
    setSubmitError('')
    setSuccessMessage('')
  }

  // Handle email submission
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearMessages()

    if (!email.trim()) {
      setSubmitError('Please enter your email address')
      return
    }

    if (!isValidEmail(email)) {
      setSubmitError('Please enter a valid email address')
      return
    }

    setIsSubmitting(true)

    try {
      const result = await sendOTP(email.trim(), true)
      
      if (result.success) {
        setSuccessMessage(result.message || 'OTP sent successfully!')
        setStep('otp')
      } else {
        setSubmitError(result.message || 'Failed to send OTP')
      }
    } catch (error) {
      console.error('Email submission error:', error)
      setSubmitError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle OTP verification
  const handleOTPVerify = async (otpValue: string) => {
    clearMessages()
    setIsSubmitting(true)

    try {
      const result = await verifyOTP(email.trim(), otpValue, true)
      
      if (result.success) {
        setSuccessMessage('Account created! Welcome to Nexus!')
        // Navigation will happen automatically via AuthProvider
      } else {
        setSubmitError(result.message || 'OTP verification failed')
      }
    } catch (error) {
      console.error('OTP verification error:', error)
      setSubmitError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Email validation
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Reset form
  const resetForm = () => {
    setEmail('')
    setOTP('')
    setStep('email')
    clearMessages()
  }

  // Benefits list
  const benefits = [
    "Unified inbox for all platforms",
    "AI-powered message prioritization", 
    "Keyboard-first interface",
    "30-day session management",
    "Bank-level security with RLS",
    "Real-time message synchronization"
  ]

  // ===========================================
  // Render
  // ===========================================

  return (
    <PublicRoute>
      <div className="min-h-screen flex">
        {/* Left Side - Benefits */}
        <div className="hidden lg:flex flex-1 bg-foreground items-center justify-center p-12">
          <div className="max-w-lg text-background">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-3xl font-bold mb-8">
                Join thousands of professionals using Nexus
              </h2>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={benefit} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center">
                      <Check className="w-4 h-4 text-background" />
                    </div>
                    <span className="text-background/80">{benefit}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>

        {/* Right Side - Sign Up Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md"
          >
            {/* Header */}
            <Link to="/" className="flex items-center gap-2 mb-12">
              <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
                <Mail className="w-5 h-5 text-background" />
              </div>
              <span className="text-xl font-semibold">Nexus</span>
            </Link>

            <h1 className="text-3xl font-bold mb-2">Create your account</h1>
            <p className="text-muted-foreground mb-8">
              Get started with your unified communication hub
            </p>

            {/* Success Message */}
            {successMessage && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM3.707 9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 01-1.414 1.414l2 2a1 1 0 001.414 1.414l-4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-800">{successMessage}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {submitError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414-1.414L8 5.586 5.293 4.293a1 1 0 101.414 1.414l4 4a1 1 0 001.414 1.414L11.414 10l1.293 1.293a1 1 0 001.414-1.414l-4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{submitError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Email Step */}
            {step === 'email' && (
              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                    placeholder="you@example.com"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || !email.trim()}
                  className="w-full h-12 flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0c5.373 0 9.8 4.243 9.8 9.8 0 009.8 4.243 9.8 9.8 0 014.243 9.8 9.8 0 009.8-4.243L12 15.657l-4 2.293z"></path>
                      </svg>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* OTP Step */}
            {step === 'otp' && (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    We sent a 6-digit code to <strong>{email}</strong>
                  </p>
                </div>

                {/* OTP Input Component */}
                <div className="flex justify-center gap-2">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <input
                      key={index}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={otp[index] || ''}
                      onChange={(e) => {
                        const newOTP = otp.split('')
                        newOTP[index] = e.target.value.slice(-1)
                        setOTP(newOTP.join(''))
                        
                        if (e.target.value && index < 5) {
                          const nextInput = document.getElementById(`otp-${index + 1}`)
                          if (nextInput) {
                            nextInput.focus()
                          }
                        }
                        
                        // Auto-verify when OTP is complete
                        if (newOTP.join('').length === 6) {
                          handleOTPVerify(newOTP.join(''))
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !otp[index] && index > 0) {
                          const prevInput = document.getElementById(`otp-${index - 1}`)
                          if (prevInput) {
                            prevInput.focus()
                          }
                          const newOTP = otp.split('')
                          newOTP[index] = ''
                          setOTP(newOTP.join(''))
                        }
                      }}
                      disabled={isSubmitting}
                      autoFocus={index === 0}
                      id={`otp-${index}`}
                      className="w-12 h-12 text-center text-lg font-semibold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                      placeholder="○"
                    />
                  ))}
                </div>

                <div className="text-center space-y-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={isSubmitting}
                    className="text-sm text-gray-600 hover:text-gray-500 focus:outline-none focus:underline disabled:opacity-50"
                  >
                    ← Back to email
                  </button>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="text-center text-sm text-gray-600">
              <p>
                Already have an account?{' '}
                <Link to="/signin" className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline">
                  Sign in
                </Link>
              </p>
              <p className="mt-4 text-center text-xs text-gray-600">
                By signing up, you agree to our{' '}
                <Link to="/terms" className="hover:underline">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </PublicRoute>
  )
}

export default SignUp
