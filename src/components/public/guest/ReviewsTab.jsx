import React, { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { supabase } from '../../../lib/supabase'
import { formatDateDisplay } from '../../../utils/dateUtils'
import { StarIcon } from '@heroicons/react/24/solid'
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from '../../common/LoadingSpinner'
import toast from 'react-hot-toast'

const ReviewsTab = () => {
  const { user } = useAuth()
  const [reviews, setReviews] = useState([])
  const [completedBookings, setCompletedBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
  })

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    setLoading(true)
    try {
      // Fetch user's existing reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('guest_reviews')
        .select(`
          *,
          booking:booking_id(
            check_in_date,
            check_out_date,
            room:rooms(room_number)
          )
        `)
        .eq('guest_id', user.id)
        .order('created_at', { ascending: false })

      if (reviewsError) throw reviewsError
      setReviews(reviewsData || [])

      // Fetch completed bookings that don't have reviews yet
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('room_bookings')
        .select(`
          id,
          check_in_date,
          check_out_date,
          room:rooms(room_number)
        `)
        .eq('guest_id', user.id)
        .eq('status', 'checked_out')
        .order('check_out_date', { ascending: false })

      if (bookingsError) throw bookingsError

      // Get IDs of bookings that already have reviews
      const reviewedBookingIds = reviewsData?.map(r => r.booking_id) || []
      
      // Filter out bookings that already have reviews
      const unreviewed = (bookingsData || []).filter(
        b => !reviewedBookingIds.includes(b.id)
      )

      setCompletedBookings(unreviewed)
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()

    if (!selectedBooking) {
      toast.error('Please select a booking')
      return
    }

    if (!formData.comment.trim()) {
      toast.error('Please write a review')
      return
    }

    setSubmitting(true)

    try {
      const { data, error } = await supabase
        .from('guest_reviews')
        .insert([{
          guest_id: user.id,
          booking_id: selectedBooking.id,
          rating: formData.rating,
          comment: formData.comment.trim(),
          is_approved: true,
          created_at: new Date().toISOString(),
        }])
        .select()
        .single()

      if (error) {
        if (error.code === '23505') {
          toast.error('You have already reviewed this booking')
        } else {
          throw error
        }
        return
      }

      toast.success('Review submitted successfully!')
      setShowForm(false)
      setSelectedBooking(null)
      setFormData({ rating: 5, comment: '' })
      loadData()
    } catch (error) {
      console.error('Submit review error:', error)
      toast.error('Failed to submit review: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const renderStars = (rating, interactive = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          interactive ? (
            <button
              key={star}
              type="button"
              onClick={() => setFormData({ ...formData, rating: star })}
              className="focus:outline-none"
            >
              {star <= formData.rating ? (
                <StarIcon className="w-6 h-6 text-yellow-400" />
              ) : (
                <StarOutlineIcon className="w-6 h-6 text-gray-300" />
              )}
            </button>
          ) : (
            star <= rating ? (
              <StarIcon key={star} className="w-5 h-5 text-yellow-400" />
            ) : (
              <StarOutlineIcon key={star} className="w-5 h-5 text-gray-300" />
            )
          )
        ))}
      </div>
    )
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">My Reviews</h3>
        {completedBookings.length > 0 && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary"
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Review Form */}
      {showForm && (
        <div className="card mb-6">
          <h4 className="font-semibold mb-4">Write a Review</h4>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Booking
            </label>
            <select
              value={selectedBooking?.id || ''}
              onChange={(e) => {
                const booking = completedBookings.find(b => b.id === e.target.value)
                setSelectedBooking(booking)
              }}
              className="input"
              required
            >
              <option value="">Select a completed stay</option>
              {completedBookings.map(booking => (
                <option key={booking.id} value={booking.id}>
                  Room {booking.room?.room_number || 'N/A'} - 
                  {formatDateDisplay(booking.check_in_date)} to {formatDateDisplay(booking.check_out_date)}
                </option>
              ))}
            </select>
          </div>

          {selectedBooking && (
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                {renderStars(0, true)}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Review
                </label>
                <textarea
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  className="input"
                  rows={4}
                  placeholder="Share your experience..."
                  required
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setSelectedBooking(null)
                    setFormData({ rating: 5, comment: '' })
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review.id} className="card">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold">
                    Room {review.booking?.room?.room_number || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatDateDisplay(review.booking?.check_in_date)} - {formatDateDisplay(review.booking?.check_out_date)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Reviewed on {formatDateDisplay(review.created_at)}
                  </p>
                </div>
                {renderStars(review.rating)}
              </div>
              <p className="text-gray-700">{review.comment}</p>
            </div>
          ))}
        </div>
      ) : !showForm && (
        <div className="text-center py-10 text-gray-600">
          <p>No reviews yet</p>
          {completedBookings.length > 0 && (
            <p className="text-sm mt-2">
              You have {completedBookings.length} completed stay{completedBookings.length !== 1 ? 's' : ''} you can review
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default ReviewsTab