/**
 * Table Reservations Hook
 * Manages all table reservation operations
 */

import { useState } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export const useTableReservations = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const getAvailableTables = async (date, time, partySize) => {
    setLoading(true)
    try {
      // Get all tables
      const { data: allTables, error: tablesError } = await supabase
        .from('restaurant_tables')
        .select('*')
        .gte('capacity', partySize)

      if (tablesError) throw tablesError

      // Get booked tables for that time
      const { data: bookedTables, error: bookingsError } = await supabase
        .from('table_reservations')
        .select('table_id')
        .eq('reservation_date', date)
        .eq('reservation_time', time)
        .in('status', ['pending', 'confirmed', 'seated'])

      if (bookingsError) throw bookingsError

      const bookedTableIds = bookedTables.map(b => b.table_id)
      const available = allTables.filter(t => !bookedTableIds.includes(t.id))

      return available
    } catch (err) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }

  const createReservation = async (reservationData) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('table_reservations')
        .insert([reservationData])
        .select()

      if (error) throw error
      toast.success('Table reservation created successfully')
      return { success: true, data: data[0] }
    } catch (err) {
      setError(err.message)
      toast.error(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const updateReservation = async (reservationId, updates) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('table_reservations')
        .update(updates)
        .eq('id', reservationId)
        .select()

      if (error) throw error
      toast.success('Reservation updated successfully')
      return { success: true, data: data[0] }
    } catch (err) {
      setError(err.message)
      toast.error(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const getGuestReservations = async (guestId) => {
    try {
      const { data, error } = await supabase
        .from('table_reservations')
        .select('*, table:restaurant_tables(*)')
        .eq('guest_id', guestId)
        .order('reservation_date', { ascending: false })

      if (error) throw error
      return data
    } catch (err) {
      setError(err.message)
      return []
    }
  }

  return {
    getAvailableTables,
    createReservation,
    updateReservation,
    getGuestReservations,
    loading,
    error,
  }
}