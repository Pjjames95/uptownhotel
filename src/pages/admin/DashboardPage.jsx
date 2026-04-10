import React from 'react'
import AdminLayout from '../../components/admin/layout/AdminLayout'
import DashboardHome from '../../components/admin/dashboard/DashboardHome'
import ProtectedRoute from '../../components/admin/auth/ProtectedRoute'

const DashboardPage = () => {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <DashboardHome />
      </AdminLayout>
    </ProtectedRoute>
  )
}

export default DashboardPage