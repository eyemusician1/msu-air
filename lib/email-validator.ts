// lib/email-validator.ts

/**
 * List of valid email domains
 * Add or remove domains as needed
 */
const VALID_EMAIL_DOMAINS = [
  // Popular providers
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'icloud.com',
  'protonmail.com',
  'zoho.com',
  'aol.com',
  'mail.com',
  'yandex.com',
  
  // Microsoft domains
  'live.com',
  'msn.com',
  'me.com',
  'mac.com',
  
  // Educational
  'edu',
  'ac.uk',
  'edu.ph',
]

/**
 * List of known disposable/temporary email domains to block
 */
const BLOCKED_DISPOSABLE_DOMAINS = [
  'tempmail.com',
  'guerrillamail.com',
  'mailinator.com',
  '10minutemail.com',
  'throwaway.email',
  'temp-mail.org',
  'fakeinbox.com',
  'trashmail.com',
  'getnada.com',
  'maildrop.cc',
  'yopmail.com',
  'sharklasers.com',
  'guerrillamail.info',
  'grr.la',
  'spam4.me',
  'tempinbox.com',
]

/**
 * Validates email format and domain
 */
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  // Basic format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!email) {
    return { isValid: false, error: 'Email is required' }
  }
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' }
  }
  
  // Extract domain
  const domain = email.toLowerCase().split('@')[1]
  
  if (!domain) {
    return { isValid: false, error: 'Invalid email format' }
  }
  
  // Check if domain is in blocked list
  if (BLOCKED_DISPOSABLE_DOMAINS.includes(domain)) {
    return { 
      isValid: false, 
      error: 'Temporary or disposable email addresses are not allowed. Please use a valid email provider.' 
    }
  }
  
  // Check if domain is in allowed list or is an educational domain
  const isValidDomain = VALID_EMAIL_DOMAINS.some(validDomain => {
    // Exact match
    if (domain === validDomain) return true
    
    // Educational domain pattern (e.g., anything.edu, anything.ac.uk)
    if (validDomain === 'edu' && domain.endsWith('.edu')) return true
    if (validDomain === 'ac.uk' && domain.endsWith('.ac.uk')) return true
    if (validDomain === 'edu.ph' && domain.endsWith('.edu.ph')) return true
    
    return false
  })
  
  if (!isValidDomain) {
    return { 
      isValid: false, 
      error: `Only emails from recognized providers are accepted. "${domain}" is not supported.` 
    }
  }
  
  return { isValid: true }
}

/**
 * Get the email domain from an email address
 */
export function getEmailDomain(email: string): string {
  return email.toLowerCase().split('@')[1] || ''
}
