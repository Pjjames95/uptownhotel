import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PublicLayout from '../../components/public/layout/PublicLayout'
import { useRooms } from '../../hooks/useRooms'
import { useBookings } from '../../hooks/useBookings'
import { useAuth } from '../../context/AuthContext'
import { formatCurrency } from '../../utils/currency'
import { formatDateDisplay, getNights, validateBookingDates } from '../../utils/dateUtils'
import { UsersIcon, PhotoIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const RoomsPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { roomTypes, floors, loading, fetchAvailableRooms } = useRooms()
  const { createBooking } = useBookings()
  
  const [searchParams, setSearchParams] = useState({
    check_in: '',
    check_out: '',
    guests: 1,
    room_type_id: '',
    floor_id: '',
  })
  const [availableRooms, setAvailableRooms] = useState([])
  const [searched, setSearched] = useState(false)
  const [searching, setSearching] = useState(false)

  const handleSearch = async () => {
    if (!searchParams.check_in || !searchParams.check_out) {
      toast.error('Please select check-in and check-out dates')
      return
    }

    const validation = validateBookingDates(searchParams.check_in, searchParams.check_out)
    if (!validation.valid) {
      toast.error(validation.error)
      return
    }

    setSearching(true)
    const rooms = await fetchAvailableRooms(
      searchParams.check_in,
      searchParams.check_out,
      searchParams.guests,
      searchParams.room_type_id,
      searchParams.floor_id
    )
    setAvailableRooms(rooms)
    setSearched(true)
    setSearching(false)
  }

  const handleBookRoom = async (room) => {
    if (!user) {
      toast.error('Please login to book')
      navigate('/login')
      return
    }

    const nights = getNights(searchParams.check_in, searchParams.check_out)
    const totalAmount = room.price_per_night * nights

    const result = await createBooking({
      room_id: room.id,
      guest_id: user.id,
      check_in_date: searchParams.check_in,
      check_out_date: searchParams.check_out,
      number_of_guests: searchParams.guests,
      price_per_night: room.price_per_night,
      total_amount: totalAmount,
      status: 'pending',
      payment_status: 'pending',
    })

    if (result.success) {
      toast.success('Booking created successfully!')
      navigate('/guest/dashboard')
    } else {
      toast.error(result.error || 'Failed to create booking')
    }
  }

  // Helper function to get the primary image for a room type
  const getRoomImage = (room) => {
    if (room.room_type?.images && room.room_type.images.length > 0) {
      return room.room_type.images[0]
    }
    return null
  }

  // Helper function to get additional images count
  const getAdditionalImagesCount = (room) => {
    if (room.room_type?.images && room.room_type.images.length > 1) {
      return room.room_type.images.length - 1
    }
    return 0
  }

  return (
    <PublicLayout>
      <div className="py-10 bg-gray-50">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-8">Find Your Perfect Room</h1>

          {/* Search Form */}
          <div className="card max-w-4xl mx-auto mb-10">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium mb-1">Check-in</label>
                <input
                  type="date"
                  value={searchParams.check_in}
                  onChange={(e) => setSearchParams({...searchParams, check_in: e.target.value})}
                  className="input"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Check-out</label>
                <input
                  type="date"
                  value={searchParams.check_out}
                  onChange={(e) => setSearchParams({...searchParams, check_out: e.target.value})}
                  className="input"
                  min={searchParams.check_in || new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Guests</label>
                <select
                  value={searchParams.guests}
                  onChange={(e) => setSearchParams({...searchParams, guests: parseInt(e.target.value)})}
                  className="input"
                >
                  {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} Guest{n>1?'s':''}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Room Type</label>
                <select
                  value={searchParams.room_type_id}
                  onChange={(e) => setSearchParams({...searchParams, room_type_id: e.target.value})}
                  className="input"
                >
                  <option value="">All Types</option>
                  {roomTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleSearch}
                disabled={searching}
                className="btn btn-primary"
              >
                {searching ? 'Searching...' : 'Search Rooms'}
              </button>
            </div>
          </div>

          {/* Results */}
          {searched && (
            <div>
              <h2 className="text-2xl font-semibold mb-6">
                {availableRooms.length} Room{availableRooms.length !== 1 ? 's' : ''} Available
                {searchParams.check_in && searchParams.check_out && (
                  <span className="text-lg font-normal text-gray-600 ml-4">
                    {formatDateDisplay(searchParams.check_in)} - {formatDateDisplay(searchParams.check_out)}
                  </span>
                )}
              </h2>

              {availableRooms.length === 0 ? (
                <div className="card text-center py-10">
                  <PhotoIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No rooms available for your search criteria.</p>
                  <p className="text-sm text-gray-500 mt-2">Try different dates or adjust your filters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableRooms.map(room => {
                    const roomImage = getRoomImage(room)
                    const additionalImages = getAdditionalImagesCount(room)
                    
                    return (
                      <div key={room.id} className="card hover:shadow-lg transition overflow-hidden">
                        {/* Room Image - Using room type images */}
                        <div className="relative -mx-6 -mt-6 mb-4 h-48 bg-gray-100">
                          {roomImage ? (
                            <>
                              <img
                                src={roomImage}
                                alt={room.room_type?.name || 'Room'}
                                className="w-full h-full object-cover"
                              />
                              {additionalImages > 0 && (
                                <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                                  +{additionalImages} more photo{additionalImages > 1 ? 's' : ''}
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                              <PhotoIcon className="w-12 h-12 text-gray-400" />
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-xl font-bold">Room {room.room_number}</h3>
                            <p className="text-sm text-gray-600">{room.room_type?.name}</p>
                            <p className="text-sm text-gray-600">Floor {room.floor?.floor_number} - {room.floor?.name}</p>
                          </div>
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                            Available
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-3 text-gray-600">
                          <UsersIcon className="w-4 h-4" />
                          <span className="text-sm">Up to {room.room_type?.capacity} guests</span>
                        </div>

                        {room.room_type?.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {room.room_type.description}
                          </p>
                        )}

                        <div className="mb-4">
                          <p className="text-2xl font-bold text-blue-600">
                            {formatCurrency(room.price_per_night)}
                          </p>
                          <p className="text-sm text-gray-500">per night</p>
                          {searchParams.check_in && searchParams.check_out && (
                            <p className="text-sm text-gray-600 mt-1">
                              Total: {formatCurrency(room.price_per_night * getNights(searchParams.check_in, searchParams.check_out))} for {getNights(searchParams.check_in, searchParams.check_out)} nights
                            </p>
                          )}
                        </div>

                        {/* Amenities */}
                        {room.room_type?.amenities && room.room_type.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {room.room_type.amenities.slice(0, 4).map((amenity, i) => (
                              <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {amenity}
                              </span>
                            ))}
                            {room.room_type.amenities.length > 4 && (
                              <span className="text-xs text-gray-500">
                                +{room.room_type.amenities.length - 4} more
                              </span>
                            )}
                          </div>
                        )}

                        <button
                          onClick={() => handleBookRoom(room)}
                          className="btn btn-primary w-full"
                        >
                          Book Now
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  )
}

export default RoomsPage