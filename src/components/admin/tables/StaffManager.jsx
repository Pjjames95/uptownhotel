import React, { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { USER_ROLES } from '../../../utils/constants'
import StatusBadge from '../../common/StatusBadge'
import toast from 'react-hot-toast'

const StaffManager = () => {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    phone: '',
    role: 'receptionist',
    department: '',
  })

  const staffRoles = Object.entries(USER_ROLES).filter(([key]) => 
    !['guest', 'super_admin'].includes(key)
  )

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
    } catch (error) {
      toast.error('Failed to fetch staff')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      // Create auth user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: 'Staff@123', // Temporary password
      })

      if (signUpError) throw signUpError

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          role: formData.role,
          department: formData.department,
        })
        .eq('id', authData.user.id)

      if (profileError) throw profileError

      toast.success('Staff member added successfully')
      resetForm()
      fetchStaff()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleToggleActive = async (staffId, currentActive) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ active: !currentActive })
        .eq('id', staffId)

      if (error) throw error
      toast.success('Status updated')
      fetchStaff()
    } catch (error) {
      toast.error('Failed to update status')
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
    setShowForm(false)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Staff Management</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          {showForm ? 'Cancel' : 'Add Staff'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-6 space-y-4">
          <h3 className="text-lg font-semibold">Add New Staff Member</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Full Name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="input"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="tel"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="input"
            />
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
          </div>

          <input
            type="text"
            placeholder="Department"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            className="input"
          />

          <p className="text-sm text-gray-600">
            A temporary password will be sent to the staff member's email.
          </p>

          <button type="submit" className="btn btn-primary">
            Add Staff Member
          </button>
        </form>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Phone</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2 text-left">Department</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map(member => (
              <tr key={member.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2 font-medium">{member.full_name}</td>
                <td className="px-4 py-2">{member.email}</td>
                <td className="px-4 py-2">{member.phone || '-'}</td>
                <td className="px-4 py-2">
                  {USER_ROLES[member.role]?.label || member.role}
                </td>
                <td className="px-4 py-2">{member.department || '-'}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded text-sm ${
                    member.active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {member.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => handleToggleActive(member.id, member.active)}
                    className={`text-sm ${
                      member.active 
                        ? 'text-red-600 hover:text-red-800' 
                        : 'text-green-600 hover:text-green-800'
                    }`}
                  >
                    {member.active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!loading && staff.length === 0 && (
          <div className="text-center py-10 text-gray-600">
            No staff members found
          </div>
        )}
      </div>
    </div>
  )
}

export default StaffManager