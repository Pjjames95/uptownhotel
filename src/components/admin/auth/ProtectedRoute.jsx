import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import LoadingSpinner from '../../common/LoadingSpinner'

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, profile, loading } = useAuth()

  // Show spinner while loading
  if (loading) {
    return <LoadingSpinner />
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Check role if required (for admin routes)
  if (requiredRole && profile?.role !== requiredRole) {
    // Super admin can access everything
    if (profile?.role === 'super_admin') {
      return children
    }
    return <Navigate to="/" replace />
  }

  // For guest routes (no requiredRole), just check authentication
  return children
}

export default ProtectedRoute