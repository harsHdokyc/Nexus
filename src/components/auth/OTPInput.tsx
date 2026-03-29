// Nexus - Production-Grade OTP Input Component
// Handles OTP input with validation, auto-focus, and accessibility

import React, { useState, useRef, useEffect, useCallback } from 'react'

// ===========================================
// Type Definitions
// ===========================================

export interface OTPInputProps {
  length?: number
  value?: string
  onChange?: (value: string) => void
  onComplete?: (value: string) => void
  disabled?: boolean
  autoFocus?: boolean
  placeholder?: string
  className?: string
  inputClassName?: string
  containerClassName?: string
  error?: string
  showResend?: boolean
  onResend?: () => void
  resendCooldown?: number
  isLoading?: boolean
  pattern?: string
  autoComplete?: string
}

// ===========================================
// OTP Input Component
// ===========================================

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  value = '',
  onChange,
  onComplete,
  disabled = false,
  autoFocus = true,
  placeholder = '○',
  className = '',
  inputClassName = '',
  containerClassName = '',
  error,
  showResend = false,
  onResend,
  resendCooldown = 60,
  isLoading = false,
  pattern = '[0-9]',
  autoComplete = 'one-time-code'
}) => {
  // State
  const [internalValue, setInternalValue] = useState<string[]>(Array(length).fill(''))
  const [cooldown, setCooldown] = useState(0)
  const [focusedIndex, setFocusedIndex] = useState<number>(-1)
  
  // Refs
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(length).fill(null))

  // Initialize value from props
  useEffect(() => {
    if (value) {
      const valueArray = value.split('').slice(0, length)
      const paddedValue = [...valueArray, ...Array(length - valueArray.length).fill('')]
      setInternalValue(paddedValue)
    }
  }, [value, length])

  // Handle cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  // Start cooldown
  useEffect(() => {
    if (resendCooldown > 0 && cooldown === 0) {
      setCooldown(resendCooldown)
    }
  }, [resendCooldown])

  // Handle input change
  const handleChange = useCallback((index: number, newValue: string) => {
    // Only allow pattern-matching characters
    if (newValue && !new RegExp(pattern).test(newValue)) {
      return
    }

    const newValues = [...internalValue]
    newValues[index] = newValue.slice(-1) // Take only last character
    setInternalValue(newValues)

    const stringValue = newValues.join('')
    
    // Call onChange callback
    if (onChange) {
      onChange(stringValue)
    }

    // Auto-focus next input
    if (newValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    // Call onComplete when all fields are filled
    if (stringValue.length === length && onComplete) {
      onComplete(stringValue)
    }
  }, [internalValue, length, onChange, onComplete, pattern])

  // Handle key events
  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    const currentValue = internalValue[index]

    switch (e.key) {
      case 'Backspace':
      case 'Delete':
        e.preventDefault()
        
        if (currentValue) {
          // Clear current field
          handleChange(index, '')
        } else if (index > 0) {
          // Focus previous field and clear it
          inputRefs.current[index - 1]?.focus()
          handleChange(index - 1, '')
        }
        break

      case 'ArrowLeft':
        e.preventDefault()
        if (index > 0) {
          inputRefs.current[index - 1]?.focus()
        }
        break

      case 'ArrowRight':
        e.preventDefault()
        if (index < length - 1) {
          inputRefs.current[index + 1]?.focus()
        }
        break

      case 'Home':
        e.preventDefault()
        inputRefs.current[0]?.focus()
        break

      case 'End':
        e.preventDefault()
        inputRefs.current[length - 1]?.focus()
        break

      case 'Enter':
        e.preventDefault()
        const stringValue = internalValue.join('')
        if (stringValue.length === length && onComplete) {
          onComplete(stringValue)
        }
        break

      case 'v':
      case 'V':
        if (e.ctrlKey || e.metaKey) {
          // Allow paste
          return
        }
        // Fall through to pattern check
        break

      default:
        // Allow pattern-matching characters
        if (e.key.length === 1 && !new RegExp(pattern).test(e.key)) {
          e.preventDefault()
        }
        break
    }
  }, [internalValue, length, handleChange, onComplete, pattern])

  // Handle paste
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    
    const pastedData = e.clipboardData.getData('text')
    const pastedChars = pastedData.split('').filter(char => new RegExp(pattern).test(char))
    
    if (pastedChars.length === 0) return
    
    // Fill from current position
    const newValues = [...internalValue]
    let filled = 0
    
    for (let i = 0; i < length && filled < pastedChars.length; i++) {
      if (!newValues[i]) {
        newValues[i] = pastedChars[filled]
        filled++
      }
    }
    
    setInternalValue(newValues)
    
    const stringValue = newValues.join('')
    if (onChange) {
      onChange(stringValue)
    }
    
    if (stringValue.length === length && onComplete) {
      onComplete(stringValue)
    }
  }, [internalValue, length, onChange, onComplete, pattern])

  // Handle focus
  const handleFocus = useCallback((index: number) => {
    setFocusedIndex(index)
    // Select all text when focusing
    inputRefs.current[index]?.select()
  }, [])

  const handleBlur = useCallback(() => {
    setFocusedIndex(-1)
  }, [])

  // Handle resend
  const handleResendClick = useCallback(() => {
    if (onResend && cooldown === 0) {
      onResend()
      setCooldown(resendCooldown)
    }
  }, [onResend, cooldown, resendCooldown])

  // Format cooldown time
  const formatCooldown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (mins > 0) {
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }
    return `${secs}s`
  }

  // ===========================================
  // Render
  // ===========================================

  return (
    <div className={`w-full ${className}`}>
      {/* OTP Input Fields */}
      <div 
        className={`flex justify-center gap-2 mb-4 ${containerClassName}`}
        role="group"
        aria-label="One-time password input"
      >
        {internalValue.map((value, index) => (
          <div key={index} className="relative">
            <input
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              pattern={pattern}
              autoComplete={autoComplete}
              maxLength={1}
              value={value}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              onFocus={() => handleFocus(index)}
              onBlur={handleBlur}
              disabled={disabled || isLoading}
              autoFocus={autoFocus && index === 0}
              placeholder={placeholder}
              className={`
                w-12 h-12 text-center text-lg font-semibold border-2 rounded-lg
                transition-all duration-200 ease-in-out
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                disabled:opacity-50 disabled:cursor-not-allowed
                ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
                ${focusedIndex === index ? 'ring-2 ring-blue-500 border-blue-500' : ''}
                ${inputClassName}
              `}
              aria-label={`OTP digit ${index + 1}`}
              aria-invalid={!!error}
              data-testid={`otp-input-${index}`}
            />
            
            {/* Loading indicator for individual input */}
            {isLoading && focusedIndex === index && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 text-sm text-red-600 text-center" role="alert">
          <span className="font-medium">Error:</span> {error}
        </div>
      )}

      {/* Resend Option */}
      {showResend && (
        <div className="text-center">
          <button
            type="button"
            onClick={handleResendClick}
            disabled={cooldown > 0 || disabled || isLoading}
            className={`
              text-sm font-medium transition-colors duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              ${cooldown > 0 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1'
              }
            `}
            aria-label={cooldown > 0 ? `Resend OTP in ${formatCooldown(cooldown)}` : 'Resend OTP'}
          >
            {cooldown > 0 ? (
              <>
                <span className="inline-flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Resend in {formatCooldown(cooldown)}
                </span>
              </>
            ) : (
              <>
                <span className="inline-flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Resend OTP
                </span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 text-center text-sm text-gray-600">
        Enter the {length}-digit code sent to your email
      </div>
    </div>
  )
}

// ===========================================
// Export Component
// ===========================================

export default OTPInput
