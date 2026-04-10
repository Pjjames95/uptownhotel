import React from 'react'
import AdminLayout from '../../components/admin/layout/AdminLayout'
import EventsManager from '../../components/admin/tables/EventsManager'
import ProtectedRoute from '../../components/admin/auth/ProtectedRoute'

const EventsPage = () => {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <EventsManager />
      </AdminLayout>
    </ProtectedRoute>
  )
}

export default EventsPage