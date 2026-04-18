import React, { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../context/AuthContext'
import ImageUploader from '../../common/ImageUploader'
import toast from 'react-hot-toast'
import { PlusIcon, TrashIcon, XMarkIcon, PencilIcon, PhotoIcon } from '@heroicons/react/24/outline'

const GalleryManager = () => {
  const { profile } = useAuth()
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingImage, setEditingImage] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    category: 'general',
    is_active: true,
    display_order: 0,
  })

  const categories = [
    { id: 'general', label: 'General' },
    { id: 'rooms', label: 'Rooms & Suites' },
    { id: 'restaurant', label: 'Restaurant' },
    { id: 'events', label: 'Events & Venues' },
    { id: 'amenities', label: 'Amenities' },
    { id: 'exterior', label: 'Exterior' },
  ]

  const canManageGallery = profile?.role && 
    ['super_admin', 'hotel_manager'].includes(profile.role)

  useEffect(() => {
    fetchImages()
  }, [])

  const fetchImages = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false })

      if (error) throw error
      setImages(data || [])
    } catch (error) {
      console.error('Error fetching gallery:', error)
      toast.error('Failed to load gallery images')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!canManageGallery) {
      toast.error('Permission denied')
      return
    }

    if (!formData.image_url) {
      toast.error('Please upload an image')
      return
    }

    setSubmitting(true)

    try {
      const imageData = {
        ...formData,
        display_order: parseInt(formData.display_order) || 0,
        created_by: profile?.id,
        updated_at: new Date().toISOString(),
      }

      let result
      if (editingImage) {
        result = await supabase
          .from('gallery_images')
          .update(imageData)
          .eq('id', editingImage.id)
          .select()
      } else {
        result = await supabase
          .from('gallery_images')
          .insert([{ ...imageData, created_at: new Date().toISOString() }])
          .select()
      }

      const { error } = result
      if (error) throw error

      toast.success(editingImage ? 'Image updated' : 'Image added to gallery')
      resetForm()
      fetchImages()
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to save image')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (image) => {
    setEditingImage(image)
    setFormData({
      title: image.title || '',
      description: image.description || '',
      image_url: image.image_url || '',
      category: image.category || 'general',
      is_active: image.is_active ?? true,
      display_order: image.display_order || 0,
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this image?')) return

    try {
      const { error } = await supabase
        .from('gallery_images')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Image deleted')
      fetchImages()
    } catch (error) {
      toast.error('Failed to delete image')
    }
  }

  const handleToggleActive = async (id, currentActive) => {
    try {
      const { error } = await supabase
        .from('gallery_images')
        .update({ is_active: !currentActive, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      toast.success(`Image ${!currentActive ? 'activated' : 'deactivated'}`)
      fetchImages()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image_url: '',
      category: 'general',
      is_active: true,
      display_order: 0,
    })
    setEditingImage(null)
    setShowForm(false)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <p className="mt-2 text-gray-600">Loading gallery...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Gallery Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            {canManageGallery ? '✓ You can manage gallery images' : '👁️ View only mode'}
          </p>
        </div>
        {canManageGallery && (
          <button
            onClick={() => {
              resetForm()
              setShowForm(true)
            }}
            className="btn btn-primary flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Add Image
          </button>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  {editingImage ? 'Edit Image' : 'Add New Image'}
                </h3>
                <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Image *</label>
                <ImageUploader
                  onUpload={(url) => setFormData({ ...formData, image_url: url })}
                  existingImage={formData.image_url}
                  bucket="gallery-images"
                  folder="gallery"
                />
                {!formData.image_url && (
                  <p className="text-xs text-red-600 mt-1">Please upload an image</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Hotel Lobby"
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Brief description of the image..."
                  className="input"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="input"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Display Order</label>
                  <input
                    type="number"
                    name="display_order"
                    value={formData.display_order}
                    onChange={handleChange}
                    className="input"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm">Active (visible on website)</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting || !formData.image_url}
                  className="btn btn-primary flex-1 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : (editingImage ? 'Update' : 'Add Image')}
                </button>
                <button type="button" onClick={resetForm} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gallery Grid */}
      {images.length === 0 ? (
        <div className="card text-center py-10">
          <PhotoIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600">No gallery images found</p>
          {canManageGallery && (
            <button onClick={() => setShowForm(true)} className="btn btn-primary mt-4">
              Add Your First Image
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map(img => (
            <div key={img.id} className={`card p-3 relative ${!img.is_active ? 'opacity-60' : ''}`}>
              <img
                src={img.image_url}
                alt={img.title}
                className="w-full h-40 object-cover rounded-lg mb-2"
              />
              <h4 className="font-semibold text-sm truncate">{img.title}</h4>
              <p className="text-xs text-gray-500 capitalize">{img.category}</p>
              
              {!img.is_active && (
                <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                  Inactive
                </span>
              )}

              {canManageGallery && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleEdit(img)}
                    className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
                  >
                    <PencilIcon className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={() => handleToggleActive(img.id, img.is_active)}
                    className={`text-xs ${img.is_active ? 'text-orange-600' : 'text-green-600'}`}
                  >
                    {img.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDelete(img.id)}
                    className="text-red-600 hover:text-red-800 text-xs flex items-center gap-1"
                  >
                    <TrashIcon className="w-3 h-3" /> Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default GalleryManager
