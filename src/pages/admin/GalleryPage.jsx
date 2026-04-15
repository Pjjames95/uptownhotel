import React from 'react'
import AdminLayout from '../../components/admin/layout/AdminLayout'
import GalleryManager from '../../components/admin/tables/GalleryManager'
import ProtectedRoute from '../../components/admin/auth/ProtectedRoute'

const GalleryPage = () => {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <GalleryManager />
      </AdminLayout>
    </ProtectedRoute>
  )
}

export default GalleryPage