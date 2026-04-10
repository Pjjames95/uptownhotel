import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { forceLogout } from '../../utils/forceLogout'
import toast from 'react-hot-toast'

const LogoutButton = ({ className = '', children = 'Logout', onLogout }) => {
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    if (loading) return
    
    setLoading(true)
    console.log('Logout initiated...')
    
    // Show loading toast
    const loadingToast = toast.loading('Logging out...')
    
    try {
      // Try Supabase signOut with a short timeout
      const signOutPromise = supabase.auth.signOut()
      const timeoutPromise = new Promise((resolve) => 
        setTimeout(() => resolve({ error: null }), 2000)
      )
      
      await Promise.race([signOutPromise, timeoutPromise])
      
      toast.dismiss(loadingToast)
      toast.success('Logged out successfully')
      
      // Call optional callback
      if (onLogout) {
        onLogout()
      }
      
      // Force logout regardless of Supabase response
      forceLogout()
    } catch (error) {
      console.warn('Logout warning:', error)
      toast.dismiss(loadingToast)
      
      // Still force logout
      forceLogout()
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={className}
    >
      {loading ? 'Logging out...' : children}
    </button>
  )
}

export default LogoutButton