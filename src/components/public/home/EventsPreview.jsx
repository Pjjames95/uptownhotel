import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../../lib/supabase'
import { formatDateDisplay } from '../../../utils/dateUtils'
import { CalendarIcon, UsersIcon } from '@heroicons/react/24/outline'

const EventsPreview = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .gte('event_date', today)
        .eq('status', 'confirmed')
        .order('event_date')
        .limit(3)

      if (error) throw error
      setEvents(data || [])
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">Upcoming Events</h2>

        {loading ? (
          <div className="text-center py-10">
            <p>Loading events...</p>
          </div>
        ) : events.length > 0 ? (
          <div className="space-y-6 max-w-2xl mx-auto">
            {events.map(event => (
              <div key={event.id} className="card hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold">{event.event_name}</h3>
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                    {event.event_type}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-gray-600">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5" />
                    <span>{formatDateDisplay(event.event_date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UsersIcon className="w-5 h-5" />
                    <span>{event.expected_guests} guests</span>
                  </div>
                </div>

                {event.description && (
                  <p className="text-gray-700 mb-4">{event.description}</p>
                )}

                <Link to="/events" className="btn btn-primary">
                  Learn More
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-600">
            <p>No upcoming events at the moment</p>
          </div>
        )}

        <div className="text-center mt-12">
          <Link to="/events" className="btn btn-primary">
            View All Events
          </Link>
        </div>
      </div>
    </section>
  )
}

export default EventsPreview