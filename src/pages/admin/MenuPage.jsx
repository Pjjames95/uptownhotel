import React from 'react'
import AdminLayout from '../../components/admin/layout/AdminLayout'
import MenuManager from '../../components/admin/tables/MenuManager'
import ProtectedRoute from '../../components/admin/auth/ProtectedRoute'

const MenuPage = () => {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="p-6">
          <MenuManager />
        </div>
      </AdminLayout>
    </ProtectedRoute>
  )
}

export default MenuPage