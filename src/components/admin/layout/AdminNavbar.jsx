import React from 'react'
import { useAuth } from '../../../context/AuthContext'
import { ArrowLeftOnRectangleIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import LogoutButton from '../../common/LogoutButton'

const AdminNavbar = () => {
  const { profile } = useAuth()

  return (
    <header className="bg-white shadow">
      <div className="px-6 py-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">
          Welcome, {profile?.full_name || 'Admin'}
        </h2>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <UserCircleIcon className="w-8 h-8 text-gray-600" />
            <span className="hidden md:inline text-gray-700">
              {profile?.full_name || 'Admin'}
            </span>
          </div>
          
          <LogoutButton className="flex items-center gap-2 text-red-600 hover:text-red-800 transition">
            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
            <span className="hidden md:inline">Logout</span>
          </LogoutButton>
        </div>
      </div>
    </header>
  )
}

export default AdminNavbar