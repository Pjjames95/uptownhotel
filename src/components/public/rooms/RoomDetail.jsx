import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useBookings } from '../../../hooks/useBookings'
import { formatCurrency } from '../../../utils/currency'
import { formatDateDisplay, getNights, validateBookingDates } from '../../../utils/dateUtils'
import { ROOM_TYPES, ROOM_AMENITIES } from '../../../utils/constants'
import { 
  XMarkIcon, 
  UsersIcon, 
  WifiIcon, 
  TvIcon,
  CheckIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const RoomDetail = ({ room, onBack }) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { createBooking, checkRoomAvailability } = useBookings()
  const [showBooking, setShowBooking] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [bookingData, setBookingData] = useState({
    check_in_date: '',
    check_out_date: '',
    number_of_guests: 1,
    special_requests: '',
  })

  const images = room.images || []
  const amenities = room.amenities || ROOM_AMENITIES.slice(0, 6)

  const calculateTotal = () => {
    if (!bookingData.check_in_date || !bookingData.check_out_date) return 0
    const nights = getNights(bookingData.check_in_date, bookingData.check_out_date)
    return room.price_per_night * nights
  }

  const handleBookingSubmit = async (e) => {
    e.preventDefault()
    
    if (!user) {
      toast.error('Please login to book a room')
      navigate('/login')
      return
    }

    const validation = validateBookingDates(bookingData.check_in_date, bookingData.check_out_date)
    if (!validation.valid) {
      toast.error(validation.error)
      return
    }

    if (bookingData.number_of_guests > room.capacity) {
      toast.error(`Maximum capacity is ${room.capacity} guests`)
      return
    }

    setLoading(true)

    try {
      const isAvailable = await checkRoomAvailability(
        room.id,
        bookingData.check_in_date,
        bookingData.check_out_date
      )

      if (!isAvailable) {
        toast.error('Room is not available for selected dates')
        setLoading(false)
        return
      }

      const result = await createBooking({
        room_id: room.id,
        guest_id: user.id,
        check_in_date: bookingData.check_in_date,
        check_out_date: bookingData.check_out_date,
        number_of_guests: bookingData.number_of_guests,
        special_requests: bookingData.special_requests,
        total_amount: calculateTotal(),
      })

      if (result.success) {
        toast.success('Booking created successfully!')
        navigate('/guest/dashboard')
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('Failed to create booking')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        Back to Rooms
      </button>

      {/* Image Gallery */}
      <div className="mb-8">
        <div className="relative h-96 bg-gray-900 rounded-lg overflow-hidden">
          {images.length > 0 ? (
            <>
              <img
                src={images[selectedImage]}
                alt={`Room ${room.room_number} - ${selectedImage + 1}`}
                className="w-full h-full object-cover"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage(prev => prev > 0 ? prev - 1 : images.length - 1)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => setSelectedImage(prev => prev < images.length - 1 ? prev + 1 : 0)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                  >
                    →
                  </button>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-400">No image available</span>
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`flex-shrink-0 w-20 h-20 rounded overflow-hidden border-2 transition ${
                  selectedImage === index ? 'border-blue-600' : 'border-transparent'
                }`}
              >
                <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Room Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">Room {room.room_number}</h1>
              <p className="text-gray-600">Floor {room.floor_number || '1'} • {ROOM_TYPES[room.room_type]?.label} Room</p>
            </div>
            <span className={`px-4 py-2 rounded-full font-medium ${
              room.status === 'available' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {room.status === 'available' ? 'Available Now' : room.status}
            </span>
          </div>

          {/* Description */}
          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-3">Description</h2>
            <p className="text-gray-700 leading-relaxed">
              {room.description || `Experience comfort and luxury in our ${ROOM_TYPES[room.room_type]?.label} room. Perfect for ${room.capacity} guest${room.capacity > 1 ? 's' : ''}, this room offers all the amenities you need for a relaxing stay.`}
            </p>
          </div>

          {/* Amenities */}
          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4">Room Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {amenities.map((amenity, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <CheckIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-gray-700">{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Policies */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">House Rules</h2>
            <ul className="space-y-2 text-gray-700">
              <li>• Check-in: 2:00 PM - 10:00 PM</li>
              <li>• Check-out: Before 11:00 AM</li>
              <li>• No smoking inside the room</li>
              <li>• No pets allowed</li>
              <li>• Quiet hours: 10:00 PM - 7:00 AM</li>
            </ul>
          </div>
        </div>

        {/* Booking Sidebar */}
        <div className="lg:col-span-1">
          <div className="card sticky top-20">
            <div className="text-center mb-6">
              <p className="text-3xl font-bold text-blue-600">
                {formatCurrency(room.price_per_night)}
              </p>
              <p className="text-gray-600">per night</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="flex items-center gap-2 text-gray-700">
                  <UsersIcon className="w-5 h-5" />
                  Capacity
                </span>
                <span className="font-semibold">{room.capacity} Guest{room.capacity > 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="flex items-center gap-2 text-gray-700">
                  <WifiIcon className="w-5 h-5" />
                  WiFi
                </span>
                <CheckIcon className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="flex items-center gap-2 text-gray-700">
                  <TvIcon className="w-5 h-5" />
                  TV
                </span>
                <CheckIcon className="w-5 h-5 text-green-600" />
              </div>
            </div>

            {!showBooking ? (
              <button
                onClick={() => setShowBooking(true)}
                className="btn btn-primary w-full"
                disabled={room.status !== 'available'}
              >
                {room.status === 'available' ? 'Book Now' : 'Not Available'}
              </button>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <h3 className="font-semibold text-lg">Select Dates</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    value={bookingData.check_in_date}
                    onChange={(e) => setBookingData({ ...bookingData, check_in_date: e.target.value })}
                    className="input"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    value={bookingData.check_out_date}
                    onChange={(e) => setBookingData({ ...bookingData, check_out_date: e.target.value })}
                    className="input"
                    min={bookingData.check_in_date || new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Guests
                  </label>
                  <select
                    value={bookingData.number_of_guests}
                    onChange={(e) => setBookingData({ ...bookingData, number_of_guests: parseInt(e.target.value) })}
                    className="input"
                  >
                    {[...Array(room.capacity)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} Guest{i > 0 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Special Requests (Optional)
                  </label>
                  <textarea
                    value={bookingData.special_requests}
                    onChange={(e) => setBookingData({ ...bookingData, special_requests: e.target.value })}
                    className="input"
                    rows={2}
                    placeholder="Any special requests..."
                  />
                </div>

                {bookingData.check_in_date && bookingData.check_out_date && (
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span>Price per night:</span>
                      <span>{formatCurrency(room.price_per_night)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Number of nights:</span>
                      <span>{getNights(bookingData.check_in_date, bookingData.check_out_date)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total:</span>
                      <span className="text-blue-600">{formatCurrency(calculateTotal())}</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary flex-1 disabled:opacity-50"
                  >
                    {loading ? 'Booking...' : 'Confirm Booking'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBooking(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoomDetail