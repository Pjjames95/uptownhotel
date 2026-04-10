import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase credentials. Using demo mode.')
}

export const supabase = createClient(
  supabaseUrl || 'VITE_SUPABASE_URL',
  supabaseAnonKey || 'VITE_SUPABASE_ANON_KEY'
)

// Helper functions with error handling
export const signUp = async (email, password, fullName, phone = null) => {
  try {
    // Sign up the user
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

    // Note: With the trigger in place, the profile is created automatically
    // We don't need to manually insert it anymore
    
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
    console.log('Attempting to sign out...')
    
    // First, clear any local storage items
    Object.keys(localStorage).forEach(key => {
      if (key.includes('supabase') || key.includes('auth')) {
        localStorage.removeItem(key)
      }
    })
    
    // Sign out from Supabase with timeout
    const signOutPromise = supabase.auth.signOut()
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Sign out timeout')), 5000)
    )
    
    const { error } = await Promise.race([signOutPromise, timeoutPromise])
    
    if (error) {
      console.error('Supabase signOut error:', error)
      // Even if there's an error, we should still clear local state
    }
    
    console.log('Sign out successful')
    return { success: true }
  } catch (error) {
    console.error('Signout error:', error)
    // Even if there's an error, return success to allow UI to update
    return { success: true }
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
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching profile:', error)
    return null
  }
}