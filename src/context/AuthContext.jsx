import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  // ✅ FIX 1: ADD profile loading lock (IMPORTANT)
  const [profileLoading, setProfileLoading] = useState(false)

  // ===============================
  // 1. FAST SESSION RESTORE (NO BLOCKING)
  // ===============================
  useEffect(() => {
    let mounted = true

    const initSession = async () => {
      try {
        console.log('🔄 Initializing auth...')

        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Session error:', error)
        }

        if (mounted) {
          setUser(session?.user || null)
          setLoading(false)
          setInitialized(true)
        }
      } catch (err) {
        console.error('Auth init error:', err)

        if (mounted) {
          setUser(null)
          setLoading(false)
          setInitialized(true)
        }
      }
    }

    initSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log('🔔 Auth state changed:', _event)

        setUser(session?.user || null)

        if (!session?.user) {
          setProfile(null)
        }
      }
    )

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [])

  // ===============================
  // 2. BACKGROUND PROFILE LOADING
  // ===============================
  useEffect(() => {
    if (!user) return

    let mounted = true

    const loadProfile = async () => {
      try {
        console.log('🔍 Loading profile for:', user.email)

        // ✅ FIX 2: mark profile loading
        setProfileLoading(true)

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) {
          console.warn('Profile fetch error:', error)

          // ❌ FIX 3: DO NOT overwrite with "guest" immediately
          // Only clear profile instead of guessing role
          if (mounted) {
            setProfile(null)
          }

          return
        }

        if (mounted) {
          console.log('✅ Profile loaded:', data.full_name)
          setProfile(data)
        }

      } catch (err) {
        console.error('Profile load failed:', err)

        // ❌ FIX 4: remove fallback role override
        if (mounted) {
          setProfile(null)
        }

      } finally {
        if (mounted) {
          setProfileLoading(false)
        }
      }
    }

    loadProfile()

    return () => {
      mounted = false
    }
  }, [user])

  // ===============================
  // CONTEXT VALUE
  // ===============================
  const value = {
    user,
    profile,
    loading,
    initialized,
    profileLoading, // ✅ FIX 5: expose it
    isAuthenticated: !!user,
  }

  // ===============================
  // UI BLOCK (ONLY FOR FIRST LOAD)
  // ===============================
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading UptownHotel...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// ===============================
// HOOK
// ===============================
export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}