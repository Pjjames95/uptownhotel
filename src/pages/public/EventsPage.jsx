import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import PublicLayout from '../../components/public/layout/PublicLayout'
import { supabase } from '../../lib/supabase'
import { formatDateDisplay } from '../../utils/dateUtils'
import { EVENT_TYPES } from '../../utils/constants'
import { 
  CalendarIcon, 
  ClockIcon, 
  UsersIcon, 
  MapPinIcon,
  MagnifyingGlassIcon 
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const EventsPage = () => {
  const [events, setEvents] = useState([])
  const [filteredEvents, setFilteredEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedMonth, setSelectedMonth] = useState('all')
  const [packages, setPackages] = useState([])

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    filterEvents()
  }, [events, searchQuery, selectedType, selectedMonth])

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .gte('event_date', today)
        .eq('status', 'confirmed')
        .order('event_date', { ascending: true })

      if (error) throw error
      setEvents(data || [])
      setFilteredEvents(data || [])
    } catch (error) {
      console.error('Error fetching events:', error)
      toast.error('Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('event_packages')
        .select('*')
        .eq('is_active', true)
        .order('display_order')
      
      if (error) throw error
      setPackages(data || [])
    } catch (error) {
      console.error('Error fetching packages:', error)
    }
  }

  const filterEvents = () => {
    let filtered = [...events]

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.event_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.venue?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(event => event.event_type === selectedType)
    }

    // Filter by month
    if (selectedMonth !== 'all') {
      filtered = filtered.filter(event => {
        const eventMonth = new Date(event.event_date).getMonth()
        return eventMonth === parseInt(selectedMonth)
      })
    }

    setFilteredEvents(filtered)
  }

  const getUniqueMonths = () => {
    const months = new Set()
    events.forEach(event => {
      const date = new Date(event.event_date)
      months.add(date.getMonth())
    })
    return Array.from(months).sort()
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const eventTypes = Object.entries(EVENT_TYPES)

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative h-64 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="absolute inset-0 bg-black opacity-30" />
        <div className="relative h-full flex items-center justify-center text-white">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">Events & Occasions</h1>
            <p className="text-xl">Host Your Special Moments With Us</p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Types</option>
                {eventTypes.map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>

              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Months</option>
                {getUniqueMonths().map(month => (
                  <option key={month} value={month}>{monthNames[month]}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
              <p className="mt-4 text-gray-600">Loading events...</p>
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Events Found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || selectedType !== 'all' || selectedMonth !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Check back later for upcoming events'}
              </p>
              {(searchQuery || selectedType !== 'all' || selectedMonth !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedType('all')
                    setSelectedMonth('all')
                  }}
                  className="btn btn-primary"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Host Your Event CTA */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Host Your Event With Us</h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            From intimate gatherings to grand celebrations, we provide the perfect setting for your special occasion.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="btn bg-white text-purple-600 hover:bg-gray-100 px-8 py-3 font-semibold">
              Contact Us
            </Link>
            <button className="btn border-2 border-white text-white hover:bg-white hover:text-purple-600 px-8 py-3 font-semibold">
              Request Quote
            </button>
          </div>
        </div>
      </section>

      {/* Event Packages */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Event Packages</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <div key={pkg.id} className="card text-center hover:shadow-xl transition">
                <div className="text-4xl mb-4">{pkg.icon || '📅'}</div>
                <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
                <p className="text-gray-600 mb-4">{pkg.description}</p>
                <ul className="text-sm text-gray-600 mb-6 space-y-1">
                  {pkg.features?.map((feature, i) => <li key={i}>✓ {feature}</li>)}
                </ul>
                <p className="text-2xl font-bold text-purple-600 mb-4">
                  {pkg.price ? `From KES ${pkg.price.toLocaleString()}` : 'Contact us'}
                </p>
                <Link to="/contact" className="btn btn-primary w-full">Inquire Now</Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}

const EventCard = ({ event }) => {
  return (
    <Link to={`/events/${event.id}`}>
      <div className="card hover:shadow-xl transition group cursor-pointer h-full flex flex-col">
        {/* Event Image Placeholder */}
        <div className="h-48 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg mb-4 flex items-center justify-center">
          <span className="text-4xl">
            {event.event_type === 'wedding' ? '💒' :
             event.event_type === 'conference' ? '🏛️' :
             event.event_type === 'party' ? '🎉' :
             event.event_type === 'meeting' ? '💼' : '📅'}
          </span>
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold group-hover:text-purple-600 transition">
              {event.event_name}
            </h3>
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium">
              {EVENT_TYPES[event.event_type]}
            </span>
          </div>

          <div className="space-y-2 mb-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              <span>{formatDateDisplay(event.event_date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4" />
              <span>{event.event_time} - {event.end_time || 'Late'}</span>
            </div>
            {event.venue && (
              <div className="flex items-center gap-2">
                <MapPinIcon className="w-4 h-4" />
                <span>{event.venue}</span>
              </div>
            )}
            {event.expected_guests && (
              <div className="flex items-center gap-2">
                <UsersIcon className="w-4 h-4" />
                <span>Up to {event.expected_guests} guests</span>
              </div>
            )}
          </div>

          {event.description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {event.description}
            </p>
          )}
        </div>

        <div className="mt-4 pt-4 border-t">
          <span className="text-purple-600 font-medium group-hover:underline">
            View Details →
          </span>
        </div>
      </div>
    </Link>
  )
}

const eventPackages = [
  {
    icon: '💒',
    name: 'Wedding Package',
    description: 'Make your special day unforgettable',
    features: [
      'Elegant venue setup',
      'Custom catering menu',
      'Bridal suite included',
      'Professional coordination'
    ],
    price: 'From KES 250,000'
  },
  {
    icon: '🏛️',
    name: 'Corporate Package',
    description: 'Professional events for business',
    features: [
      'AV equipment included',
      'High-speed WiFi',
      'Catering options',
      'Breakout rooms available'
    ],
    price: 'From KES 75,000'
  },
  {
    icon: '🎉',
    name: 'Celebration Package',
    description: 'Perfect for parties and gatherings',
    features: [
      'Flexible space setup',
      'Custom menu options',
      'Decoration services',
      'Entertainment options'
    ],
    price: 'From KES 50,000'
  }
]

export default EventsPage