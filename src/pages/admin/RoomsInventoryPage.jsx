import React, { useState } from 'react'
import AdminLayout from '../../components/admin/layout/AdminLayout'
import RoomsInventoryManager from '../../components/admin/tables/RoomsInventoryManager'
import BulkRoomGenerator from '../../components/admin/tables/BulkRoomGenerator'
import ProtectedRoute from '../../components/admin/auth/ProtectedRoute'
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'

const RoomsInventoryPage = () => {
  const [showGenerator, setShowGenerator] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleComplete = () => {
    setShowGenerator(false)
    setRefreshKey(prev => prev + 1)
  }

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Rooms Inventory</h1>
              <p className="text-gray-600 mt-1">Manage individual rooms across all floors</p>
            </div>
            <button
              onClick={() => setShowGenerator(!showGenerator)}
              className="btn btn-primary flex items-center gap-2"
            >
              {showGenerator ? (
                <>
                  <XMarkIcon className="w-5 h-5" />
                  Close Generator
                </>
              ) : (
                <>
                  <PlusIcon className="w-5 h-5" />
                  Generate Rooms
                </>
              )}
            </button>
          </div>

          {showGenerator && (
            <div className="mb-8">
              <BulkRoomGenerator onComplete={handleComplete} />
            </div>
          )}

          <RoomsInventoryManager key={refreshKey} />
        </div>
      </AdminLayout>
    </ProtectedRoute>
  )
}

export default RoomsInventoryPage