import React, { useState } from 'react'
import AdminLayout from '../../components/admin/layout/AdminLayout'
import RoomsManager from '../../components/admin/tables/RoomsManager'
import ProtectedRoute from '../../components/admin/auth/ProtectedRoute'

const RoomsPage = () => {
  return (
    <ProtectedRoute requiredRole="super_admin">
      <AdminLayout>
        <RoomsManager />
      </AdminLayout>
    </ProtectedRoute>
  )
}

export default RoomsPage