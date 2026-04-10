/**
 * Staff Management Hook
 * Manages staff, shifts, and task assignments
 */

import { useState } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export const useStaffManagement = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const getStaffByRole = async (role) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', role)
        .eq('active', true)

      if (error) throw error
      return data
    } catch (err) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }

  const createShift = async (shiftData) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('staff_shifts')
        .insert([shiftData])
        .select()

      if (error) throw error
      toast.success('Shift created successfully')
      return { success: true, data: data[0] }
    } catch (err) {
      setError(err.message)
      toast.error(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const getStaffShifts = async (staffId, startDate, endDate) => {
    try {
      const { data, error } = await supabase
        .from('staff_shifts')
        .select('*')
        .eq('staff_id', staffId)
        .gte('shift_date', startDate)
        .lte('shift_date', endDate)
        .order('shift_date')

      if (error) throw error
      return data
    } catch (err) {
      setError(err.message)
      return []
    }
  }

  const assignHousekeepingTask = async (taskData) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('housekeeping_tasks')
        .insert([taskData])
        .select()

      if (error) throw error
      toast.success('Task assigned successfully')
      return { success: true, data: data[0] }
    } catch (err) {
      setError(err.message)
      toast.error(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const getAssignedTasks = async (staffId) => {
    try {
      const { data, error } = await supabase
        .from('housekeeping_tasks')
        .select('*, room:rooms(*)')
        .eq('assigned_to', staffId)
        .eq('status', 'pending')
        .order('scheduled_date')

      if (error) throw error
      return data
    } catch (err) {
      setError(err.message)
      return []
    }
  }

  const updateTaskStatus = async (taskId, status) => {
    setLoading(true)
    try {
      const updateData = { status }
      if (status === 'completed') {
        updateData.completed_date = new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('housekeeping_tasks')
        .update(updateData)
        .eq('id', taskId)
        .select()

      if (error) throw error
      toast.success('Task status updated')
      return { success: true, data: data[0] }
    } catch (err) {
      setError(err.message)
      toast.error(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  return {
    getStaffByRole,
    createShift,
    getStaffShifts,
    assignHousekeepingTask,
    getAssignedTasks,
    updateTaskStatus,
    loading,
    error,
  }
}