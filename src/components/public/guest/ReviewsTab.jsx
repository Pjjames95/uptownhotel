import React, { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useReviews } from '../../../hooks/useReviews'
import { supabase } from '../../../lib/supabase'
import { formatDateDisplay } from '../../../utils/dateUtils'
import { StarIcon } from '@heroicons/react/24/solid'
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from '../../common/LoadingSpinner'
import toast from 'react-hot-toast'

const ReviewsTab = () => {
  const { user } = useAuth()
  const { createReview, loading } = useReviews()
  const [reviews, setReviews] = useState([])
  const [completedBookings, setCompletedBookings] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
  })

  useEffect(() => {
    fetchUserReviews()
    fetchCompletedBookings()
  }, [user])

  const fetchUserReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('guest_reviews')
        .select('*, booking:room_bookings(check_in_date, check_out_date, room:rooms(room_number))')
        .eq('guest_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setReviews(data || [])
    } catch (error) {
      console.error('Error fetching reviews:', error)
    }
  }

  const fetchCompletedBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('room_bookings')
        .select('id, check_in_date, check_out_date, room:rooms(room_number)')
        .eq('guest_id', user.id)
        .eq('status', 'checked_out')

      if (error) throw error

      // Filter out bookings that already have reviews
      const { data: existingReviews } = await supabase
        .from('guest_reviews')
        .select('booking_id')
        .eq('guest_id', user.id)

      const reviewedBookingIds = (existingReviews || []).map(r => r.booking_id)
      const unreviewed = (data || []).filter(b => !reviewedBookingIds.includes(b.id))

      setCompletedBookings(unreviewed)
    } catch (error) {
      console.error('Error fetching bookings:', error)
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()

    const result = await createReview({
      guest_id: user.id,
      booking_id: selectedBooking.id,
      ...formData,
    })

    if (result.success) {
      toast.success('Review submitted successfully!')
      setShowForm(false)
      setSelectedBooking(null)
      setFormData({ rating: 5, comment: '' })
      fetchUserReviews()
      fetchCompletedBookings()
    } else {
      toast.error('Failed to submit review')
    }
  }

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          star <= rating ? (
            <StarIcon key={star} className="w-5 h-5 text-yellow-400" />
          ) : (
            <StarOutlineIcon key={star} className="w-5 h-5 text-gray-300" />
          )
        ))}
      </div>
    )
  }

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
                  Room {booking.room?.room_number} - {formatDateDisplay(booking.check_in_date)} to {formatDateDisplay(booking.check_out_date)}
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
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="focus:outline-none"
                    >
                      {star <= formData.rating ? (
                        <StarIcon className="w-8 h-8 text-yellow-400" />
                      ) : (
                        <StarOutlineIcon className="w-8 h-8 text-gray-300" />
                      )}
                    </button>
                  ))}
                </div>
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
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? 'Submitting...' : 'Submit Review'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setSelectedBooking(null)
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
                    Room {review.booking?.room?.room_number}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatDateDisplay(review.created_at)}
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
        </div>
      )}
    </div>
  )
}

export default ReviewsTab