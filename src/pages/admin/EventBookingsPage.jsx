import React from 'react'
import AdminLayout from '../../components/admin/layout/AdminLayout'
import EventBookingsManager from '../../components/admin/tables/EventBookingsManager'
import ProtectedRoute from '../../components/admin/auth/ProtectedRoute'

const EventBookingsPage = () => {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <EventBookingsManager />
      </AdminLayout>
    </ProtectedRoute>
  )
}

export default EventBookingsPage