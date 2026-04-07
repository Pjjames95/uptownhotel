import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const useEvents = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchUpcomingEvents = async () => {
    setLoading(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .gte('event_date', today)
        .eq('status', 'confirmed')
        .order('event_date')

      if (error) throw error
      setEvents(data)
    } catch (err) {
      console.error('Error fetching events:', err)
    } finally {
      setLoading(false)
    }
  }

  const bookEvent = async (eventId, bookingData) => {
    try {
      const { data, error } = await supabase
        .from('event_bookings')
        .insert([{
          event_id: eventId,
          ...bookingData,
        }])
        .select()

      if (error) throw error
      return { success: true, data: data[0] }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  useEffect(() => {
    fetchUpcomingEvents()
  }, [])

  return {
    events,
    loading,
    bookEvent,
  }
}