import { useState } from 'react'
import { supabase } from '../lib/supabase'
// import { v4 as uuidv4 } from 'uuid'

export const useBookings = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const createBooking = async (bookingData) => {
    setLoading(true)
    try {
      const booking = {
        ...bookingData,
        booking_reference: `BK-${uuidv4().slice(0, 8).toUpperCase()}`,
      }

      const { data, error } = await supabase
        .from('room_bookings')
        .insert([booking])
        .select()

      if (error) throw error
      return { success: true, data: data[0] }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const getBookingsByGuest = async (guestId) => {
    try {
      const { data, error } = await supabase
        .from('room_bookings')
        .select('*')
        .eq('guest_id', guestId)

      if (error) throw error
      return data
    } catch (err) {
      setError(err.message)
      return []
    }
  }

  const checkRoomAvailability = async (roomId, checkIn, checkOut) => {
    try {
      const { data, error } = await supabase
        .from('room_bookings')
        .select('*')
        .eq('room_id', roomId)
        .in('status', ['pending', 'confirmed', 'checked_in'])
        .or(`and(check_in_date.lt.${checkOut},check_out_date.gt.${checkIn})`)

      if (error) throw error
      return data.length === 0
    } catch (err) {
      setError(err.message)
      return false
    }
  }

  return {
    createBooking,
    getBookingsByGuest,
    checkRoomAvailability,
    loading,
    error,
  }
}