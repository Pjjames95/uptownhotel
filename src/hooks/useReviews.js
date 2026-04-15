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
        .single()

      if (error) throw error
      
      toast.success('Review submitted successfully!')
      return { success: true, data }
    } catch (err) {
      console.error('Error creating review:', err)
      setError(err.message)
      toast.error('Failed to submit review: ' + err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const getHotelReviews = async (limit = 10) => {
    try {
      const { data, error } = await supabase
        .from('guest_reviews')
        .select(`
          *,
          guest:guest_id(full_name)
        `)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Error fetching reviews:', err)
      return []
    }
  }

  const getUserReviews = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('guest_reviews')
        .select(`
          *,
          booking:booking_id(
            check_in_date,
            check_out_date,
            room:rooms(room_number)
          )
        `)
        .eq('guest_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Error fetching user reviews:', err)
      return []
    }
  }

  const getCompletedBookingsWithoutReview = async (userId) => {
    try {
      // Get all completed bookings
      const { data: bookings, error: bookingsError } = await supabase
        .from('room_bookings')
        .select(`
          id,
          check_in_date,
          check_out_date,
          room:rooms(room_number)
        `)
        .eq('guest_id', userId)
        .eq('status', 'checked_out')
        .order('check_out_date', { ascending: false })

      if (bookingsError) throw bookingsError

      // Get existing reviews
      const { data: reviews, error: reviewsError } = await supabase
        .from('guest_reviews')
        .select('booking_id')
        .eq('guest_id', userId)

      if (reviewsError) throw reviewsError

      // Filter out bookings that already have reviews
      const reviewedIds = reviews?.map(r => r.booking_id) || []
      return bookings?.filter(b => !reviewedIds.includes(b.id)) || []
    } catch (err) {
      console.error('Error fetching bookings:', err)
      return []
    }
  }

  const getAverageRating = async () => {
    try {
      const { data, error } = await supabase
        .from('guest_reviews')
        .select('rating')
        .eq('is_approved', true)

      if (error) throw error
      if (!data || data.length === 0) return 0
      
      const average = data.reduce((sum, r) => sum + r.rating, 0) / data.length
      return Math.round(average * 10) / 10
    } catch (err) {
      console.error('Error calculating average rating:', err)
      return 0
    }
  }

  return {
    loading,
    error,
    createReview,
    getHotelReviews,
    getUserReviews,
    getCompletedBookingsWithoutReview,
    getAverageRating,
  }
}