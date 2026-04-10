import React from 'react'
import AdminLayout from '../../components/admin/layout/AdminLayout'
import StaffManager from '../../components/admin/tables/StaffManager'
import ProtectedRoute from '../../components/admin/auth/ProtectedRoute'

const StaffPage = () => {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <StaffManager />
      </AdminLayout>
    </ProtectedRoute>
  )
}

export default StaffPage