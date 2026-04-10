import React, { useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { PhotoIcon, XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const ImageUploader = ({ 
  onUpload, 
  existingImage = null, 
  bucket = 'menu-images',
  folder = 'items',
  className = '' 
}) => {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(existingImage)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef(null)

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a valid image (JPEG, PNG, or WebP)')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    setUploading(true)
    setProgress(0)

    try {
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target.result)
      reader.readAsDataURL(file)

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (error) throw error

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName)

      setProgress(100)
      toast.success('Image uploaded successfully')
      onUpload(publicUrl)
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload image: ' + error.message)
      setPreview(existingImage)
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onUpload(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {preview ? (
        <div className="relative group">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 bg-white rounded-full mr-2 hover:bg-gray-100"
              title="Change image"
            >
              <ArrowPathIcon className="w-5 h-5 text-gray-700" />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 bg-red-600 rounded-full hover:bg-red-700"
              title="Remove image"
            >
              <XMarkIcon className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition ${
            uploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <PhotoIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">
            {uploading ? 'Uploading...' : 'Click to upload image'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            JPEG, PNG, WebP up to 5MB
          </p>
          
          {uploading && progress > 0 && (
            <div className="mt-4">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-1">{progress}%</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ImageUploader