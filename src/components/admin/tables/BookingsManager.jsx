import React, { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import DataTable from '../../common/DataTable'
import { formatDateDisplay } from '../../../utils/dateUtils'
import { formatCurrency } from '../../../utils/currency'
import StatusBadge from '../../common/StatusBadge'
import toast from 'react-hot-toast'

const BookingsManager = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState(null)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('room_bookings')
        .select('*, guest:profiles(full_name), room:rooms(room_number)')
        .order('check_in_date', { ascending: false })

      if (error) throw error
      setBookings(data || [])
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      const { error } = await supabase
        .from('room_bookings')
        .update({ status: newStatus })
        .eq('id', bookingId)

      if (error) throw error
      toast.success('Booking status updated')
      fetchBookings()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleDelete = async (bookingId) => {
    if (!confirm('Are you sure you want to delete this booking?')) return

    try {
      const { error } = await supabase
        .from('room_bookings')
        .delete()
        .eq('id', bookingId)

      if (error) throw error
      toast.success('Booking deleted')
      fetchBookings()
    } catch (error) {
      toast.error(error.message)
    }
  }

  if (loading) return <div className="text-center py-10">Loading bookings...</div>

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Room Bookings Management</h2>

      <div className="bg-white rounded-lg shadow-md p-6 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Reference</th>
              <th className="px-4 py-2 text-left">Guest</th>
              <th className="px-4 py-2 text-left">Room</th>
              <th className="px-4 py-2 text-left">Check-in</th>
              <th className="px-4 py-2 text-left">Check-out</th>
              <th className="px-4 py-2 text-left">Total</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(booking => (
              <tr key={booking.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2 font-mono text-sm">{booking.booking_reference}</td>
                <td className="px-4 py-2">{booking.guest?.full_name}</td>
                <td className="px-4 py-2">{booking.room?.room_number}</td>
                <td className="px-4 py-2">{formatDateDisplay(booking.check_in_date)}</td>
                <td className="px-4 py-2">{formatDateDisplay(booking.check_out_date)}</td>
                <td className="px-4 py-2 font-semibold">{formatCurrency(booking.total_amount)}</td>
                <td className="px-4 py-2">
                  <select
                    value={booking.status}
                    onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                    className="px-2 py-1 border rounded text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="checked_in">Checked In</option>
                    <option value="checked_out">Checked Out</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => handleDelete(booking.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default BookingsManager