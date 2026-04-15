import React, { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/layout/AdminLayout'
import ProtectedRoute from '../../components/admin/auth/ProtectedRoute'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline'

const FloorsPage = () => {
  const { profile } = useAuth()
  const [floors, setFloors] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingFloor, setEditingFloor] = useState(null)
  const [formData, setFormData] = useState({
    floor_number: '',
    name: '',
    description: '',
    is_active: true,
  })

  const canManage = profile?.role && ['super_admin', 'hotel_manager'].includes(profile.role)

  useEffect(() => {
    fetchFloors()
  }, [])

  const fetchFloors = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('floors')
        .select('*')
        .order('floor_number')

      if (error) throw error
      setFloors(data || [])
    } catch (error) {
      toast.error('Failed to load floors')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const floorData = {
        floor_number: parseInt(formData.floor_number),
        name: formData.name,
        description: formData.description,
        is_active: formData.is_active,
      }

      let result
      if (editingFloor) {
        result = await supabase
          .from('floors')
          .update(floorData)
          .eq('id', editingFloor.id)
      } else {
        result = await supabase
          .from('floors')
          .insert([floorData])
      }

      const { error } = result
      if (error) {
        if (error.code === '23505') {
          toast.error('Floor number already exists')
        } else {
          throw error
        }
        return
      }

      toast.success(editingFloor ? 'Floor updated' : 'Floor created')
      resetForm()
      fetchFloors()
    } catch (error) {
      toast.error('Failed to save floor')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this floor? Rooms on this floor will be affected.')) return

    try {
      const { error } = await supabase
        .from('floors')
        .delete()
        .eq('id', id)

      if (error) {
        if (error.code === '23503') {
          toast.error('Cannot delete floor with existing rooms')
        } else {
          throw error
        }
        return
      }
      toast.success('Floor deleted')
      fetchFloors()
    } catch (error) {
      toast.error('Failed to delete floor')
    }
  }

  const handleToggleActive = async (id, currentActive) => {
    try {
      const { error } = await supabase
        .from('floors')
        .update({ is_active: !currentActive })
        .eq('id', id)

      if (error) throw error
      toast.success(`Floor ${!currentActive ? 'activated' : 'deactivated'}`)
      fetchFloors()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const resetForm = () => {
    setFormData({
      floor_number: '',
      name: '',
      description: '',
      is_active: true,
    })
    setEditingFloor(null)
    setShowForm(false)
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Floors Management</h1>
            <p className="text-gray-600 mt-1">Manage hotel floors</p>
          </div>
          {canManage && (
            <button
              onClick={() => {
                resetForm()
                setShowForm(true)
              }}
              className="btn btn-primary flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Add Floor
            </button>
          )}
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {editingFloor ? 'Edit Floor' : 'Add New Floor'}
                </h3>
                <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Floor Number *</label>
                  <input
                    type="number"
                    value={formData.floor_number}
                    onChange={(e) => setFormData({...formData, floor_number: e.target.value})}
                    className="input"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Floor Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="input"
                    placeholder="e.g., Ground Floor"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="input"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm">Active</span>
                  </label>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="btn btn-primary flex-1">
                    {editingFloor ? 'Update' : 'Create'}
                  </button>
                  <button type="button" onClick={resetForm} className="btn btn-secondary flex-1">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Floors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {floors.map(floor => (
            <div key={floor.id} className="card hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-xl font-bold">Floor {floor.floor_number}</h3>
                  <p className="text-gray-600">{floor.name}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${floor.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {floor.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              {floor.description && (
                <p className="text-sm text-gray-600 mb-3">{floor.description}</p>
              )}

              {canManage && (
                <div className="flex gap-2 mt-4 pt-3 border-t">
                  <button
                    onClick={() => {
                      setEditingFloor(floor)
                      setFormData(floor)
                      setShowForm(true)
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                  >
                    <PencilIcon className="w-4 h-4" /> Edit
                  </button>
                  <button
                    onClick={() => handleToggleActive(floor.id, floor.is_active)}
                    className={`text-sm flex items-center gap-1 ${floor.is_active ? 'text-orange-600' : 'text-green-600'}`}
                  >
                    {floor.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDelete(floor.id)}
                    className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                  >
                    <TrashIcon className="w-4 h-4" /> Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {floors.length === 0 && (
          <div className="card text-center py-10">
            <p className="text-gray-600">No floors found</p>
            {canManage && (
              <button onClick={() => setShowForm(true)} className="btn btn-primary mt-4">
                Add First Floor
              </button>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default FloorsPage