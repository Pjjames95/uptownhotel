import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase credentials. Using demo mode.')
}

// Create Supabase client with persistent session
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.localStorage,
    },
    // 🔑 Add these to prevent hanging queries
    db: {
      schema: 'public',
    },
    global: {
      headers: { 'x-application-name': 'hotelhub' },
    },
  }
)
// export const supabase = createClient(
//   supabaseUrl || 'https://placeholder.supabase.co',
//   supabaseAnonKey || 'placeholder-key',
//   {
//     auth: {
//       persistSession: true,      // KEY FIX: Persist session across reloads
//       autoRefreshToken: true,    // KEY FIX: Auto-refresh expired tokens
//       detectSessionInUrl: true,  // Handle OAuth redirects
//       storage: typeof window !== 'undefined' ? window.localStorage : null, // Store session in localStorage
//     }
//   }
// )

// Helper functions with error handling
export const signUp = async (email, password, fullName, phone = null) => {
  try {
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone,
        }
      }
    })

    if (signUpError) throw signUpError

    return { success: true, user: authData.user }
  } catch (error) {
    console.error('Signup error:', error)
    return { success: false, error: error.message }
  }
}

export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    return { success: true, user: data.user, session: data.session }
  } catch (error) {
    console.error('Signin error:', error)
    return { success: false, error: error.message }
  }
}

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    
    // Clear local storage on logout
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sb-auth-token')
      localStorage.removeItem('sb-session')
    }
    
    return { success: true }
  } catch (error) {
    console.error('Signout error:', error)
    return { success: false, error: error.message }
  }
}

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      if (error.message !== 'Auth session missing!') {
        console.error('Error getting current user:', error)
      }
      return null
    }
    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching profile:', error)
    return null
  }
}

// Refresh session manually if needed
export const refreshSession = async () => {
  try {
    const { data, error } = await supabase.auth.refreshSession()
    if (error) throw error
    return { success: true, session: data.session }
  } catch (error) {
    console.error('Refresh session error:', error)
    return { success: false, error: error.message }
  }
}