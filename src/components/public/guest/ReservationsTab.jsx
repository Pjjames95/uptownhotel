import React, { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { supabase } from '../../../lib/supabase'
import { formatDateDisplay } from '../../../utils/dateUtils'
import StatusBadge from '../../common/StatusBadge'
import LoadingSpinner from '../../common/LoadingSpinner'
import { CalendarIcon, UsersIcon, ClockIcon } from '@heroicons/react/24/outline'

const ReservationsTab = () => {
  const { user } = useAuth()
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReservations()
  }, [user])

  const fetchReservations = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('table_reservations')
        .select('*, table:restaurant_tables(table_number, location)')
        .eq('guest_id', user.id)
        .order('reservation_date', { ascending: false })

      if (error) throw error
      setReservations(data || [])
    } catch (error) {
      console.error('Error fetching reservations:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">My Table Reservations</h3>

      {reservations.length > 0 ? (
        <div className="space-y-4">
          {reservations.map(reservation => (
            <div key={reservation.id} className="border rounded-lg p-4 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-sm text-gray-600">Table</p>
                  <p className="font-semibold">
                    Table #{reservation.table?.table_number} ({reservation.table?.location})
                  </p>
                </div>
                <StatusBadge status={reservation.status} />
              </div>

              <div className="grid grid-cols-3 gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-600">Date</p>
                    <p className="font-medium">{formatDateDisplay(reservation.reservation_date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-600">Time</p>
                    <p className="font-medium">{reservation.reservation_time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <UsersIcon className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-600">Party Size</p>
                    <p className="font-medium">{reservation.party_size}</p>
                  </div>
                </div>
              </div>

              {reservation.occasion && (
                <div className="mb-3">
                  <p className="text-xs text-gray-600">Occasion</p>
                  <p className="text-sm">{reservation.occasion}</p>
                </div>
              )}

              {reservation.special_requests && (
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs text-gray-600">Special Requests</p>
                  <p className="text-sm">{reservation.special_requests}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-600">
          <p>No table reservations yet</p>
          <button className="btn btn-primary mt-4">
            Make a Reservation
          </button>
        </div>
      )}
    </div>
  )
}

export default ReservationsTab