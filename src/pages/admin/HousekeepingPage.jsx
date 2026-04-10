import React from 'react'
import AdminLayout from '../../components/admin/layout/AdminLayout'
import HousekeepingManager from '../../components/admin/tables/HousekeepingManager'
import ProtectedRoute from '../../components/admin/auth/ProtectedRoute'

const HousekeepingPage = () => {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <HousekeepingManager />
      </AdminLayout>
    </ProtectedRoute>
  )
}

export default HousekeepingPage