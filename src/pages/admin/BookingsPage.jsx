import React from 'react'
import AdminLayout from '../../components/admin/layout/AdminLayout'
import BookingsManager from '../../components/admin/tables/BookingsManager'
import ProtectedRoute from '../../components/admin/auth/ProtectedRoute'

const BookingsPage = () => {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="p-6">
          <BookingsManager />
        </div>
      </AdminLayout>
    </ProtectedRoute>
  )
}

export default BookingsPage