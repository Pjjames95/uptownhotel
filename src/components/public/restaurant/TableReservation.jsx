import React, { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useTableReservations } from '../../../hooks/useTableReservations'
import { formatDateDisplay, validateReservationTime } from '../../../utils/dateUtils'
import { 
  CalendarIcon, 
  ClockIcon, 
  UsersIcon, 
  MapPinIcon,
  ArrowLeftIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const TableReservation = ({ onBack }) => {
  const { user } = useAuth()
  const { getAvailableTables, createReservation, loading } = useTableReservations()
  const [step, setStep] = useState(1)
  const [availableTables, setAvailableTables] = useState([])
  const [selectedTable, setSelectedTable] = useState(null)
  const [reservationData, setReservationData] = useState({
    reservation_date: '',
    reservation_time: '',
    party_size: 2,
    duration_minutes: 90,
    occasion: '',
    special_requests: '',
  })

  const occasions = [
    'Birthday',
    'Anniversary',
    'Business Meeting',
    'Date Night',
    'Family Dinner',
    'Other',
  ]

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

    const timeValidation = validateReservationTime(
      reservationData.reservation_date,
      reservationData.reservation_time
    )
    if (!timeValidation.valid) {
      toast.error(timeValidation.error)
      return
    }

    const tables = await getAvailableTables(
      reservationData.reservation_date,
      reservationData.reservation_time,
      reservationData.party_size
    )

    setAvailableTables(tables)
    setStep(2)
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

    const result = await createReservation(reservation)

    if (result.success) {
      setStep(3)
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

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0]
  const maxDate = new Date()
  maxDate.setMonth(maxDate.getMonth() + 3)
  const maxDateStr = maxDate.toISOString().split('T')[0]

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back to Menu
          </button>
        )}
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              1
            </div>
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              2
            </div>
            <div className={`w-16 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              3
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-16 mt-2 text-sm">
          <span className={step >= 1 ? 'text-blue-600 font-medium' : 'text-gray-500'}>
            Details
          </span>
          <span className={step >= 2 ? 'text-blue-600 font-medium' : 'text-gray-500'}>
            Select Table
          </span>
          <span className={step >= 3 ? 'text-blue-600 font-medium' : 'text-gray-500'}>
            Confirmation
          </span>
        </div>
      </div>

      {/* Step 1: Reservation Details */}
      {step === 1 && (
        <div className="card">
          <h2 className="text-2xl font-bold mb-6">Reservation Details</h2>
          
          <div className="space-y-6">
            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CalendarIcon className="w-4 h-4 inline mr-1" />
                  Date
                </label>
                <input
                  type="date"
                  name="reservation_date"
                  value={reservationData.reservation_date}
                  onChange={handleChange}
                  min={today}
                  max={maxDateStr}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <ClockIcon className="w-4 h-4 inline mr-1" />
                  Time
                </label>
                <select
                  name="reservation_time"
                  value={reservationData.reservation_time}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  <option value="">Select time</option>
                  <option value="06:00">6:00 AM</option>
                  <option value="06:30">6:30 AM</option>
                  <option value="07:00">7:00 AM</option>
                  <option value="07:30">7:30 AM</option>
                  <option value="08:00">8:00 AM</option>
                  <option value="08:30">8:30 AM</option>
                  <option value="09:00">9:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="12:30">12:30 PM</option>
                  <option value="13:00">1:00 PM</option>
                  <option value="13:30">1:30 PM</option>
                  <option value="18:00">6:00 PM</option>
                  <option value="18:30">6:30 PM</option>
                  <option value="19:00">7:00 PM</option>
                  <option value="19:30">7:30 PM</option>
                  <option value="20:00">8:00 PM</option>
                  <option value="20:30">8:30 PM</option>
                  <option value="21:00">9:00 PM</option>
                </select>
              </div>
            </div>

            {/* Party Size and Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <UsersIcon className="w-4 h-4 inline mr-1" />
                  Party Size
                </label>
                <select
                  name="party_size"
                  value={reservationData.party_size}
                  onChange={handleChange}
                  className="input"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Guest' : 'Guests'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <select
                  name="duration_minutes"
                  value={reservationData.duration_minutes}
                  onChange={handleChange}
                  className="input"
                >
                  {durations.map(d => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Occasion */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Occasion (Optional)
              </label>
              <select
                name="occasion"
                value={reservationData.occasion}
                onChange={handleChange}
                className="input"
              >
                <option value="">Select occasion</option>
                {occasions.map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>

            {/* Special Requests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Requests (Optional)
              </label>
              <textarea
                name="special_requests"
                value={reservationData.special_requests}
                onChange={handleChange}
                className="input"
                rows={3}
                placeholder="Any dietary restrictions, seating preferences, or special occasions..."
              />
            </div>

            <button
              onClick={handleCheckAvailability}
              className="btn btn-primary w-full"
            >
              Check Availability
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
              <p className="mt-2 text-gray-600">Checking availability...</p>
            </div>
          ) : availableTables.length > 0 ? (
            <div className="space-y-4">
              <p className="text-gray-600">
                {availableTables.length} table{availableTables.length > 1 ? 's' : ''} available
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableTables.map(table => (
                  <div
                    key={table.id}
                    onClick={() => setSelectedTable(table)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                      selectedTable?.id === table.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg">Table {table.table_number}</h3>
                        <p className="text-sm text-gray-600 capitalize">{table.location}</p>
                      </div>
                      <div className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                        Seats {table.capacity}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPinIcon className="w-4 h-4" />
                      <span className="capitalize">{table.location} seating</span>
                    </div>
                    
                    {table.description && (
                      <p className="mt-2 text-sm text-gray-600">{table.description}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="btn btn-secondary flex-1"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmitReservation}
                  disabled={!selectedTable || loading}
                  className="btn btn-primary flex-1 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Confirm Reservation'}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-600 mb-4">No tables available for this time.</p>
              <p className="text-sm text-gray-500 mb-6">
                Please try a different time or date.
              </p>
              <button
                onClick={() => setStep(1)}
                className="btn btn-primary"
              >
                Change Date/Time
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step === 3 && (
        <div className="card text-center">
          <div className="mb-6">
            <CheckCircleIcon className="w-16 h-16 text-green-600 mx-auto" />
          </div>
          
          <h2 className="text-2xl font-bold mb-4">Reservation Confirmed!</h2>
          
          <p className="text-gray-600 mb-6">
            Thank you for your reservation. We've sent a confirmation email with all the details.
          </p>

          <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
            <h3 className="font-semibold mb-4">Reservation Details</h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{formatDateDisplay(reservationData.reservation_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium">{reservationData.reservation_time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Party Size:</span>
                <span className="font-medium">{reservationData.party_size} guests</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Table:</span>
                <span className="font-medium">Table {selectedTable?.table_number}</span>
              </div>
              {reservationData.occasion && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Occasion:</span>
                  <span className="font-medium">{reservationData.occasion}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={resetForm}
              className="btn btn-primary flex-1"
            >
              Make Another Reservation
            </button>
            {onBack && (
              <button
                onClick={onBack}
                className="btn btn-secondary"
              >
                Back to Menu
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default TableReservation