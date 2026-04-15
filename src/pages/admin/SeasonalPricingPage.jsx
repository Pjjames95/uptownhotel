import React, { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/layout/AdminLayout'
import ProtectedRoute from '../../components/admin/auth/ProtectedRoute'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { formatCurrency } from '../../utils/currency'
import { formatDateDisplay } from '../../utils/dateUtils'
import toast from 'react-hot-toast'
import { PlusIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline'

const SeasonalPricingPage = () => {
  const { profile } = useAuth()
  const [pricing, setPricing] = useState([])
  const [roomTypes, setRoomTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    room_type_id: '',
    price: '',
    start_date: '',
    end_date: '',
    is_active: true,
  })

  const canManage = profile?.role && ['super_admin', 'hotel_manager'].includes(profile.role)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [pricingData, typesData] = await Promise.all([
        supabase.from('room_type_pricing').select('*, room_type:room_types(name, base_price)').order('start_date', { ascending: false }),
        supabase.from('room_types').select('id, name, base_price').eq('is_active', true).order('name')
      ])

      if (pricingData.error) throw pricingData.error
      if (typesData.error) throw typesData.error

      setPricing(pricingData.data || [])
      setRoomTypes(typesData.data || [])
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const { error } = await supabase
        .from('room_type_pricing')
        .insert([{
          ...formData,
          price: parseFloat(formData.price),
        }])

      if (error) throw error

      toast.success('Seasonal price added')
      resetForm()
      fetchData()
    } catch (error) {
      toast.error('Failed to add pricing')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this seasonal price?')) return

    try {
      const { error } = await supabase
        .from('room_type_pricing')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Pricing deleted')
      fetchData()
    } catch (error) {
      toast.error('Failed to delete')
    }
  }

  const resetForm = () => {
    setFormData({
      room_type_id: '',
      price: '',
      start_date: '',
      end_date: '',
      is_active: true,
    })
    setShowForm(false)
  }

  const getSelectedRoomType = () => {
    return roomTypes.find(t => t.id === formData.room_type_id)
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
            <h1 className="text-3xl font-bold text-gray-900">Seasonal Pricing</h1>
            <p className="text-gray-600 mt-1">Set special rates for specific date ranges</p>
          </div>
          {canManage && (
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Add Seasonal Price
            </button>
          )}
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Add Seasonal Pricing</h3>
                <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Room Type *</label>
                  <select
                    value={formData.room_type_id}
                    onChange={(e) => setFormData({...formData, room_type_id: e.target.value})}
                    className="input"
                    required
                  >
                    <option value="">Select Room Type</option>
                    {roomTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name} (Base: {formatCurrency(type.base_price)})
                      </option>
                    ))}
                  </select>
                </div>
                
                {getSelectedRoomType() && (
                  <div className="bg-blue-50 p-3 rounded text-sm">
                    Base price: {formatCurrency(getSelectedRoomType().base_price)}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1">Seasonal Price (KES) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="input"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Date *</label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Date *</label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                      className="input"
                      min={formData.start_date}
                      required
                    />
                  </div>
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
                    Add Pricing
                  </button>
                  <button type="button" onClick={resetForm} className="btn btn-secondary flex-1">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Pricing Table */}
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Base Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seasonal Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pricing.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{item.room_type?.name}</td>
                  <td className="px-4 py-3">{formatCurrency(item.room_type?.base_price)}</td>
                  <td className="px-4 py-3 font-semibold text-green-600">{formatCurrency(item.price)}</td>
                  <td className="px-4 py-3">{formatDateDisplay(item.start_date)}</td>
                  <td className="px-4 py-3">{formatDateDisplay(item.end_date)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${item.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {item.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {canManage && (
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {pricing.length === 0 && (
            <div className="text-center py-10 text-gray-600">
              <p>No seasonal pricing set</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

export default SeasonalPricingPage