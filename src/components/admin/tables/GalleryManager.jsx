import React, { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../context/AuthContext'
import ImageUploader from '../../common/ImageUploader'
import toast from 'react-hot-toast'
import { PlusIcon, TrashIcon, XMarkIcon, PencilIcon } from '@heroicons/react/24/outline'

const GalleryManager = () => {
  const { profile } = useAuth()
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingImage, setEditingImage] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    category: 'general',
  })

  const categories = ['general', 'rooms', 'restaurant', 'events', 'amenities', 'exterior']

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
        .order('display_order')

      if (error) throw error
      setImages(data || [])
    } catch (error) {
      toast.error('Failed to load gallery')
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

    try {
      let result
      if (editingImage) {
        result = await supabase.from('gallery_images').update(formData).eq('id', editingImage.id)
      } else {
        result = await supabase.from('gallery_images').insert([formData])
      }

      const { error } = result
      if (error) throw error

      toast.success(editingImage ? 'Image updated' : 'Image added')
      resetForm()
      fetchImages()
    } catch (error) {
      toast.error('Failed to save')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this image?')) return
    try {
      await supabase.from('gallery_images').delete().eq('id', id)
      toast.success('Image deleted')
      fetchImages()
    } catch (error) {
      toast.error('Failed to delete')
    }
  }

  const resetForm = () => {
    setFormData({ title: '', description: '', image_url: '', category: 'general' })
    setEditingImage(null)
    setShowForm(false)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gallery Management</h2>
        {canManageGallery && (
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary flex items-center gap-2">
            {showForm ? <><XMarkIcon className="w-5 h-5" /> Cancel</> : <><PlusIcon className="w-5 h-5" /> Add Image</>}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-6 space-y-4">
          <ImageUploader 
            onUpload={(url) => setFormData({...formData, image_url: url})} 
            existingImage={formData.image_url}
            bucket="gallery-images" 
            folder="gallery" 
          />
          <input type="text" placeholder="Title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="input" required />
          <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="input" rows={2} />
          <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="input">
            {categories.map(cat => <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>)}
          </select>
          <div className="flex gap-3">
            <button type="submit" className="btn btn-primary">{editingImage ? 'Update' : 'Add'}</button>
            <button type="button" onClick={resetForm} className="btn btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map(img => (
          <div key={img.id} className="card p-3">
            <img src={img.image_url} alt={img.title} className="w-full h-40 object-cover rounded-lg mb-2" />
            <h4 className="font-semibold text-sm truncate">{img.title}</h4>
            <p className="text-xs text-gray-500 capitalize">{img.category}</p>
            {canManageGallery && (
              <button onClick={() => handleDelete(img.id)} className="mt-2 text-red-600 text-sm">
                <TrashIcon className="w-4 h-4 inline" /> Delete
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default GalleryManager