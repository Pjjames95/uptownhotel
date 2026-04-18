import React, { useState, useEffect } from 'react'
import PublicLayout from '../../components/public/layout/PublicLayout'
import { supabase } from '../../lib/supabase'
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon, PhotoIcon } from '@heroicons/react/24/outline'

const GalleryPage = () => {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(null)
  const [filter, setFilter] = useState('all')

  const categories = [
    { id: 'all', label: 'All Photos' },
    { id: 'rooms', label: 'Rooms & Suites' },
    { id: 'restaurant', label: 'Restaurant' },
    { id: 'events', label: 'Events & Venues' },
    { id: 'amenities', label: 'Amenities' },
    { id: 'exterior', label: 'Exterior' },
    { id: 'general', label: 'General' },
  ]

  useEffect(() => {
    fetchGalleryImages()
  }, [])

  const fetchGalleryImages = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false })

      if (error) throw error
      setImages(data || [])
    } catch (error) {
      console.error('Error fetching gallery:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredImages = filter === 'all' 
    ? images 
    : images.filter(img => img.category === filter)

  const handlePrevImage = () => {
    const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id)
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : filteredImages.length - 1
    setSelectedImage(filteredImages[prevIndex])
  }

  const handleNextImage = () => {
    const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id)
    const nextIndex = currentIndex < filteredImages.length - 1 ? currentIndex + 1 : 0
    setSelectedImage(filteredImages[nextIndex])
  }

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative h-64 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="absolute inset-0 bg-black opacity-30" />
        <div className="relative h-full flex items-center justify-center text-white">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">Photo Gallery</h1>
            <p className="text-xl">Experience UptownHotel Through Our Lens</p>
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`px-6 py-2 rounded-full transition ${
                  filter === cat.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="text-center py-20">
              <PhotoIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 text-lg">No images in this category yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredImages.map(image => (
                <div
                  key={image.id}
                  className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition"
                  onClick={() => setSelectedImage(image)}
                >
                  <img
                    src={image.image_url}
                    alt={image.title}
                    className="w-full h-64 object-cover group-hover:scale-110 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition flex items-end">
                    <div className="p-4 w-full bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition">
                      <p className="text-white font-semibold">{image.title}</p>
                      {image.description && (
                        <p className="text-gray-300 text-sm">{image.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-50"
          >
            <XMarkIcon className="w-8 h-8" />
          </button>

          {filteredImages.length > 1 && (
            <button
              onClick={handlePrevImage}
              className="absolute left-4 text-white hover:text-gray-300"
            >
              <ChevronLeftIcon className="w-12 h-12" />
            </button>
          )}

          <img
            src={selectedImage.image_url}
            alt={selectedImage.title}
            className="max-w-5xl max-h-[80vh] object-contain"
          />

          {filteredImages.length > 1 && (
            <button
              onClick={handleNextImage}
              className="absolute right-4 text-white hover:text-gray-300"
            >
              <ChevronRightIcon className="w-12 h-12" />
            </button>
          )}

          <div className="absolute bottom-4 text-white text-center">
            <p className="text-lg font-semibold">{selectedImage.title}</p>
            {selectedImage.description && (
              <p className="text-sm text-gray-400">{selectedImage.description}</p>
            )}
            <p className="text-sm text-gray-400 mt-1">
              {filteredImages.findIndex(img => img.id === selectedImage.id) + 1} / {filteredImages.length}
            </p>
          </div>
        </div>
      )}
    </PublicLayout>
  )
}

export default GalleryPage
