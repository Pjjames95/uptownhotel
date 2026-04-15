import React from 'react'
import { XMarkIcon, EnvelopeIcon, PhoneIcon, CalendarIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import { USER_ROLES } from '../../../utils/constants'
import { formatDateDisplay } from '../../../utils/dateUtils'

const StaffDetailsModal = ({ staff, onClose }) => {
  if (!staff) return null

  const getRoleColor = (role) => {
    const colors = {
      super_admin: 'bg-purple-100 text-purple-800',
      hotel_manager: 'bg-blue-100 text-blue-800',
      receptionist: 'bg-green-100 text-green-800',
      restaurant_manager: 'bg-orange-100 text-orange-800',
      kitchen_staff: 'bg-yellow-100 text-yellow-800',
      housekeeping_staff: 'bg-teal-100 text-teal-800',
    }
    return colors[role] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">Staff Details</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-semibold">
              {staff.full_name?.charAt(0)?.toUpperCase() || 'S'}
            </div>
            <div>
              <h4 className="text-xl font-semibold">{staff.full_name}</h4>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(staff.role)}`}>
                {USER_ROLES[staff.role]?.label || staff.role}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-gray-700">
              <EnvelopeIcon className="w-5 h-5 text-gray-400" />
              <span>{staff.email}</span>
            </div>
            
            {staff.phone && (
              <div className="flex items-center gap-3 text-gray-700">
                <PhoneIcon className="w-5 h-5 text-gray-400" />
                <span>{staff.phone}</span>
              </div>
            )}
            
            {staff.department && (
              <div className="flex items-center gap-3 text-gray-700">
                <ShieldCheckIcon className="w-5 h-5 text-gray-400" />
                <span>{staff.department}</span>
              </div>
            )}
            
            <div className="flex items-center gap-3 text-gray-700">
              <CalendarIcon className="w-5 h-5 text-gray-400" />
              <span>Joined {formatDateDisplay(staff.created_at)}</span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Status</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                staff.active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {staff.active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50">
          <button onClick={onClose} className="btn btn-primary w-full">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default StaffDetailsModal