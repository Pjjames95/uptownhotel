import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  HomeIcon,
  BuildingLibraryIcon,
  CalendarIcon,
  ListBulletIcon,
  UsersIcon,
  ChartBarIcon,
  CogIcon,
} from '@heroicons/react/24/outline'

const AdminSidebar = () => {
  const location = useLocation()

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: HomeIcon },
    { name: 'Rooms', path: '/admin/rooms', icon: BuildingLibraryIcon },
    { name: 'Bookings', path: '/admin/bookings', icon: CalendarIcon },
    { name: 'Menu', path: '/admin/menu', icon: ListBulletIcon },
    { name: 'Events', path: '/admin/events', icon: CalendarIcon },
    { name: 'Staff', path: '/admin/staff', icon: UsersIcon },
    { name: 'Reports', path: '/admin/reports', icon: ChartBarIcon },
    { name: 'Settings', path: '/admin/settings', icon: CogIcon },
  ]

  return (
    <aside className="w-64 bg-gray-900 text-white">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold">Hotel Manager</h1>
      </div>

      <nav className="mt-6">
        {menuItems.map(item => {
          const Icon = item.icon
          const isActive = location.pathname === item.path

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center px-6 py-3 transition ${
                isActive
                  ? 'bg-blue-600 border-l-4 border-blue-600'
                  : 'hover:bg-gray-800'
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

export default AdminSidebar