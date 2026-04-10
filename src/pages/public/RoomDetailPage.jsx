import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PublicLayout from '../../components/public/layout/PublicLayout'
import { supabase } from '../../lib/supabase'
import { useBookings } from '../../hooks/useBookings'
import { formatCurrency } from '../../utils/currency'
import { formatDateDisplay, getNights, validateBookingDates } from '../../utils/dateUtils'
import { ROOM_TYPES, ROOM_AMENITIES } from '../../utils/constants'
import { CheckIcon, XMarkIcon, UsersIcon, WifiIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const RoomDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [room, setRoom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showBooking, setShowBooking] = useState(false)
  const [bookingData, setBookingData] = useState({
    check_in_date: '',
    check_out_date: '',
    number_of_guests: 1,
    special_requests: '',
  })
  const { createBooking, checkRoomAvailability } = useBookings()

  useEffect(() => {
    fetchRoomDetails()
  }, [id])

  const fetchRoomDetails = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      setRoom(data)
    } catch (error) {
      console.error('Error fetching room:', error)
      toast.error('Failed to load room details')
    } finally {
      setLoading(false)
    }
  }

  const calculateTotal = () => {
    if (!bookingData.check_in_date || !bookingData.check_out_date || !room) return 0
    const nights = getNights(bookingData.check_in_date, bookingData.check_out_date)
    return room.price_per_night * nights
  }

  const handleBookingSubmit = async (e) => {
    e.preventDefault()

    // Validate dates
    const validation = validateBookingDates(bookingData.check_in_date, bookingData.check_out_date)
    if (!validation.valid) {
      toast.error(validation.error)
      return
    }

    // Check availability
    const isAvailable = await checkRoomAvailability(
      id,
      bookingData.check_in_date,
      bookingData.check_out_date
    )

    if (!isAvailable) {
      toast.error('Room is not available for selected dates')
      return
    }

    const bookingPayload = {
      room_id: id,
      check_in_date: bookingData.check_in_date,
      check_out_date: bookingData.check_out_date,
      number_of_guests: bookingData.number_of_guests,
      special_requests: bookingData.special_requests,
      total_amount: calculateTotal(),
    }

    const result = await createBooking(bookingPayload)

    if (result.success) {
      toast.success('Booking created successfully!')
      navigate('/guest/dashboard')
    } else {
      toast.error(result.error)
    }
  }

  if (loading) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </PublicLayout>
    )
  }

  if (!room) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold mb-4">Room Not Found</h2>
          <button onClick={() => navigate('/rooms')} className="btn btn-primary">
            View All Rooms
          </button>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      {/* Room Images */}
      <section className="relative h-96 bg-gray-900">
        {room.images && room.images[0] && (
          <img
            src={room.images[0]}
            alt={room.room_number}
            className="w-full h-full object-cover opacity-75"
          />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center">
          <div className="container mx-auto px-4 text-white">
            <h1 className="text-5xl font-bold mb-2">Room {room.room_number}</h1>
            <p className="text-xl">{ROOM_TYPES[room.room_type]?.label} Room</p>
          </div>
        </div>
      </section>

      {/* Room Details */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Info */}
            <div className="lg:col-span-2">
              <div className="card mb-6">
                <h2 className="text-2xl font-bold mb-4">Room Description</h2>
                <p className="text-gray-700 mb-6">{room.description || 'A comfortable and well-appointed room perfect for your stay.'}</p>

                <h3 className="text-xl font-semibold mb-3">Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {(room.amenities || ROOM_AMENITIES.slice(0, 6)).map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckIcon className="w-5 h-5 text-green-600" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {!showBooking && (
                <button
                  onClick={() => setShowBooking(true)}
                  className="btn btn-primary w-full md:w-auto"
                >
                  Book This Room
                </button>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="card sticky top-20">
                <div className="text-center mb-4">
                  <p className="text-3xl font-bold text-blue-600">
                    {formatCurrency(room.price_per_night)}
                  </p>
                  <p className="text-gray-600">per night</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="flex items-center gap-2">
                      <UsersIcon className="w-5 h-5" />
                      Capacity
                    </span>
                    <span className="font-semibold">{room.capacity} Guests</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="flex items-center gap-2">
                      <WifiIcon className="w-5 h-5" />
                      WiFi
                    </span>
                    <CheckIcon className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          {showBooking && (
            <div className="mt-8 card">
              <h2 className="text-2xl font-bold mb-6">Book Room {room.room_number}</h2>
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <option key={i + 1} value={i + 1}>{i + 1} Guest{i > 0 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Special Requests
                  </label>
                  <textarea
                    value={bookingData.special_requests}
                    onChange={(e) => setBookingData({ ...bookingData, special_requests: e.target.value })}
                    className="input"
                    rows={3}
                    placeholder="Any special requests or notes..."
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

                <div className="flex gap-4">
                  <button type="submit" className="btn btn-primary flex-1">
                    Confirm Booking
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
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  )
}

export default RoomDetailPage