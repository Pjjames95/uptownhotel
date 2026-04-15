import { useState } from 'react'
import { supabase } from '../lib/supabase'

// Generate booking reference
const generateBookingReference = () => {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `BK-${timestamp}-${random}`.toUpperCase()
}

export const useBookings = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const createBooking = async (bookingData) => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('Creating booking with data:', bookingData)
      
      const booking = {
        ...bookingData,
        booking_reference: generateBookingReference(),
        status: bookingData.status || 'pending',
        payment_status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from('room_bookings')
        .insert([booking])
        .select()
        .single()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      console.log('Booking created:', data)
      return { success: true, data }
    } catch (err) {
      console.error('Create booking error:', err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const getBookingsByGuest = async (guestId) => {
    try {
      console.log('Fetching bookings for guest:', guestId)
      
      const { data, error } = await supabase
        .from('room_bookings')
        .select(`
          *,
          room:rooms!room_bookings_room_id_fkey(
            room_number,
            room_type:room_types(name, code, base_price, capacity, images)
          )
        `)
        .eq('guest_id', guestId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Fetch bookings error:', error)
        throw error
      }
      
      console.log('Bookings fetched:', data)
      return data || []
    } catch (err) {
      console.error('Fetch bookings error:', err)
      setError(err.message)
      return []
    }
  }

  const checkRoomAvailability = async (roomId, checkIn, checkOut) => {
    try {
      console.log('Checking availability:', { roomId, checkIn, checkOut })
      
      // Check if the room exists and is active
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('status')
        .eq('id', roomId)
        .single()
      
      if (roomError) {
        console.error('Room check error:', roomError)
        return false
      }
      
      // Room must be active
      if (room?.status !== 'active') {
        console.log('Room is not active')
        return false
      }
      
      // Check for overlapping bookings
      const { data: bookings, error: bookingsError } = await supabase
        .from('room_bookings')
        .select('id')
        .eq('room_id', roomId)
        .in('status', ['pending', 'confirmed', 'checked_in'])
        .lt('check_in_date', checkOut)
        .gt('check_out_date', checkIn)

      if (bookingsError) {
        console.error('Bookings check error:', bookingsError)
        return false
      }
      
      console.log('Conflicting bookings found:', bookings?.length || 0)
      
      // Room is available if no conflicting bookings
      return !bookings || bookings.length === 0
    } catch (err) {
      console.error('Check availability error:', err)
      setError(err.message)
      return false
    }
  }

  const confirmBooking = async (bookingId) => {
    setLoading(true)
    try {
      console.log('Confirming booking:', bookingId)
      
      // First check if booking exists
      const { data: existingBooking, error: fetchError } = await supabase
        .from('room_bookings')
        .select('id, status')
        .eq('id', bookingId)
        .single()
      
      if (fetchError) {
        console.error('Fetch booking error:', fetchError)
        throw new Error('Booking not found')
      }
      
      console.log('Existing booking:', existingBooking)
      
      if (existingBooking.status === 'confirmed') {
        return { success: true, message: 'Already confirmed' }
      }
      
      const { data, error } = await supabase
        .from('room_bookings')
        .update({ 
          status: 'confirmed',
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId)
        .select()
        .single()

      if (error) {
        console.error('Update error:', error)
        throw error
      }
      
      console.log('Booking confirmed successfully:', data)
      return { success: true, data }
    } catch (err) {
      console.error('Confirm booking error:', err)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const cancelBooking = async (bookingId) => {
    try {
      console.log('Cancelling booking:', bookingId)
      
      const { data, error } = await supabase
        .from('room_bookings')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId)
        .select()
        .single()

      if (error) throw error
      
      console.log('Booking cancelled:', data)
      return { success: true, data }
    } catch (err) {
      console.error('Cancel booking error:', err)
      return { success: false, error: err.message }
    }
  }

  return {
    loading,
    error,
    createBooking,
    getBookingsByGuest,
    checkRoomAvailability,
    confirmBooking,
    cancelBooking,
  }
}