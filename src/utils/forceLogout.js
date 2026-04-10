/**
 * Force Logout Utility
 * Bypasses all async operations and forces a complete logout
 */

export const forceLogout = () => {
  console.log('Force logout initiated...')
  
  // 1. Clear ALL storage immediately
  try {
    localStorage.clear()
    sessionStorage.clear()
    
    // Also clear specific Supabase items
    const supabaseKeys = [
      'supabase.auth.token',
      'supabase.auth.expires_at',
      'supabase.auth.refresh_token',
      'sb-' + window.location.hostname.split('.')[0] + '-auth-token',
    ]
    
    supabaseKeys.forEach(key => {
      localStorage.removeItem(key)
      sessionStorage.removeItem(key)
    })
    
    // Clear cookies
    document.cookie.split(';').forEach(cookie => {
      document.cookie = cookie
        .replace(/^ +/, '')
        .replace(/=.*/, `=; expires=${new Date(0).toUTCString()}; path=/`)
    })
    
    console.log('Storage cleared')
  } catch (e) {
    console.warn('Storage clear error:', e)
  }
  
  // 2. Force navigation with multiple methods
  console.log('Redirecting to home...')
  
  // Method 1: Replace state and navigate
  try {
    window.location.replace('/')
  } catch (e) {
    console.warn('Replace failed:', e)
  }
  
  // Method 2: Fallback - direct href assignment
  setTimeout(() => {
    window.location.href = '/'
  }, 50)
  
  // Method 3: Final fallback - reload
  setTimeout(() => {
    window.location.reload()
  }, 100)
}