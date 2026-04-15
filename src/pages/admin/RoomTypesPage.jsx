import React from 'react'
import AdminLayout from '../../components/admin/layout/AdminLayout'
import RoomTypesManager from '../../components/admin/tables/RoomTypesManager'
import ProtectedRoute from '../../components/admin/auth/ProtectedRoute'

const RoomTypesPage = () => {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <RoomTypesManager />
      </AdminLayout>
    </ProtectedRoute>
  )
}

export default RoomTypesPage