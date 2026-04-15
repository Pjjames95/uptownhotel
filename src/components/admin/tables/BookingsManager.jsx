import React, { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../context/AuthContext'
import { formatDateDisplay, getNights } from '../../../utils/dateUtils'
import { formatCurrency } from '../../../utils/currency'
import { BOOKING_STATUS } from '../../../utils/constants'
import PaymentModal from '../../common/PaymentModal'
import toast from 'react-hot-toast'
import { 
  CreditCardIcon, 
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

const BookingsManager = () => {
  const { profile } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('all')
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    checkedIn: 0,
    checkedOut: 0,
    cancelled: 0,
    paidAmount: 0,
    pendingAmount: 0
  })

  const canManageBookings = profile?.role && 
    ['super_admin', 'hotel_manager', 'receptionist'].includes(profile.role)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('room_bookings')
        .select(`
          *,
          room:rooms!room_bookings_room_id_fkey(
            room_number,
            room_type:room_types(name, code)
          ),
          guest:profiles!room_bookings_guest_id_fkey(full_name, email, phone)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      console.log('Fetched bookings:', data)
      setBookings(data || [])
      calculateStats(data || [])
    } catch (error) {
      console.error('Error fetching bookings:', error)
      toast.error('Failed to load bookings: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (bookingsData) => {
    const stats = {
      total: bookingsData.length,
      pending: 0,
      confirmed: 0,
      checkedIn: 0,
      checkedOut: 0,
      cancelled: 0,
      paidAmount: 0,
      pendingAmount: 0
    }

    bookingsData.forEach(booking => {
      // Count by status
      if (booking.status === 'pending') stats.pending++
      else if (booking.status === 'confirmed') stats.confirmed++
      else if (booking.status === 'checked_in') stats.checkedIn++
      else if (booking.status === 'checked_out') stats.checkedOut++
      else if (booking.status === 'cancelled') stats.cancelled++

      // Calculate amounts
      if (booking.payment_status === 'completed') {
        stats.paidAmount += booking.total_amount || 0
      } else if (booking.status !== 'cancelled') {
        stats.pendingAmount += booking.total_amount || 0
      }
    })

    setStats(stats)
  }

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      const updates = { 
        status: newStatus,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('room_bookings')
        .update(updates)
        .eq('id', bookingId)

      if (error) throw error

      toast.success('Booking status updated')
      fetchBookings()
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status: ' + error.message)
    }
  }

  const handleDelete = async (bookingId) => {
    if (!confirm('Are you sure you want to delete this booking? This action cannot be undone.')) return

    try {
      const { error } = await supabase
        .from('room_bookings')
        .delete()
        .eq('id', bookingId)

      if (error) throw error
      toast.success('Booking deleted')
      fetchBookings()
    } catch (error) {
      console.error('Error deleting booking:', error)
      toast.error('Failed to delete booking: ' + error.message)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      confirmed: 'bg-green-100 text-green-800 border-green-300',
      checked_in: 'bg-blue-100 text-blue-800 border-blue-300',
      checked_out: 'bg-gray-100 text-gray-800 border-gray-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getPaymentStatusBadge = (paymentStatus) => {
    const statuses = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon, label: 'Pending' },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, label: 'Paid' },
      failed: { color: 'bg-red-100 text-red-800', icon: XCircleIcon, label: 'Failed' },
      refunded: { color: 'bg-purple-100 text-purple-800', icon: XCircleIcon, label: 'Refunded' }
    }
    return statuses[paymentStatus] || statuses.pending
  }

  const filteredBookings = bookings.filter(booking => {
    if (filterStatus !== 'all' && booking.status !== filterStatus) return false
    if (filterPaymentStatus !== 'all' && booking.payment_status !== filterPaymentStatus) return false
    return true
  })

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <p className="mt-2 text-gray-600">Loading bookings...</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Room Bookings Management</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-3 text-white">
          <p className="text-xs opacity-90">Total</p>
          <p className="text-xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-3 text-white">
          <p className="text-xs opacity-90">Pending</p>
          <p className="text-xl font-bold">{stats.pending}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-3 text-white">
          <p className="text-xs opacity-90">Confirmed</p>
          <p className="text-xl font-bold">{stats.confirmed}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg p-3 text-white">
          <p className="text-xs opacity-90">Checked In</p>
          <p className="text-xl font-bold">{stats.checkedIn}</p>
        </div>
        <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg p-3 text-white">
          <p className="text-xs opacity-90">Checked Out</p>
          <p className="text-xl font-bold">{stats.checkedOut}</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-3 text-white">
          <p className="text-xs opacity-90">Cancelled</p>
          <p className="text-xl font-bold">{stats.cancelled}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg p-3 text-white">
          <p className="text-xs opacity-90">Paid Amount</p>
          <p className="text-lg font-bold">{formatCurrency(stats.paidAmount)}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-3 text-white">
          <p className="text-xs opacity-90">Pending Amount</p>
          <p className="text-lg font-bold">{formatCurrency(stats.pendingAmount)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Booking Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input text-sm w-40"
            >
              <option value="all">All Statuses</option>
              {Object.entries(BOOKING_STATUS).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Payment Status</label>
            <select
              value={filterPaymentStatus}
              onChange={(e) => setFilterPaymentStatus(e.target.value)}
              className="input text-sm w-40"
            >
              <option value="all">All Payments</option>
              <option value="pending">Pending</option>
              <option value="completed">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          <button
            onClick={() => {
              setFilterStatus('all')
              setFilterPaymentStatus('all')
            }}
            className="btn btn-secondary text-sm"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="card text-center py-10 text-gray-600">
          <p>No bookings found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map(booking => {
            const paymentStatusBadge = getPaymentStatusBadge(booking.payment_status || 'pending')
            const PaymentIcon = paymentStatusBadge.icon

            return (
              <div key={booking.id} className="card hover:shadow-md transition">
                <div className="flex flex-wrap justify-between items-start gap-4">
                  {/* Left - Booking Info */}
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded">
                        {booking.booking_reference || 'N/A'}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                        {BOOKING_STATUS[booking.status]?.label || booking.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${paymentStatusBadge.color}`}>
                        <PaymentIcon className="w-4 h-4 inline mr-1" />
                        {paymentStatusBadge.label}
                      </span>
                    </div>
                    
                    <h3 className="font-semibold text-lg">
                      {booking.guest?.full_name || 'Guest'}
                    </h3>
                    <p className="text-sm text-gray-600">{booking.guest?.email}</p>
                    <p className="text-sm text-gray-600">{booking.guest?.phone}</p>
                  </div>

                  {/* Middle - Room & Dates */}
                  <div className="min-w-[250px]">
                    <p className="font-medium">
                      Room {booking.room?.room_number}
                    </p>
                    {/* FIXED: Access room_type.name instead of room_type object */}
                    <p className="text-sm text-gray-600">
                      {booking.room?.room_type?.name || 'Standard Room'}
                    </p>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                      <div>
                        <span className="text-gray-500">Check-in:</span>
                        <span className="font-medium ml-2">{formatDateDisplay(booking.check_in_date)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Check-out:</span>
                        <span className="font-medium ml-2">{formatDateDisplay(booking.check_out_date)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Nights:</span>
                        <span className="font-medium ml-2">{getNights(booking.check_in_date, booking.check_out_date)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Guests:</span>
                        <span className="font-medium ml-2">{booking.number_of_guests}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right - Amount & Actions */}
                  <div className="min-w-[200px]">
                    <div className="mb-3">
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="text-xl font-bold text-blue-600">
                        {formatCurrency(booking.total_amount)}
                      </p>
                      {booking.payment_method && (
                        <p className="text-xs text-gray-500 capitalize">
                          via {booking.payment_method}
                          {booking.mpesa_receipt && ` • ${booking.mpesa_receipt}`}
                        </p>
                      )}
                    </div>

                    {booking.special_requests && (
                      <div className="mb-3 p-2 bg-yellow-50 rounded text-sm">
                        <span className="font-medium">Note:</span> {booking.special_requests}
                      </div>
                    )}

                    {canManageBookings && (
                      <div className="flex flex-wrap gap-2">
                        <select
                          value={booking.status}
                          onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                          className={`text-sm border rounded px-2 py-1 ${getStatusColor(booking.status)}`}
                        >
                          {Object.keys(BOOKING_STATUS).map(status => (
                            <option key={status} value={status}>
                              {BOOKING_STATUS[status]?.label || status}
                            </option>
                          ))}
                        </select>

                        {(booking.status === 'confirmed' || booking.status === 'checked_in') && 
                         booking.payment_status !== 'completed' && (
                          <button
                            onClick={() => setSelectedBookingForPayment(booking)}
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 flex items-center gap-1"
                          >
                            <CreditCardIcon className="w-4 h-4" />
                            Pay
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(booking.id)}
                          className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200 flex items-center gap-1"
                        >
                          <TrashIcon className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Payment Modal */}
      {selectedBookingForPayment && (
        <PaymentModal
          booking={selectedBookingForPayment}
          onClose={() => setSelectedBookingForPayment(null)}
          onSuccess={() => {
            fetchBookings()
            setSelectedBookingForPayment(null)
          }}
        />
      )}
    </div>
  )
}

export default BookingsManager