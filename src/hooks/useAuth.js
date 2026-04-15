import { useNavigate } from 'react-router-dom'
import { signIn, signUp, signOut } from '../lib/supabase'
import { useAuth as getAuthContext } from '../context/AuthContext'
import toast from 'react-hot-toast'

export const useAuthActions = () => {
  const navigate = useNavigate()
  const { user, profile } = getAuthContext()

  const login = async (email, password) => {
    try {
      console.log('📱 Login attempt:', email)

      const result = await signIn(email, password)

      if (result.success) {
        toast.success('Login successful!')

        // IMPORTANT: no timeout navigation
        navigate('/', { replace: true })

        return result
      }

      toast.error(result.error)
      return result

    } catch (err) {
      toast.error('Login failed')
      return { success: false }
    }
  }

  const register = async (email, password, fullName) => {
    try {
      const result = await signUp(email, password, fullName)
      if (result.success) {
        toast.success('Registration successful! Please check your email.')
        navigate('/login')
      } else {
        if (result.error?.includes('rate limit') || result.error?.includes('429')) {
          toast.error('Too many attempts. Please wait a few minutes.')
        } else if (result.error?.includes('already registered')) {
          toast.error('This email is already registered. Please login instead.')
        } else {
          toast.error(result.error || 'Registration failed')
        }
      }
      return result
    } catch (error) {
      toast.error('Registration failed')
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    console.log('Starting logout process...')
    
    try {
      // Show loading toast
      const loadingToast = toast.loading('Logging out...')
      
      // Call signOut
      const result = await signOut()
      
      // Dismiss loading toast
      toast.dismiss(loadingToast)
      
      if (result.success) {
        toast.success('Logged out successfully')
      }
      
      // Force navigation to home
      console.log('Navigating to home...')
      navigate('/', { replace: true })
      
      return result
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Logout completed with warnings')
      
      // Still navigate home even if there's an error
      navigate('/', { replace: true })
      
      return { success: true }
    }
  }

  return {
    login,
    register,
    logout,
    user,
    profile,
  }
}