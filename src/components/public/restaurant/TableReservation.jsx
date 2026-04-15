import React, { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { supabase } from '../../../lib/supabase'
import { formatDateDisplay } from '../../../utils/dateUtils'
import { 
  CalendarIcon, ClockIcon, UsersIcon, MapPinIcon,
  ArrowLeftIcon, CheckCircleIcon 
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const TableReservation = ({ onBack }) => {
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [availableTables, setAvailableTables] = useState([])
  const [selectedTable, setSelectedTable] = useState(null)
  const [loading, setLoading] = useState(false)
  const [reservationData, setReservationData] = useState({
    reservation_date: '',
    reservation_time: '',
    party_size: 2,
    duration_minutes: 90,
    occasion: '',
    special_requests: '',
  })

  const occasions = ['Birthday', 'Anniversary', 'Business Meeting', 'Date Night', 'Family Dinner', 'Other']
  const durations = [
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' },
    { value: 180, label: '3 hours' },
  ]

  const handleCheckAvailability = async () => {
    // Validate inputs
    if (!reservationData.reservation_date || !reservationData.reservation_time) {
      toast.error('Please select date and time')
      return
    }

    if (!reservationData.party_size || reservationData.party_size < 1) {
      toast.error('Please select party size')
      return
    }

    setLoading(true)
    console.log('Checking availability for:', reservationData)

    try {
      // First, check if there are any tables at all
      const { count: totalTables, error: countError } = await supabase
        .from('restaurant_tables')
        .select('*', { count: 'exact', head: true })

      if (countError) {
        console.error('Count error:', countError)
        throw countError
      }

      console.log('Total tables in database:', totalTables)

      if (totalTables === 0) {
        toast.error('No tables configured. Please contact administration.')
        setAvailableTables([])
        setStep(2)
        setLoading(false)
        return
      }

      // Get all tables that can accommodate the party size
      const { data: allTables, error: tablesError } = await supabase
        .from('restaurant_tables')
        .select('*')
        .gte('capacity', reservationData.party_size)
        .eq('is_available', true)

      if (tablesError) {
        console.error('Tables error:', tablesError)
        throw tablesError
      }

      console.log('Tables with sufficient capacity:', allTables)

      if (!allTables || allTables.length === 0) {
        toast.error(`No tables available for ${reservationData.party_size} guests`)
        setAvailableTables([])
        setStep(2)
        setLoading(false)
        return
      }

      // Get booked tables for that time
      const { data: bookedTables, error: bookingsError } = await supabase
        .from('table_reservations')
        .select('table_id')
        .eq('reservation_date', reservationData.reservation_date)
        .eq('reservation_time', reservationData.reservation_time)
        .in('status', ['pending', 'confirmed', 'seated'])

      if (bookingsError) {
        console.error('Bookings error:', bookingsError)
        throw bookingsError
      }

      console.log('Booked tables:', bookedTables)

      const bookedTableIds = (bookedTables || []).map(b => b.table_id)
      const available = allTables.filter(t => !bookedTableIds.includes(t.id))

      console.log('Available tables:', available)

      setAvailableTables(available)
      setStep(2)
      setLoading(false)

      if (available.length === 0) {
        toast.error('No tables available for this time slot. Please try another time.')
      } else {
        toast.success(`${available.length} table(s) available!`)
      }
    } catch (error) {
      console.error('Error checking availability:', error)
      toast.error('Failed to check availability: ' + error.message)
      setLoading(false)
    }
  }

  const handleSubmitReservation = async (e) => {
    e.preventDefault()

    if (!selectedTable) {
      toast.error('Please select a table')
      return
    }

    if (!user) {
      toast.error('Please login to make a reservation')
      return
    }

    setLoading(true)

    try {
      const reservation = {
        guest_id: user.id,
        table_id: selectedTable.id,
        reservation_date: reservationData.reservation_date,
        reservation_time: reservationData.reservation_time,
        party_size: reservationData.party_size,
        duration_minutes: reservationData.duration_minutes,
        occasion: reservationData.occasion || null,
        special_requests: reservationData.special_requests || null,
        status: 'pending',
      }

      const { data, error } = await supabase
        .from('table_reservations')
        .insert([reservation])
        .select()

      if (error) throw error

      toast.success('Reservation confirmed!')
      setStep(3)
    } catch (error) {
      console.error('Error creating reservation:', error)
      toast.error('Failed to create reservation: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setReservationData(prev => ({ ...prev, [name]: value }))
  }

  const resetForm = () => {
    setStep(1)
    setAvailableTables([])
    setSelectedTable(null)
    setReservationData({
      reservation_date: '',
      reservation_time: '',
      party_size: 2,
      duration_minutes: 90,
      occasion: '',
      special_requests: '',
    })
  }

  const today = new Date().toISOString().split('T')[0]
  const maxDate = new Date()
  maxDate.setMonth(maxDate.getMonth() + 3)
  const maxDateStr = maxDate.toISOString().split('T')[0]

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {onBack && (
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Menu
        </button>
      )}

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>1</div>
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>2</div>
            <div className={`w-16 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>3</div>
          </div>
        </div>
      </div>

      {/* Step 1: Reservation Details */}
      {step === 1 && (
        <div className="card">
          <h2 className="text-2xl font-bold mb-6">Reservation Details</h2>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                <input type="date" name="reservation_date" value={reservationData.reservation_date} onChange={handleChange}
                  min={today} max={maxDateStr} className="input" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time *</label>
                <select name="reservation_time" value={reservationData.reservation_time} onChange={handleChange} className="input" required>
                  <option value="">Select time</option>
                  <option value="06:00">6:00 AM</option><option value="07:00">7:00 AM</option><option value="08:00">8:00 AM</option>
                  <option value="12:00">12:00 PM</option><option value="13:00">1:00 PM</option><option value="18:00">6:00 PM</option>
                  <option value="19:00">7:00 PM</option><option value="20:00">8:00 PM</option><option value="21:00">9:00 PM</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Party Size *</label>
                <select name="party_size" value={reservationData.party_size} onChange={handleChange} className="input">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(num => <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                <select name="duration_minutes" value={reservationData.duration_minutes} onChange={handleChange} className="input">
                  {durations.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Occasion (Optional)</label>
              <select name="occasion" value={reservationData.occasion} onChange={handleChange} className="input">
                <option value="">Select occasion</option>
                {occasions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests (Optional)</label>
              <textarea name="special_requests" value={reservationData.special_requests} onChange={handleChange}
                className="input" rows={3} placeholder="Any dietary restrictions, seating preferences..." />
            </div>

            <button onClick={handleCheckAvailability} disabled={loading} className="btn btn-primary w-full">
              {loading ? 'Checking...' : 'Check Availability'}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Select Table */}
      {step === 2 && (
        <div className="card">
          <h2 className="text-2xl font-bold mb-6">Select a Table</h2>
          
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800">
              <span className="font-medium">Reservation for:</span>{' '}
              {formatDateDisplay(reservationData.reservation_date)} at {reservationData.reservation_time}
              {' • '}{reservationData.party_size} {reservationData.party_size === 1 ? 'guest' : 'guests'}
            </p>
          </div>

          {loading ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : availableTables.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableTables.map(table => (
                  <div key={table.id} onClick={() => setSelectedTable(table)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition ${selectedTable?.id === table.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg">Table {table.table_number}</h3>
                        <p className="text-sm text-gray-600 capitalize">{table.location}</p>
                      </div>
                      <div className="bg-gray-100 px-3 py-1 rounded-full text-sm">Seats {table.capacity}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 mt-6">
                <button onClick={() => setStep(1)} className="btn btn-secondary flex-1">Back</button>
                <button onClick={handleSubmitReservation} disabled={!selectedTable || loading} className="btn btn-primary flex-1">
                  {loading ? 'Processing...' : 'Confirm Reservation'}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-600 mb-4">No tables available for this time.</p>
              <button onClick={() => setStep(1)} className="btn btn-primary">Change Date/Time</button>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step === 3 && (
        <div className="card text-center">
          <CheckCircleIcon className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Reservation Confirmed!</h2>
          <p className="text-gray-600 mb-6">Thank you for your reservation.</p>
          <button onClick={resetForm} className="btn btn-primary">Make Another Reservation</button>
        </div>
      )}
    </div>
  )
}

export default TableReservation