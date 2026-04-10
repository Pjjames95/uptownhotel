import React, { useState, useEffect } from 'react'
import PublicLayout from '../../components/public/layout/PublicLayout'
import { supabase } from '../../lib/supabase'
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

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
  ]

  useEffect(() => {
    fetchGalleryImages()
  }, [])

  const fetchGalleryImages = async () => {
    setLoading(true)
    try {
      // In production, you'd have a gallery_images table
      // For demo, we'll use placeholder data
      const demoImages = [
        { id: 1, url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', category: 'rooms', title: 'Deluxe Suite' },
        { id: 2, url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800', category: 'rooms', title: 'Presidential Suite' },
        { id: 3, url: 'https://images.unsplash.com/photo-1591088398332-8a7791972801?w=800', category: 'restaurant', title: 'Main Dining Room' },
        { id: 4, url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800', category: 'restaurant', title: 'Private Dining' },
        { id: 5, url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800', category: 'events', title: 'Conference Hall' },
        { id: 6, url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800', category: 'events', title: 'Wedding Venue' },
        { id: 7, url: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=800', category: 'amenities', title: 'Swimming Pool' },
        { id: 8, url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800', category: 'amenities', title: 'Spa & Wellness' },
        { id: 9, url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800', category: 'exterior', title: 'Hotel Entrance' },
        { id: 10, url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', category: 'exterior', title: 'Garden View' },
      ]
      setImages(demoImages)
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
            <p className="text-xl">Experience HotelHub Through Our Lens</p>
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredImages.map(image => (
                <div
                  key={image.id}
                  className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition"
                  onClick={() => setSelectedImage(image)}
                >
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-64 object-cover group-hover:scale-110 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition flex items-end">
                    <div className="p-4 w-full bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition">
                      <p className="text-white font-semibold">{image.title}</p>
                      <p className="text-gray-300 text-sm capitalize">{image.category}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filteredImages.length === 0 && (
            <div className="text-center py-20 text-gray-500">
              <p className="text-xl">No images found in this category</p>
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

          <button
            onClick={handlePrevImage}
            className="absolute left-4 text-white hover:text-gray-300"
          >
            <ChevronLeftIcon className="w-12 h-12" />
          </button>

          <img
            src={selectedImage.url}
            alt={selectedImage.title}
            className="max-w-4xl max-h-[80vh] object-contain"
          />

          <button
            onClick={handleNextImage}
            className="absolute right-4 text-white hover:text-gray-300"
          >
            <ChevronRightIcon className="w-12 h-12" />
          </button>

          <div className="absolute bottom-4 text-white text-center">
            <p className="text-lg font-semibold">{selectedImage.title}</p>
            <p className="text-sm text-gray-400">
              {filteredImages.findIndex(img => img.id === selectedImage.id) + 1} / {filteredImages.length}
            </p>
          </div>
        </div>
      )}
    </PublicLayout>
  )
}

export default GalleryPage