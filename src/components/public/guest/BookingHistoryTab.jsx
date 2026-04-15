import React, { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useBookings } from '../../../hooks/useBookings'
import { formatDateDisplay, getNights } from '../../../utils/dateUtils'
import { formatCurrency } from '../../../utils/currency'
import { CalendarIcon, UsersIcon } from '@heroicons/react/24/outline'
import PaymentModal from '../../common/PaymentModal'
import toast from 'react-hot-toast'

const BookingHistoryTab = () => {
  const { user } = useAuth()
  const { getBookingsByGuest, confirmBooking, cancelBooking, loading } = useBookings()
  const [bookings, setBookings] = useState([])
  const [selectedPaymentBooking, setSelectedPaymentBooking] = useState(null)

  useEffect(() => {
    if (user) {
      fetchBookings()
    }
  }, [user])

  const fetchBookings = async () => {
    const data = await getBookingsByGuest(user.id)
    setBookings(data)
  }

  const handleConfirmBooking = async (bookingId) => {
    if (!confirm('Confirm this booking? Payment will be required.')) return
    
    // Show loading toast
    const loadingToast = toast.loading('Confirming booking...')
    
    const result = await confirmBooking(bookingId)
    
    toast.dismiss(loadingToast)
    
    if (result.success) {
      toast.success('Booking confirmed! Proceed to payment.')
      fetchBookings() // Refresh the list
    } else {
      toast.error('Failed to confirm booking: ' + (result.error || 'Unknown error'))
    }
  }

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return
    
    const result = await cancelBooking(bookingId)
    if (result.success) {
      toast.success('Booking cancelled')
      fetchBookings()
    } else {
      toast.error('Failed to cancel booking')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      checked_in: 'bg-blue-100 text-blue-800',
      checked_out: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: 'bg-orange-100 text-orange-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">My Room Bookings</h3>

      {bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map(booking => {
            const roomType = booking.room?.room_type
            
            return (
              <div key={booking.id} className="border rounded-lg p-4 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-sm text-gray-600">Booking Reference</p>
                    <p className="font-mono font-semibold">{booking.booking_reference}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm ${getPaymentStatusColor(booking.payment_status)}`}>
                      {booking.payment_status === 'completed' ? 'Paid' : 'Payment Pending'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-600 uppercase">Room</p>
                    <p className="font-medium">Room {booking.room?.room_number}</p>
                    <p className="text-xs text-gray-500">{roomType?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase">Check-in</p>
                    <div className="flex items-center gap-2 mt-1">
                      <CalendarIcon className="w-4 h-4 text-gray-400" />
                      <p className="font-medium">{formatDateDisplay(booking.check_in_date)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase">Check-out</p>
                    <div className="flex items-center gap-2 mt-1">
                      <CalendarIcon className="w-4 h-4 text-gray-400" />
                      <p className="font-medium">{formatDateDisplay(booking.check_out_date)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase">Guests</p>
                    <div className="flex items-center gap-2 mt-1">
                      <UsersIcon className="w-4 h-4 text-gray-400" />
                      <p className="font-medium">{booking.number_of_guests}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-bold text-blue-600">
                        {formatCurrency(booking.total_amount)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {booking.price_per_night && `${formatCurrency(booking.price_per_night)}/night • `}
                        {getNights(booking.check_in_date, booking.check_out_date)} nights
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      {booking.status === 'pending' && (
                        <button
                          onClick={() => handleConfirmBooking(booking.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                        >
                          Confirm Booking
                        </button>
                      )}
                      
                      {booking.status === 'confirmed' && booking.payment_status !== 'completed' && (
                        <button
                          onClick={() => setSelectedPaymentBooking(booking)}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        >
                          Pay Now
                        </button>
                      )}
                      
                      {(booking.status === 'pending' || booking.status === 'confirmed') && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200 text-sm"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {booking.special_requests && (
                  <div className="mt-3 bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-600 uppercase">Special Requests</p>
                    <p className="text-sm text-gray-900 mt-1">{booking.special_requests}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-600">
          <p>No room bookings yet</p>
        </div>
      )}

      {selectedPaymentBooking && (
        <PaymentModal
          booking={selectedPaymentBooking}
          onClose={() => setSelectedPaymentBooking(null)}
          onSuccess={() => {
            fetchBookings()
            setSelectedPaymentBooking(null)
          }}
        />
      )}
    </div>
  )
}

export default BookingHistoryTab