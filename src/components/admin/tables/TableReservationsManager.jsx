import React, { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../context/AuthContext'
import { formatDateDisplay } from '../../../utils/dateUtils'
import { RESERVATION_STATUS } from '../../../utils/constants'
import toast from 'react-hot-toast'
import { CheckIcon, XMarkIcon, TrashIcon } from '@heroicons/react/24/outline'

const TableReservationsManager = () => {
  const { profile } = useAuth()
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterDate, setFilterDate] = useState('')

  const canManageReservations = profile?.role && 
    ['super_admin', 'hotel_manager', 'restaurant_manager', 'receptionist'].includes(profile.role)

  useEffect(() => {
    fetchReservations()
  }, [])

  const fetchReservations = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('table_reservations')
        .select(`
          *,
          table:restaurant_tables(table_number, capacity, location),
          guest:profiles!table_reservations_guest_id_fkey(full_name, email, phone)
        `)
        .order('reservation_date', { ascending: true })
        .order('reservation_time', { ascending: true })

      if (error) throw error
      setReservations(data || [])
    } catch (error) {
      console.error('Error fetching reservations:', error)
      toast.error('Failed to load reservations')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (reservationId, newStatus) => {
    try {
      const { error } = await supabase
        .from('table_reservations')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', reservationId)

      if (error) throw error
      toast.success(`Reservation ${newStatus}`)
      fetchReservations()
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }

  const handleDelete = async (reservationId) => {
    if (!confirm('Are you sure you want to delete this reservation?')) return

    try {
      const { error } = await supabase
        .from('table_reservations')
        .delete()
        .eq('id', reservationId)

      if (error) throw error
      toast.success('Reservation deleted')
      fetchReservations()
    } catch (error) {
      console.error('Error deleting reservation:', error)
      toast.error('Failed to delete reservation')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      confirmed: 'bg-green-100 text-green-800 border-green-300',
      seated: 'bg-blue-100 text-blue-800 border-blue-300',
      completed: 'bg-gray-100 text-gray-800 border-gray-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
      no_show: 'bg-orange-100 text-orange-800 border-orange-300',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const filteredReservations = reservations.filter(res => {
    if (filterStatus !== 'all' && res.status !== filterStatus) return false
    if (filterDate && res.reservation_date !== filterDate) return false
    return true
  })

  // Get unique dates for filter
  const uniqueDates = [...new Set(reservations.map(r => r.reservation_date))].sort()

  // Stats
  const stats = {
    total: reservations.length,
    pending: reservations.filter(r => r.status === 'pending').length,
    confirmed: reservations.filter(r => r.status === 'confirmed').length,
    seated: reservations.filter(r => r.status === 'seated').length,
    today: reservations.filter(r => r.reservation_date === new Date().toISOString().split('T')[0]).length,
  }

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <p className="mt-2 text-gray-600">Loading reservations...</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Table Reservations Management</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4">
          <p className="text-sm opacity-90">Total</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-4">
          <p className="text-sm opacity-90">Pending</p>
          <p className="text-2xl font-bold">{stats.pending}</p>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white p-4">
          <p className="text-sm opacity-90">Confirmed</p>
          <p className="text-2xl font-bold">{stats.confirmed}</p>
        </div>
        <div className="card bg-gradient-to-br from-blue-400 to-blue-500 text-white p-4">
          <p className="text-sm opacity-90">Seated</p>
          <p className="text-2xl font-bold">{stats.seated}</p>
        </div>
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4">
          <p className="text-sm opacity-90">Today</p>
          <p className="text-2xl font-bold">{stats.today}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input"
            >
              <option value="all">All Statuses</option>
              {Object.entries(RESERVATION_STATUS).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="input"
            >
              <option value="">All Dates</option>
              {uniqueDates.map(date => (
                <option key={date} value={date}>{formatDateDisplay(date)}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => {
              setFilterStatus('all')
              setFilterDate('')
            }}
            className="btn btn-secondary"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Reservations Table */}
      {filteredReservations.length === 0 ? (
        <div className="card text-center py-10 text-gray-600">
          <p>No reservations found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReservations.map(reservation => (
            <div key={reservation.id} className="card hover:shadow-md transition">
              <div className="flex flex-wrap justify-between items-start gap-4">
                {/* Left side - Info */}
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(reservation.status)}`}>
                      {RESERVATION_STATUS[reservation.status]?.label || reservation.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      Booked: {formatDateDisplay(reservation.created_at)}
                    </span>
                  </div>
                  
                  <h3 className="font-semibold text-lg">
                    Table {reservation.table?.table_number} 
                    <span className="text-sm font-normal text-gray-600 ml-2">
                      ({reservation.table?.capacity} seats • {reservation.table?.location})
                    </span>
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm">
                    <div>
                      <span className="text-gray-500">Date:</span>
                      <span className="font-medium ml-2">{formatDateDisplay(reservation.reservation_date)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Time:</span>
                      <span className="font-medium ml-2">{reservation.reservation_time}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Party Size:</span>
                      <span className="font-medium ml-2">{reservation.party_size} guests</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Duration:</span>
                      <span className="font-medium ml-2">{reservation.duration_minutes} mins</span>
                    </div>
                  </div>
                </div>

                {/* Middle - Guest Info */}
                <div className="min-w-[200px]">
                  <p className="font-medium">{reservation.guest?.full_name || 'Guest'}</p>
                  <p className="text-sm text-gray-600">{reservation.guest?.email || ''}</p>
                  <p className="text-sm text-gray-600">{reservation.guest?.phone || ''}</p>
                  {reservation.occasion && (
                    <p className="text-sm mt-1">
                      <span className="text-gray-500">Occasion:</span> {reservation.occasion}
                    </p>
                  )}
                </div>

                {/* Right side - Special Requests & Actions */}
                <div className="min-w-[200px]">
                  {reservation.special_requests && (
                    <div className="mb-3 p-2 bg-yellow-50 rounded text-sm">
                      <span className="font-medium">Note:</span> {reservation.special_requests}
                    </div>
                  )}
                  
                  {canManageReservations && (
                    <div className="flex flex-wrap gap-2">
                      {reservation.status === 'pending' && (
                        <button
                          onClick={() => handleStatusChange(reservation.id, 'confirmed')}
                          className="btn bg-green-600 text-white hover:bg-green-700 text-sm px-3 py-1 flex items-center gap-1"
                        >
                          <CheckIcon className="w-4 h-4" />
                          Confirm
                        </button>
                      )}
                      {reservation.status === 'confirmed' && (
                        <button
                          onClick={() => handleStatusChange(reservation.id, 'seated')}
                          className="btn bg-blue-600 text-white hover:bg-blue-700 text-sm px-3 py-1 flex items-center gap-1"
                        >
                          <CheckIcon className="w-4 h-4" />
                          Mark Seated
                        </button>
                      )}
                      {reservation.status === 'seated' && (
                        <button
                          onClick={() => handleStatusChange(reservation.id, 'completed')}
                          className="btn bg-gray-600 text-white hover:bg-gray-700 text-sm px-3 py-1 flex items-center gap-1"
                        >
                          <CheckIcon className="w-4 h-4" />
                          Complete
                        </button>
                      )}
                      {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
                        <button
                          onClick={() => handleStatusChange(reservation.id, 'cancelled')}
                          className="btn bg-red-100 text-red-800 hover:bg-red-200 text-sm px-3 py-1 flex items-center gap-1"
                        >
                          <XMarkIcon className="w-4 h-4" />
                          Cancel
                        </button>
                      )}
                      {reservation.status === 'cancelled' && (
                        <button
                          onClick={() => handleDelete(reservation.id)}
                          className="btn bg-red-600 text-white hover:bg-red-700 text-sm px-3 py-1 flex items-center gap-1"
                        >
                          <TrashIcon className="w-4 h-4" />
                          Delete
                        </button>
                      )}
                      {reservation.status === 'completed' && (
                        <button
                          onClick={() => handleDelete(reservation.id)}
                          className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm px-3 py-1 flex items-center gap-1"
                        >
                          <TrashIcon className="w-4 h-4" />
                          Archive
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TableReservationsManager