import React from 'react'
import AdminLayout from '../../components/admin/layout/AdminLayout'
import ContactMessagesManager from '../../components/admin/tables/ContactMessagesManager'
import ProtectedRoute from '../../components/admin/auth/ProtectedRoute'

const ContactMessagesPage = () => {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <ContactMessagesManager />
      </AdminLayout>
    </ProtectedRoute>
  )
}

export default ContactMessagesPage