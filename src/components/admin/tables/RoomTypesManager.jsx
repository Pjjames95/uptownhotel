import React, { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../context/AuthContext'
import { formatCurrency } from '../../../utils/currency'
import { ROOM_AMENITIES } from '../../../utils/constants'
import ImageUploader from '../../common/ImageUploader'
import toast from 'react-hot-toast'
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline'

const RoomTypesManager = () => {
  const { profile } = useAuth()
  const [roomTypes, setRoomTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingType, setEditingType] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    base_price: '',
    capacity: '1',
    description: '',
    amenities: [],
    images: [],
  })

  const canManage = profile?.role && ['super_admin', 'hotel_manager'].includes(profile.role)

  useEffect(() => {
    fetchRoomTypes()
  }, [])

  const fetchRoomTypes = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('room_types')
        .select('*')
        .order('name')

      if (error) throw error
      setRoomTypes(data || [])
    } catch (error) {
      toast.error('Failed to load room types')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!canManage) {
      toast.error('You do not have permission to manage room types')
      return
    }

    try {
      const typeData = {
        name: formData.name,
        code: formData.code.toUpperCase(),
        base_price: parseFloat(formData.base_price),
        capacity: parseInt(formData.capacity),
        description: formData.description,
        amenities: formData.amenities,
        images: formData.images,
        updated_at: new Date().toISOString(),
      }

      let result
      if (editingType) {
        result = await supabase
          .from('room_types')
          .update(typeData)
          .eq('id', editingType.id)
      } else {
        result = await supabase
          .from('room_types')
          .insert([{ ...typeData, created_at: new Date().toISOString() }])
      }

      const { error } = result
      if (error) {
        if (error.code === '23505') {
          toast.error('Room type name or code already exists')
        } else {
          throw error
        }
        return
      }

      toast.success(editingType ? 'Room type updated' : 'Room type created')
      resetForm()
      fetchRoomTypes()
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to save room type')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this room type? All associated rooms will be affected.')) return

    try {
      // Check if there are rooms using this type
      const { data: rooms } = await supabase
        .from('rooms')
        .select('id')
        .eq('room_type_id', id)
        .limit(1)

      if (rooms && rooms.length > 0) {
        toast.error('Cannot delete: This room type has existing rooms')
        return
      }

      const { error } = await supabase
        .from('room_types')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Room type deleted')
      fetchRoomTypes()
    } catch (error) {
      toast.error('Failed to delete room type')
    }
  }

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }

  const handleImageUpload = (imageUrl) => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, imageUrl]
    }))
    toast.success('Image added')
  }

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleEdit = (type) => {
    setEditingType(type)
    setFormData({
      name: type.name,
      code: type.code,
      base_price: type.base_price,
      capacity: type.capacity,
      description: type.description || '',
      amenities: type.amenities || [],
      images: type.images || [],
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      base_price: '',
      capacity: '1',
      description: '',
      amenities: [],
      images: [],
    })
    setEditingType(null)
    setShowForm(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <p className="mt-2 text-gray-600">Loading room types...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Room Types Management</h2>
          <p className="text-sm text-gray-600 mt-1">Manage room categories and their features</p>
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
            Add Room Type
          </button>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto py-8">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  {editingType ? 'Edit Room Type' : 'Add New Room Type'}
                </h3>
                <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Room Type Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Deluxe Single"
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Code *</label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    placeholder="e.g., DXS"
                    className="input"
                    maxLength="4"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Short code (max 4 characters)</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Base Price (KES) *</label>
                  <input
                    type="number"
                    name="base_price"
                    value={formData.base_price}
                    onChange={handleChange}
                    placeholder="e.g., 5000"
                    className="input"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Capacity (Guests) *</label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    placeholder="e.g., 2"
                    className="input"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the room type..."
                  className="input"
                  rows={3}
                />
              </div>

              {/* Images Section */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Room Images
                  <span className="text-gray-500 font-normal ml-2">(These images will be used for all rooms of this type)</span>
                </label>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {formData.images.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img}
                        alt={`Room type ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                        title="Remove image"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                          Primary
                        </span>
                      )}
                    </div>
                  ))}
                  
                  <ImageUploader
                    onUpload={handleImageUpload}
                    bucket="room-images"
                    folder="room-types"
                    existingImage={null}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  First image will be used as the primary/thumbnail image
                </p>
              </div>

              {/* Amenities */}
              <div>
                <label className="block text-sm font-medium mb-2">Amenities</label>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
                  {ROOM_AMENITIES.map(amenity => (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => handleAmenityToggle(amenity)}
                      className={`px-3 py-1 rounded-full text-sm transition ${
                        formData.amenities.includes(amenity)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {amenity}
                    </button>
                  ))}
                </div>
                {formData.amenities.length > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    Selected: {formData.amenities.length} amenit{formData.amenities.length !== 1 ? 'ies' : 'y'}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button type="submit" className="btn btn-primary flex-1">
                  {editingType ? 'Update Room Type' : 'Create Room Type'}
                </button>
                <button type="button" onClick={resetForm} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Room Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roomTypes.length === 0 ? (
          <div className="col-span-full text-center py-10 text-gray-600">
            <PhotoIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p>No room types found</p>
            {canManage && (
              <button onClick={() => setShowForm(true)} className="btn btn-primary mt-4">
                Add Your First Room Type
              </button>
            )}
          </div>
        ) : (
          roomTypes.map(type => (
            <div key={type.id} className="card hover:shadow-lg transition overflow-hidden">
              {/* Image Gallery */}
              {type.images && type.images.length > 0 ? (
                <div className="relative h-48 -mx-6 -mt-6 mb-4">
                  <img
                    src={type.images[0]}
                    alt={type.name}
                    className="w-full h-full object-cover"
                  />
                  {type.images.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                      +{type.images.length - 1} more
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-48 -mx-6 -mt-6 mb-4 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  <PhotoIcon className="w-12 h-12 text-gray-400" />
                </div>
              )}

              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-xl font-bold">{type.name}</h3>
                  <span className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">{type.code}</span>
                </div>
              </div>

              <p className="text-2xl font-bold text-blue-600 mt-2">
                {formatCurrency(type.base_price)}
                <span className="text-sm font-normal text-gray-500"> /night</span>
              </p>

              <p className="text-sm text-gray-600 mt-1">
                Capacity: {type.capacity} guest{type.capacity > 1 ? 's' : ''}
              </p>

              {type.description && (
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{type.description}</p>
              )}

              {/* Amenities Preview */}
              {type.amenities && type.amenities.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-1">Amenities:</p>
                  <div className="flex flex-wrap gap-1">
                    {type.amenities.slice(0, 3).map((amenity, i) => (
                      <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {amenity}
                      </span>
                    ))}
                    {type.amenities.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{type.amenities.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {canManage && (
                <div className="flex gap-3 mt-4 pt-3 border-t">
                  <button
                    onClick={() => handleEdit(type)}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                  >
                    <PencilIcon className="w-4 h-4" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(type.id)}
                    className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                  >
                    <TrashIcon className="w-4 h-4" /> Delete
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default RoomTypesManager