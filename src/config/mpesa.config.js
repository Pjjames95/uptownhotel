/**
 * M-Pesa Configuration from Environment Variables
 * This keeps sensitive credentials out of the database
 */

const MPESA_CONFIG = {
  // Environment
  environment: import.meta.env.VITE_MPESA_ENVIRONMENT || 'sandbox',
  
  // API Credentials
  consumerKey: import.meta.env.VITE_MPESA_CONSUMER_KEY,
  consumerSecret: import.meta.env.VITE_MPESA_CONSUMER_SECRET,
  passkey: import.meta.env.VITE_MPESA_PASSKEY,
  
  // Business Codes
  shortcode: import.meta.env.VITE_MPESA_SHORTCODE || '174379',
  tillNumber: import.meta.env.VITE_MPESA_TILL_NUMBER || '174379',
  
  // Callback URL
  callbackUrl: import.meta.env.VITE_MPESA_CALLBACK_URL || 
    `${import.meta.env.VITE_SITE_URL}/api/mpesa/callback`,
  
  // URLs
  baseUrls: {
    sandbox: 'https://sandbox.safaricom.co.ke',
    production: 'https://api.safaricom.co.ke'
  },
  
  // Timeouts
  timeout: 30000, // 30 seconds
  pollingInterval: 2000, // 2 seconds
  maxPollingAttempts: 30 // 60 seconds max
}

// Validate required configuration
const validateConfig = () => {
  const required = ['consumerKey', 'consumerSecret', 'passkey']
  const missing = required.filter(key => !MPESA_CONFIG[key])
  
  if (missing.length > 0) {
    console.warn(`Missing M-Pesa configuration: ${missing.join(', ')}`)
    console.warn('M-Pesa payments will not work until configured.')
    return false
  }
  
  return true
}

// Get base URL based on environment
export const getMpesaBaseUrl = () => {
  const env = MPESA_CONFIG.environment
  return MPESA_CONFIG.baseUrls[env] || MPESA_CONFIG.baseUrls.sandbox
}

// Check if M-Pesa is configured
export const isMpesaConfigured = () => {
  return validateConfig()
}

export default MPESA_CONFIG