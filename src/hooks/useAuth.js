import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { signIn, signUp, signOut } from '../lib/supabase'
import { useAuth as getAuthContext } from '../context/AuthContext'
import toast from 'react-hot-toast'

export const useAuthActions = () => {
  const navigate = useNavigate()
  const { user, profile } = getAuthContext()

  const login = async (email, password) => {
    try {
      const result = await signIn(email, password)
      if (result.success) {
        toast.success('Login successful!')
        // Navigate based on role
        if (result.user.role === 'guest') {
          navigate('/guest/dashboard')
        } else {
          navigate('/admin/dashboard')
        }
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('Login failed')
    }
  }

  const register = async (email, password, fullName) => {
    try {
      const result = await signUp(email, password, fullName)
      if (result.success) {
        toast.success('Registration successful! Please check your email.')
        navigate('/login')
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('Registration failed')
    }
  }

  const logout = async () => {
    try {
      const result = await signOut()
      if (result.success) {
        toast.success('Logged out successfully')
        navigate('/')
      }
    } catch (error) {
      toast.error('Logout failed')
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