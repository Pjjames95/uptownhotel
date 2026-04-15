import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PublicLayout from '../../components/public/layout/PublicLayout'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { formatDateDisplay } from '../../utils/dateUtils'
import { EVENT_TYPES } from '../../utils/constants'
import { CalendarIcon, ClockIcon, UsersIcon, MapPinIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const EventDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showBooking, setShowBooking] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [bookingData, setBookingData] = useState({
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    number_of_guests: 1,
    special_requests: '',
  })

  useEffect(() => {
    fetchEventDetails()
  }, [id])

  useEffect(() => {
    // Pre-fill user data if logged in
    if (user && profile) {
      setBookingData(prev => ({
        ...prev,
        guest_name: profile.full_name || '',
        guest_email: user.email || '',
        guest_phone: profile.phone || '',
      }))
    }
  }, [user, profile])

  const fetchEventDetails = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      setEvent(data)
    } catch (error) {
      console.error('Error fetching event:', error)
      toast.error('Failed to load event details')
    } finally {
      setLoading(false)
    }
  }

  const handleBookingSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const bookingPayload = {
        event_id: id,
        guest_id: user?.id || null,
        guest_name: bookingData.guest_name,
        guest_email: bookingData.guest_email,
        guest_phone: bookingData.guest_phone,
        number_of_guests: bookingData.number_of_guests,
        special_requests: bookingData.special_requests || null,
        status: 'pending',
      }

      const { error } = await supabase
        .from('event_bookings')
        .insert([bookingPayload])

      if (error) throw error

      toast.success('Booking request submitted successfully!')
      navigate('/events')
    } catch (error) {
      console.error('Booking error:', error)
      toast.error('Failed to submit booking request: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </PublicLayout>
    )
  }

  if (!event) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold mb-4">Event Not Found</h2>
          <button onClick={() => navigate('/events')} className="btn btn-primary">View All Events</button>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <section className="relative h-80 bg-gradient-to-r from-purple-600 to-pink-600">
        {event.image_url && <img src={event.image_url} alt={event.event_name} className="absolute inset-0 w-full h-full object-cover opacity-40" />}
        <div className="absolute inset-0 bg-black opacity-30" />
        <div className="relative h-full flex items-center">
          <div className="container mx-auto px-4 text-white">
            <h1 className="text-5xl font-bold mb-4">{event.event_name}</h1>
            <p className="text-xl">{EVENT_TYPES[event.event_type] || event.event_type}</p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="card mb-6">
                <h2 className="text-2xl font-bold mb-4">Event Description</h2>
                <p className="text-gray-700">{event.description || 'Join us for this exciting event!'}</p>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="card sticky top-20">
                <h3 className="text-xl font-semibold mb-4">Event Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 py-2 border-b">
                    <CalendarIcon className="w-5 h-5 text-blue-600" />
                    <div><p className="text-sm text-gray-600">Date</p><p className="font-semibold">{formatDateDisplay(event.event_date)}</p></div>
                  </div>
                  <div className="flex items-center gap-3 py-2 border-b">
                    <ClockIcon className="w-5 h-5 text-blue-600" />
                    <div><p className="text-sm text-gray-600">Time</p><p className="font-semibold">{event.event_time} - {event.end_time || 'Late'}</p></div>
                  </div>
                  <div className="flex items-center gap-3 py-2 border-b">
                    <UsersIcon className="w-5 h-5 text-blue-600" />
                    <div><p className="text-sm text-gray-600">Expected Guests</p><p className="font-semibold">{event.expected_guests || 'Open'}</p></div>
                  </div>
                  <div className="flex items-center gap-3 py-2 border-b">
                    <MapPinIcon className="w-5 h-5 text-blue-600" />
                    <div><p className="text-sm text-gray-600">Venue</p><p className="font-semibold">{event.venue || 'Main Hall'}</p></div>
                  </div>
                </div>

                {!showBooking ? (
                  <button onClick={() => setShowBooking(true)} className="btn btn-primary w-full mt-6">Book Your Spot</button>
                ) : (
                  <form onSubmit={handleBookingSubmit} className="mt-6 space-y-4">
                    <input type="text" placeholder="Your Name" value={bookingData.guest_name} onChange={(e) => setBookingData({...bookingData, guest_name: e.target.value})} className="input" required />
                    <input type="email" placeholder="Your Email" value={bookingData.guest_email} onChange={(e) => setBookingData({...bookingData, guest_email: e.target.value})} className="input" required />
                    <input type="tel" placeholder="Phone Number" value={bookingData.guest_phone} onChange={(e) => setBookingData({...bookingData, guest_phone: e.target.value})} className="input" required />
                    <input type="number" placeholder="Number of Guests" value={bookingData.number_of_guests} onChange={(e) => setBookingData({...bookingData, number_of_guests: parseInt(e.target.value)})} className="input" min="1" required />
                    <textarea placeholder="Special Requests" value={bookingData.special_requests} onChange={(e) => setBookingData({...bookingData, special_requests: e.target.value})} className="input" rows={2} />
                    <div className="flex gap-2">
                      <button type="submit" disabled={submitting} className="btn btn-primary flex-1">{submitting ? 'Submitting...' : 'Submit Request'}</button>
                      <button type="button" onClick={() => setShowBooking(false)} className="btn btn-secondary">Cancel</button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}

export default EventDetailPage