import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'

export const usePermissions = () => {
  const { profile } = useAuth()
  const [permissions, setPermissions] = useState(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile) {
      fetchUserPermissions()
    } else {
      setLoading(false)
    }
  }, [profile])

  const fetchUserPermissions = async () => {
    if (profile.role === 'super_admin') {
      // Super admin has all permissions
      const { data } = await supabase.from('permissions').select('name')
      setPermissions(new Set(data?.map(p => p.name) || []))
    } else {
      // Fetch role-specific permissions
      const { data } = await supabase
        .from('role_permissions')
        .select('permission:permissions(name)')
        .eq('role', profile.role)

      setPermissions(new Set(data?.map(d => d.permission.name) || []))
    }
    setLoading(false)
  }

  const hasPermission = (permission) => {
    if (profile?.role === 'super_admin') return true
    return permissions.has(permission)
  }

  const hasAnyPermission = (permissionList) => {
    return permissionList.some(p => hasPermission(p))
  }

  const hasAllPermissions = (permissionList) => {
    return permissionList.every(p => hasPermission(p))
  }

  return {
    permissions,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isSuperAdmin: profile?.role === 'super_admin',
    isHotelManager: profile?.role === 'hotel_manager',
    isReceptionist: profile?.role === 'receptionist',
    isRestaurantManager: profile?.role === 'restaurant_manager',
  }
}