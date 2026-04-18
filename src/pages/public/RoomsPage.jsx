import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PublicLayout from '../../components/public/layout/PublicLayout'
import { useRooms } from '../../hooks/useRooms'
import { useBookings } from '../../hooks/useBookings'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../utils/currency'
import { formatDateDisplay, getNights, validateBookingDates } from '../../utils/dateUtils'
import { UsersIcon, PhotoIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const RoomsPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { roomTypes, floors, fetchAvailableRooms } = useRooms()
  const { createBooking } = useBookings()
  
  const [allRooms, setAllRooms] = useState([])
  const [availableRooms, setAvailableRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [searched, setSearched] = useState(false)
  const [searching, setSearching] = useState(false)
  
  const [searchParams, setSearchParams] = useState({
    check_in: '',
    check_out: '',
    guests: 1,
    room_type_id: '',
    floor_id: '',
  })

  // 🔑 Load all active rooms on initial page load
  useEffect(() => {
    fetchAllActiveRooms()
  }, [])

  const fetchAllActiveRooms = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select(`
          id,
          room_number,
          status,
          room_type:room_types(*),
          floor:floors(*)
        `)
        .eq('status', 'active')
        .order('room_number')

      if (error) throw error
      
      console.log('All active rooms:', data?.length)
      setAllRooms(data || [])
    } catch (error) {
      console.error('Error fetching rooms:', error)
    } finally {
      setLoading(false)
    }
  }

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

    // If user searched with dates, use those dates
    if (searchParams.check_in && searchParams.check_out) {
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
    } else {
      // No dates selected - scroll to search form
      toast('Please select dates to book', { icon: '📅' })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Helper function to get room image
  const getRoomImage = (room) => {
    if (room.room_type?.images && room.room_type.images.length > 0) {
      return room.room_type.images[0]
    }
    return null
  }

  // Determine which rooms to display
  const displayRooms = searched ? availableRooms : allRooms

  return (
    <PublicLayout>
      <div className="py-10 bg-gray-50">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-4">Our Rooms</h1>
          <p className="text-gray-600 text-center mb-8">
            {searched 
              ? `${displayRooms.length} room${displayRooms.length !== 1 ? 's' : ''} available for your dates`
              : 'Browse our selection of comfortable rooms'}
          </p>

          {/* Search Form */}
          <div className="card max-w-4xl mx-auto mb-10">
            <h2 className="text-lg font-semibold mb-4">Check Availability</h2>
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
              <div className="flex gap-2">
                <button
                  onClick={handleSearch}
                  disabled={searching}
                  className="btn btn-primary flex-1"
                >
                  {searching ? 'Searching...' : 'Search'}
                </button>
                {searched && (
                  <button
                    onClick={() => {
                      setSearched(false)
                      setSearchParams({
                        check_in: '',
                        check_out: '',
                        guests: 1,
                        room_type_id: '',
                        floor_id: '',
                      })
                    }}
                    className="btn btn-secondary"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
              <p className="mt-4 text-gray-600">Loading rooms...</p>
            </div>
          ) : displayRooms.length === 0 ? (
            <div className="card text-center py-16">
              <PhotoIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 text-lg">
                {searched 
                  ? 'No rooms available for your search criteria.'
                  : 'No rooms available at the moment.'}
              </p>
              {searched && (
                <p className="text-sm text-gray-500 mt-2">Try different dates or adjust your filters.</p>
              )}
            </div>
          ) : (
            <>
              {searched && searchParams.check_in && searchParams.check_out && (
                <div className="mb-4 text-sm text-gray-600">
                  Showing rooms available from {formatDateDisplay(searchParams.check_in)} to {formatDateDisplay(searchParams.check_out)}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayRooms.map(room => {
                  const roomImage = getRoomImage(room)
                  
                  return (
                    <div key={room.id} className="card hover:shadow-lg transition overflow-hidden">
                      {/* Room Image */}
                      <div className="relative -mx-6 -mt-6 mb-4 h-48 bg-gray-100">
                        {roomImage ? (
                          <img
                            src={roomImage}
                            alt={room.room_type?.name || 'Room'}
                            className="w-full h-full object-cover"
                          />
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
                          {formatCurrency(room.room_type?.base_price || 0)}
                        </p>
                        <p className="text-sm text-gray-500">per night</p>
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
                        {searched ? 'Book Now' : 'Select Dates to Book'}
                      </button>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </PublicLayout>
  )
}

export default RoomsPage
