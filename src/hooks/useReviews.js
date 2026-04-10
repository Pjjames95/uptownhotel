/**
 * Reviews and Ratings Hook
 * Manages guest reviews and ratings
 */

import { useState } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export const useReviews = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const createReview = async (reviewData) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('guest_reviews')
        .insert([reviewData])
        .select()

      if (error) throw error
      toast.success('Review submitted successfully')
      return { success: true, data: data[0] }
    } catch (err) {
      setError(err.message)
      toast.error(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const getReviewsByBooking = async (bookingId) => {
    try {
      const { data, error } = await supabase
        .from('guest_reviews')
        .select('*')
        .eq('booking_id', bookingId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data
    } catch (err) {
      return null
    }
  }

  const getHotelReviews = async (limit = 10) => {
    try {
      const { data, error } = await supabase
        .from('guest_reviews')
        .select('*, guest:profiles(full_name)')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data
    } catch (err) {
      setError(err.message)
      return []
    }
  }

  const getAverageRating = async () => {
    try {
      const { data, error } = await supabase
        .from('guest_reviews')
        .select('rating')

      if (error) throw error
      if (data.length === 0) return 0
      const average = data.reduce((sum, r) => sum + r.rating, 0) / data.length
      return Math.round(average * 10) / 10
    } catch (err) {
      return 0
    }
  }

  return {
    createReview,
    getReviewsByBooking,
    getHotelReviews,
    getAverageRating,
    loading,
    error,
  }
}