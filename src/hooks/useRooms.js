import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const useRooms = () => {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchRooms = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('is_available', true)

      if (error) throw error
      setRooms(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createRoom = async (roomData) => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .insert([roomData])
        .select()

      if (error) throw error
      setRooms([...rooms, data[0]])
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  const updateRoom = async (roomId, updates) => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .update(updates)
        .eq('id', roomId)
        .select()

      if (error) throw error
      setRooms(rooms.map(r => r.id === roomId ? data[0] : r))
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  const deleteRoom = async (roomId) => {
    try {
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', roomId)

      if (error) throw error
      setRooms(rooms.filter(r => r.id !== roomId))
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  useEffect(() => {
    fetchRooms()
  }, [])

  return {
    rooms,
    loading,
    error,
    createRoom,
    updateRoom,
    deleteRoom,
    fetchRooms,
  }
}