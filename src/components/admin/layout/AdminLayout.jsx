import React from 'react'
import AdminSidebar from './AdminSidebar'
import AdminNavbar from './AdminNavbar'
import { useAuth } from '../../../context/AuthContext'
import { Navigate } from 'react-router-dom'
import LoadingSpinner from '../../common/LoadingSpinner'

const AdminLayout = ({ children }) => {
  const { user, profile, loading, isAuthenticated } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  // Check if user has admin role
  const adminRoles = ['super_admin', 'hotel_manager', 'receptionist', 'restaurant_manager']
  if (profile && !adminRoles.includes(profile.role)) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout