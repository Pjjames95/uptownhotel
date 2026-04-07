import React from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useAuthActions } from '../../../hooks/useAuth'
import { ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline'

const AdminNavbar = () => {
  const { profile } = useAuth()
  const { logout } = useAuthActions()

  return (
    <header className="bg-white shadow">
      <div className="px-6 py-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          Welcome, {profile?.full_name}
        </h2>
        <button
          onClick={logout}
          className="flex items-center text-red-600 hover:text-red-800"
        >
          <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-2" />
          Logout
        </button>
      </div>
    </header>
  )
}

export default AdminNavbar