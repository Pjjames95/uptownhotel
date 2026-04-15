import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import PublicLayout from '../../components/public/layout/PublicLayout'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../utils/currency'
import { UsersIcon, CheckIcon, PhotoIcon, ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const RoomDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [roomType, setRoomType] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  useEffect(() => {
    fetchRoomType()
  }, [id])

  const fetchRoomType = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('room_types')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      setRoomType(data)
    } catch (error) {
      console.error('Error fetching room type:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrevImage = () => {
    if (roomType?.images) {
      setSelectedImage(prev => prev > 0 ? prev - 1 : roomType.images.length - 1)
    }
  }

  const handleNextImage = () => {
    if (roomType?.images) {
      setSelectedImage(prev => prev < roomType.images.length - 1 ? prev + 1 : 0)
    }
  }

  const openLightbox = (index) => {
    setSelectedImage(index)
    setLightboxOpen(true)
  }

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" message="Loading room details..." />
        </div>
      </PublicLayout>
    )
  }

  if (!roomType) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <PhotoIcon className="w-20 h-20 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-4">Room Type Not Found</h2>
          <p className="text-gray-600 mb-6">The room type you're looking for doesn't exist.</p>
          <button onClick={() => navigate('/rooms')} className="btn btn-primary">
            View All Rooms
          </button>
        </div>
      </PublicLayout>
    )
  }

  const images = roomType.images || []
  const hasMultipleImages = images.length > 1

  return (
    <PublicLayout>
      <div className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <Link to="/" className="text-gray-500 hover:text-blue-600">Home</Link>
              </li>
              <li className="text-gray-400">/</li>
              <li>
                <Link to="/rooms" className="text-gray-500 hover:text-blue-600">Rooms</Link>
              </li>
              <li className="text-gray-400">/</li>
              <li className="text-gray-900 font-medium">{roomType.name}</li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Images and Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
              <div className="card p-0 overflow-hidden">
                {images.length > 0 ? (
                  <>
                    {/* Main Image */}
                    <div 
                      className="relative h-96 bg-gray-100 cursor-pointer"
                      onClick={() => openLightbox(selectedImage)}
                    >
                      <img
                        src={images[selectedImage]}
                        alt={`${roomType.name} - View ${selectedImage + 1}`}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Image Navigation Arrows */}
                      {hasMultipleImages && (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); handlePrevImage() }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition"
                          >
                            <ChevronLeftIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleNextImage() }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition"
                          >
                            <ChevronRightIcon className="w-5 h-5" />
                          </button>
                        </>
                      )}

                      {/* Image Counter */}
                      <div className="absolute bottom-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm">
                        {selectedImage + 1} / {images.length}
                      </div>
                    </div>

                    {/* Thumbnails */}
                    {hasMultipleImages && (
                      <div className="p-4 border-t">
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {images.map((img, index) => (
                            <button
                              key={index}
                              onClick={() => setSelectedImage(index)}
                              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                                selectedImage === index 
                                  ? 'border-blue-600' 
                                  : 'border-transparent hover:border-gray-300'
                              }`}
                            >
                              <img
                                src={img}
                                alt={`Thumbnail ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="h-96 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <div className="text-center">
                      <PhotoIcon className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">No images available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Room Description */}
              <div className="card">
                <h2 className="text-xl font-semibold mb-4">About This Room</h2>
                <p className="text-gray-700 leading-relaxed">
                  {roomType.description || `Experience comfort and luxury in our ${roomType.name}. Perfect for up to ${roomType.capacity} guest${roomType.capacity > 1 ? 's' : ''}, this room offers all the amenities you need for a relaxing stay.`}
                </p>
              </div>

              {/* Amenities */}
              {roomType.amenities && roomType.amenities.length > 0 && (
                <div className="card">
                  <h2 className="text-xl font-semibold mb-4">Room Amenities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {roomType.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckIcon className="w-5 h-5 text-green-600" />
                        </div>
                        <span className="text-gray-700">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Booking Card */}
            <div className="lg:col-span-1">
              <div className="card sticky top-20">
                <div className="text-center mb-6">
                  <div className="inline-block bg-blue-100 p-3 rounded-full mb-3">
                    <span className="text-3xl">🏨</span>
                  </div>
                  <h3 className="text-2xl font-bold">{roomType.name}</h3>
                  <p className="text-gray-600 mt-1">Code: {roomType.code}</p>
                </div>

                <div className="text-center mb-6">
                  <p className="text-3xl font-bold text-blue-600">
                    {formatCurrency(roomType.base_price)}
                  </p>
                  <p className="text-gray-600">per night</p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="flex items-center gap-2 text-gray-700">
                      <UsersIcon className="w-5 h-5" />
                      Maximum Capacity
                    </span>
                    <span className="font-semibold">{roomType.capacity} Guest{roomType.capacity > 1 ? 's' : ''}</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="flex items-center gap-2 text-gray-700">
                      <CheckIcon className="w-5 h-5 text-green-600" />
                      Free WiFi
                    </span>
                    <span className="text-green-600 text-sm">Included</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="flex items-center gap-2 text-gray-700">
                      <CheckIcon className="w-5 h-5 text-green-600" />
                      Breakfast
                    </span>
                    <span className="text-green-600 text-sm">Included</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="flex items-center gap-2 text-gray-700">
                      <CheckIcon className="w-5 h-5 text-green-600" />
                      Room Service
                    </span>
                    <span className="text-green-600 text-sm">24/7</span>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <h4 className="font-semibold mb-2">House Rules</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Check-in: 2:00 PM - 10:00 PM</li>
                    <li>• Check-out: Before 11:00 AM</li>
                    <li>• No smoking inside the room</li>
                    <li>• No pets allowed</li>
                  </ul>
                </div>

                <button
                  onClick={() => navigate('/rooms')}
                  className="btn btn-primary w-full"
                >
                  Check Availability
                </button>
                
                <p className="text-xs text-gray-500 text-center mt-4">
                  You won't be charged yet. Only pay when you confirm your booking.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && images.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-50"
          >
            <XMarkIcon className="w-8 h-8" />
          </button>

          {hasMultipleImages && (
            <button
              onClick={handlePrevImage}
              className="absolute left-4 text-white hover:text-gray-300"
            >
              <ChevronLeftIcon className="w-10 h-10" />
            </button>
          )}

          <img
            src={images[selectedImage]}
            alt={`${roomType.name} - Full size`}
            className="max-w-5xl max-h-[85vh] object-contain"
          />

          {hasMultipleImages && (
            <button
              onClick={handleNextImage}
              className="absolute right-4 text-white hover:text-gray-300"
            >
              <ChevronRightIcon className="w-10 h-10" />
            </button>
          )}

          <div className="absolute bottom-4 text-white text-center">
            <p className="text-lg font-semibold">{roomType.name}</p>
            <p className="text-sm text-gray-400">
              {selectedImage + 1} / {images.length}
            </p>
          </div>
        </div>
      )}
    </PublicLayout>
  )
}

export default RoomDetailPage