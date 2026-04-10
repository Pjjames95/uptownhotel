import React, { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useBookings } from '../../../hooks/useBookings'
import { formatDateDisplay, getNights } from '../../../utils/dateUtils'
import { formatCurrency } from '../../../utils/currency'
import StatusBadge from '../../common/StatusBadge'
import LoadingSpinner from '../../common/LoadingSpinner'
import { CalendarIcon, UsersIcon } from '@heroicons/react/24/outline'

const BookingHistoryTab = () => {
  const { user } = useAuth()
  const { getBookingsByGuest, loading } = useBookings()
  const [bookings, setBookings] = useState([])

  useEffect(() => {
    fetchBookings()
  }, [user])

  const fetchBookings = async () => {
    const data = await getBookingsByGuest(user.id)
    setBookings(data)
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">My Room Bookings</h3>

      {bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map(booking => (
            <div key={booking.id} className="border rounded-lg p-4 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-sm text-gray-600">Booking Reference</p>
                  <p className="font-mono font-semibold">{booking.booking_reference}</p>
                </div>
                <StatusBadge status={booking.status} />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
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
                  <p className="text-xs text-gray-600 uppercase">Nights</p>
                  <p className="font-medium mt-1">{getNights(booking.check_in_date, booking.check_out_date)}</p>
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
                <p className="text-lg font-bold text-blue-600">
                  {formatCurrency(booking.total_amount)}
                </p>
              </div>

              {booking.special_requests && (
                <div className="mt-3 bg-gray-50 p-3 rounded">
                  <p className="text-xs text-gray-600 uppercase">Special Requests</p>
                  <p className="text-sm text-gray-900 mt-1">{booking.special_requests}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-600">
          <p>No room bookings yet</p>
        </div>
      )}
    </div>
  )
}

export default BookingHistoryTab