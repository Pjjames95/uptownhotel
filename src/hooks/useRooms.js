import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const useRooms = () => {
  const [roomTypes, setRoomTypes] = useState([])
  const [floors, setFloors] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchRoomTypes = async () => {
    const { data, error } = await supabase
      .from('room_types')
      .select('*')
      .eq('is_active', true)
      .order('name')
    
    if (error) throw error
    return data || []
  }

  const fetchFloors = async () => {
    const { data, error } = await supabase
      .from('floors')
      .select('*')
      .eq('is_active', true)
      .order('floor_number')
    
    if (error) throw error
    return data || []
  }

  const fetchAvailableRooms = async (checkIn, checkOut, guests, roomTypeId, floorId) => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('Fetching available rooms with params:', { checkIn, checkOut, guests, roomTypeId, floorId })
      
      // Get all active rooms matching filters
      let query = supabase
        .from('rooms')
        .select(`
          id,
          room_number,
          status,
          room_type:room_types(*),
          floor:floors(*)
        `)
        .eq('status', 'active')

      if (roomTypeId) {
        query = query.eq('room_type_id', roomTypeId)
      }
      if (floorId) {
        query = query.eq('floor_id', floorId)
      }

      const { data: allRooms, error: roomsError } = await query
      
      if (roomsError) {
        console.error('Rooms query error:', roomsError)
        throw roomsError
      }

      console.log('All active rooms found:', allRooms?.length)

      // Filter by capacity
      const roomsWithCapacity = allRooms?.filter(room => 
        room.room_type?.capacity >= guests
      ) || []
      
      console.log('Rooms with sufficient capacity:', roomsWithCapacity.length)

      // Check availability for each room
      const available = []
      for (const room of roomsWithCapacity) {
        // Check for overlapping bookings
        const { data: bookings, error: bookingsError } = await supabase
          .from('room_bookings')
          .select('id')
          .eq('room_id', room.id)
          .in('status', ['pending', 'confirmed', 'checked_in'])
          .lt('check_in_date', checkOut)
          .gt('check_out_date', checkIn)

        if (bookingsError) {
          console.error('Bookings check error:', bookingsError)
          continue
        }

        if (!bookings || bookings.length === 0) {
          available.push({
            ...room,
            price_per_night: room.room_type?.base_price || 0
          })
        }
      }

      console.log('Available rooms:', available.length)
      return available
    } catch (err) {
      console.error('Fetch available rooms error:', err)
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }

  const loadFilters = async () => {
    setLoading(true)
    try {
      const [types, floorsData] = await Promise.all([
        fetchRoomTypes(),
        fetchFloors()
      ])
      setRoomTypes(types)
      setFloors(floorsData)
      console.log('Filters loaded:', { types: types.length, floors: floorsData.length })
    } catch (err) {
      console.error('Load filters error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFilters()
  }, [])

  return {
    roomTypes,
    floors,
    loading,
    error,
    fetchAvailableRooms,
    loadFilters,
  }
}