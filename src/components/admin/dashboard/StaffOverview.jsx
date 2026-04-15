import React, { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { Link } from 'react-router-dom'
import { USER_ROLES } from '../../../utils/constants'
import { 
  UsersIcon, 
  UserGroupIcon,
  ShieldCheckIcon,
  ClockIcon 
} from '@heroicons/react/24/outline'

const StaffOverview = () => {
  const [staff, setStaff] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    byRole: {}
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStaff()
  }, [])

  const fetchStaff = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('role', 'guest')
        .order('full_name')

      if (error) throw error

      setStaff(data || [])
      
      // Calculate stats
      const active = data?.filter(s => s.active).length || 0
      const byRole = {}
      data?.forEach(s => {
        if (!byRole[s.role]) byRole[s.role] = 0
        byRole[s.role]++
      })

      setStats({
        total: data?.length || 0,
        active: active,
        inactive: (data?.length || 0) - active,
        byRole
      })
    } catch (error) {
      console.error('Error fetching staff:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRoleColor = (role) => {
    const colors = {
      super_admin: 'bg-purple-100 text-purple-800',
      hotel_manager: 'bg-blue-100 text-blue-800',
      receptionist: 'bg-green-100 text-green-800',
      restaurant_manager: 'bg-orange-100 text-orange-800',
      kitchen_staff: 'bg-yellow-100 text-yellow-800',
      housekeeping_staff: 'bg-teal-100 text-teal-800',
      maintenance_staff: 'bg-gray-100 text-gray-800',
    }
    return colors[role] || 'bg-gray-100 text-gray-800'
  }

  const getRoleIcon = (role) => {
    if (role === 'super_admin') return '👑'
    if (role === 'hotel_manager') return '🏨'
    if (role === 'receptionist') return '🛎️'
    if (role === 'restaurant_manager') return '🍽️'
    if (role === 'kitchen_staff') return '👨‍🍳'
    if (role === 'housekeeping_staff') return '🧹'
    return '👤'
  }

  if (loading) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Staff Overview</h3>
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <p className="mt-2 text-gray-600">Loading staff...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Staff Overview</h3>
        <Link 
          to="/admin/staff" 
          className="text-sm text-blue-600 hover:underline"
        >
          Manage Staff →
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Staff</p>
              <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
            </div>
            <UsersIcon className="w-8 h-8 text-blue-500 opacity-50" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-700">{stats.active}</p>
            </div>
            <ShieldCheckIcon className="w-8 h-8 text-green-500 opacity-50" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inactive</p>
              <p className="text-2xl font-bold text-red-700">{stats.inactive}</p>
            </div>
            <ClockIcon className="w-8 h-8 text-red-500 opacity-50" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Roles</p>
              <p className="text-2xl font-bold text-purple-700">{Object.keys(stats.byRole).length}</p>
            </div>
            <UserGroupIcon className="w-8 h-8 text-purple-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* Role Distribution */}
      {Object.keys(stats.byRole).length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Staff by Role</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Object.entries(stats.byRole).map(([role, count]) => (
              <div key={role} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                <span className="flex items-center gap-2">
                  <span>{getRoleIcon(role)}</span>
                  <span className="text-sm capitalize">{role.replace('_', ' ')}</span>
                </span>
                <span className="font-semibold text-gray-700">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Staff Members */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Staff Members</h4>
        {staff.length === 0 ? (
          <p className="text-center py-4 text-gray-500">No staff members found</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {staff.slice(0, 5).map(member => (
              <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {member.full_name?.charAt(0)?.toUpperCase() || 'S'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{member.full_name}</p>
                    <p className="text-xs text-gray-500">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                    {USER_ROLES[member.role]?.label || member.role}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${member.active ? 'bg-green-500' : 'bg-red-500'}`} title={member.active ? 'Active' : 'Inactive'} />
                </div>
              </div>
            ))}
          </div>
        )}
        
        {staff.length > 5 && (
          <Link 
            to="/admin/staff" 
            className="block text-center text-sm text-blue-600 hover:underline mt-3"
          >
            View all {staff.length} staff members →
          </Link>
        )}
      </div>
    </div>
  )
}

export default StaffOverview