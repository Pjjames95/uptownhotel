import React from 'react'
import AdminLayout from '../../components/admin/layout/AdminLayout'
import TableReservationsManager from '../../components/admin/tables/TableReservationsManager'
import ProtectedRoute from '../../components/admin/auth/ProtectedRoute'

const TableReservationsPage = () => {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <TableReservationsManager />
      </AdminLayout>
    </ProtectedRoute>
  )
}

export default TableReservationsPage