import React, { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../context/AuthContext'
import { USER_ROLES } from '../../../utils/constants'
import toast from 'react-hot-toast'
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon, EyeIcon } from '@heroicons/react/24/outline'

const StaffManager = () => {
  const { profile } = useAuth()
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showPermissionsModal, setShowPermissionsModal] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [editingStaff, setEditingStaff] = useState(null)
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    phone: '',
    role: 'receptionist',
    department: '',
  })

  const isSuperAdmin = profile?.role === 'super_admin'

  useEffect(() => {
    fetchStaff()
  }, [])

  const fetchStaff = async () => {
    setLoading(true)
    try {
      console.log('Fetching staff...')
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('role', 'guest')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Fetch error:', error)
        throw error
      }
      
      console.log('Staff data:', data)
      setStaff(data || [])
    } catch (error) {
      console.error('Error fetching staff:', error)
      toast.error('Failed to fetch staff: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    console.log('Form submitted with data:', formData)
    
    if (!formData.full_name) {
      toast.error('Full name is required')
      return
    }

    if (!editingStaff && !formData.email) {
      toast.error('Email is required')
      return
    }

    setSubmitting(true)

    try {
      if (editingStaff) {
        // Update existing staff
        console.log('Updating staff:', editingStaff.id)
        
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: formData.full_name,
            phone: formData.phone || null,
            role: formData.role,
            department: formData.department || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingStaff.id)

        if (error) {
          console.error('Update error:', error)
          throw error
        }
        
        toast.success('Staff updated successfully')
        resetForm()
        fetchStaff()
      } else {
        // Create new staff - IMPORTANT: Include role in metadata
        console.log('Creating new staff with role:', formData.role)
        
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: 'Staff@123',
          options: {
            data: {
              full_name: formData.full_name,
              phone: formData.phone,
              role: formData.role,           // CRITICAL: Pass role in metadata
              department: formData.department, // CRITICAL: Pass department in metadata
            }
          }
        })

        if (signUpError) {
          console.error('Signup error:', signUpError)
          
          if (signUpError.message?.includes('already registered')) {
            toast.error('This email is already registered')
          } else if (signUpError.message?.includes('rate limit')) {
            toast.error('Too many attempts. Please wait a moment.')
          } else {
            throw signUpError
          }
          setSubmitting(false)
          return
        }

        console.log('Auth user created:', authData)
        
        if (authData.user) {
          // The trigger should have created the profile with the correct role
          // But let's verify and update if needed
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              role: formData.role,
              department: formData.department || null,
            })
            .eq('id', authData.user.id)

          if (profileError) {
            console.error('Profile update error:', profileError)
            // Don't throw - the trigger might have already set it
          }

          toast.success(`Staff added! Temporary password: Staff@123`)
          resetForm()
          fetchStaff()
        }
      }
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to save: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const fixExistingStaffRoles = async () => {
    try {
      // Fetch all guests
      const { data: guests, error } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .eq('role', 'guest')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error

      if (!guests || guests.length === 0) {
        toast.error('No guest users found')
        return
      }

      // Show list of guests and ask which to promote
      const guestList = guests.map((g, i) => `${i+1}. ${g.full_name} (${g.email})`).join('\n')
      const selectedIndex = prompt(`Select a guest to promote (enter number):\n\n${guestList}`)
      
      if (!selectedIndex) return
      
      const index = parseInt(selectedIndex) - 1
      if (index < 0 || index >= guests.length) {
        toast.error('Invalid selection')
        return
      }

      const selectedGuest = guests[index]
      const newRole = prompt('Enter new role (receptionist, hotel_manager, etc.):', 'receptionist')
      
      if (!newRole) return

      // Update the role
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          role: newRole,
          department: 'Promoted',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedGuest.id)

      if (updateError) throw updateError

      toast.success(`${selectedGuest.full_name} promoted to ${newRole}`)
      fetchStaff()
    } catch (error) {
      toast.error('Failed: ' + error.message)
    }
  }

  const handleEdit = (member) => {
    setEditingStaff(member)
    setFormData({
      email: member.email,
      full_name: member.full_name || '',
      phone: member.phone || '',
      role: member.role,
      department: member.department || '',
    })
    setShowForm(true)
  }

  const handleToggleActive = async (staffId, currentActive) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ active: !currentActive })
        .eq('id', staffId)

      if (error) throw error
      toast.success(`Staff ${!currentActive ? 'activated' : 'deactivated'}`)
      fetchStaff()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const handleDelete = async (staffId, staffEmail, staffName) => {
  // Prevent deleting own account
    if (staffId === profile?.id) {
      toast.error('You cannot delete your own account')
      return
    }
    
    // Prevent deleting the last super admin
    if (staffEmail === profile?.email && profile?.role === 'super_admin') {
      const superAdminCount = staff.filter(s => s.role === 'super_admin').length
      if (superAdminCount <= 1) {
        toast.error('Cannot delete the last super admin account')
        return
      }
    }
    
    if (!confirm(`Are you sure you want to delete ${staffName || 'this staff member'}?\n\nThis action cannot be undone. Their associated records (bookings, reservations, etc.) will be preserved.`)) {
      return
    }

    try {
      // First, check if there are any blocking references
      const { data: references, error: checkError } = await supabase
        .rpc('check_profile_references', { profile_id: staffId })

      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', staffId)

      if (error) {
        console.error('Delete error:', error)
        
        if (error.code === '23503') {
          toast.error('Cannot delete: This staff member has associated records. Try deactivating instead.')
        } else {
          toast.error('Failed to delete: ' + error.message)
        }
        return
      }
      
      toast.success('Staff member deleted successfully')
      fetchStaff()
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete staff member')
    }
  }

  const resetForm = () => {
    setFormData({
      email: '',
      full_name: '',
      phone: '',
      role: 'receptionist',
      department: '',
    })
    setEditingStaff(null)
    setShowForm(false)
    setSubmitting(false)
  }

  const staffRoles = Object.entries(USER_ROLES).filter(([key]) => 
    !['guest'].includes(key)
  )

  // DEBUG: Log current state
  console.log('StaffManager render - staff count:', staff.length, 'loading:', loading)

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Staff Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            {isSuperAdmin ? '✓ Super Admin - Full access' : 'View only mode'}
          </p>
        </div>
        
        {isSuperAdmin && (
          <button
            onClick={() => {
              resetForm()
              setShowForm(true)
            }}
            className="btn btn-primary flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Add Staff
          </button>
        )}

        {isSuperAdmin && (
          <button
            onClick={fixExistingStaffRoles}
            className="btn btn-primary flex items-center gap-2"
            title="Promote existing guest to staff"
          >
            <PlusIcon className="w-5 h-5" />
            Promote Guest
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && isSuperAdmin && (
        <form onSubmit={handleSubmit} className="card mb-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {editingStaff ? 'Edit Staff' : 'Add New Staff'}
            </h3>
            <button type="button" onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Full Name *"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="input"
              required
            />
            {!editingStaff && (
              <input
                type="email"
                placeholder="Email *"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input"
                required
              />
            )}
            {editingStaff && (
              <input
                type="email"
                value={formData.email}
                className="input bg-gray-100"
                disabled
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="tel"
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="input"
            />
            <input
              type="text"
              placeholder="Department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="input"
            />
          </div>

          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="input"
            required
          >
            {staffRoles.map(([key, value]) => (
              <option key={key} value={key}>{value.label}</option>
            ))}
          </select>

          {!editingStaff && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Temp password:</strong> Staff@123
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : (editingStaff ? 'Update' : 'Add Staff')}
            </button>
            <button type="button" onClick={resetForm} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Staff List */}
      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <p className="mt-2 text-gray-600">Loading staff...</p>
        </div>
      ) : staff.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-gray-600">No staff members found.</p>
          {isSuperAdmin && (
            <button onClick={() => setShowForm(true)} className="btn btn-primary mt-4">
              Add First Staff Member
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map(member => (
            <div key={member.id} className="card hover:shadow-lg transition">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {member.full_name?.charAt(0)?.toUpperCase() || 'S'}
                  </div>
                  <div>
                    <h3 className="font-semibold">{member.full_name}</h3>
                    <p className="text-xs text-gray-500">{member.email}</p>
                  </div>
                </div>
                <span className={`w-2 h-2 rounded-full ${member.active ? 'bg-green-500' : 'bg-red-500'}`} 
                  title={member.active ? 'Active' : 'Inactive'} />
              </div>
              
              <div className="space-y-1 mb-3 text-sm">
                <p className="text-gray-600">
                  <span className="font-medium">Role:</span>{' '}
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    member.role === 'super_admin' ? 'bg-purple-100 text-purple-800' :
                    member.role === 'hotel_manager' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {USER_ROLES[member.role]?.label || member.role}
                  </span>
                </p>
                {member.department && (
                  <p className="text-gray-600">
                    <span className="font-medium">Dept:</span> {member.department}
                  </p>
                )}
                {member.phone && (
                  <p className="text-gray-600">
                    <span className="font-medium">Phone:</span> {member.phone}
                  </p>
                )}
              </div>

              {isSuperAdmin && (
                <div className="flex gap-2 pt-3 border-t">
                  <button
                    onClick={() => handleEdit(member)}
                    className="flex-1 text-blue-600 hover:bg-blue-50 py-1 rounded text-sm"
                  >
                    <PencilIcon className="w-4 h-4 inline mr-1" /> Edit
                  </button>
                  <button
                    onClick={() => handleToggleActive(member.id, member.active)}
                    className={`flex-1 py-1 rounded text-sm ${
                      member.active 
                        ? 'text-orange-600 hover:bg-orange-50' 
                        : 'text-green-600 hover:bg-green-50'
                    }`}
                  >
                    {member.active ? 'Deactivate' : 'Activate'}
                  </button>
                  {member.role !== 'super_admin' && (
                    <button
                      onClick={() => handleDelete(member.id)}
                      className="flex-1 text-red-600 hover:bg-red-50 py-1 rounded text-sm"
                    >
                      <TrashIcon className="w-4 h-4 inline mr-1" /> Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default StaffManager