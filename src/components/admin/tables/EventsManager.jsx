import React, { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../context/AuthContext'
import { formatDateDisplay } from '../../../utils/dateUtils'
import { EVENT_TYPES, EVENT_STATUS } from '../../../utils/constants'
import toast from 'react-hot-toast'
import { 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  PlusIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline'

const EventsManager = () => {
  const { profile } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    event_name: '',
    event_type: 'conference',
    event_date: '',
    event_time: '',
    end_time: '',
    expected_guests: '',
    venue: '',
    description: '',
    status: 'pending',
  })

  // Permission checks
  const canManageEvents = profile?.role && 
    ['super_admin', 'hotel_manager', 'restaurant_manager'].includes(profile.role)
  
  const canDeleteEvents = profile?.role && 
    ['super_admin', 'hotel_manager'].includes(profile.role)
  
  const canChangeStatus = profile?.role && 
    ['super_admin', 'hotel_manager', 'restaurant_manager'].includes(profile.role)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: false })

      if (error) throw error
      setEvents(data || [])
    } catch (error) {
      console.error('Error fetching events:', error)
      toast.error('Failed to fetch events')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!canManageEvents) {
      toast.error('You do not have permission to manage events')
      return
    }
    
    setSubmitting(true)

    try {
      let result
      
      if (editingEvent) {
        result = await supabase
          .from('events')
          .update(formData)
          .eq('id', editingEvent.id)
          .select()
      } else {
        result = await supabase
          .from('events')
          .insert([formData])
          .select()
      }

      const { error } = result

      if (error) {
        if (error.code === '42501' || error.message.includes('permission')) {
          toast.error('You do not have permission to manage events. Only managers can create or update events.')
        } else if (error.code === '23505') {
          toast.error('An event with this name already exists.')
        } else if (error.code === '23514') {
          toast.error('Invalid data provided. Please check all fields.')
        } else {
          throw error
        }
        return
      }

      toast.success(editingEvent ? 'Event updated successfully' : 'Event created successfully')
      resetForm()
      fetchEvents()
    } catch (error) {
      console.error('Error saving event:', error)
      toast.error('Failed to save event: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (event) => {
    if (!canManageEvents) {
      toast.error('You do not have permission to edit events')
      return
    }
    
    setEditingEvent(event)
    setFormData({
      event_name: event.event_name,
      event_type: event.event_type,
      event_date: event.event_date,
      event_time: event.event_time,
      end_time: event.end_time || '',
      expected_guests: event.expected_guests || '',
      venue: event.venue || '',
      description: event.description || '',
      status: event.status,
    })
    setShowForm(true)
  }

  const handleDelete = async (eventId) => {
    if (!canDeleteEvents) {
      toast.error('Only administrators can delete events')
      return
    }
    
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) return

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)

      if (error) {
        if (error.code === '42501') {
          toast.error('You do not have permission to delete events')
        } else {
          throw error
        }
        return
      }
      
      toast.success('Event deleted successfully')
      fetchEvents()
    } catch (error) {
      console.error('Error deleting event:', error)
      toast.error('Failed to delete event')
    }
  }

  const handleStatusChange = async (eventId, newStatus) => {
    if (!canChangeStatus) {
      toast.error('You do not have permission to change event status')
      return
    }
    
    try {
      const { error } = await supabase
        .from('events')
        .update({ status: newStatus })
        .eq('id', eventId)

      if (error) {
        if (error.code === '42501') {
          toast.error('You do not have permission to update event status')
        } else {
          throw error
        }
        return
      }
      
      toast.success('Status updated')
      fetchEvents()
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }

  const resetForm = () => {
    setFormData({
      event_name: '',
      event_type: 'conference',
      event_date: '',
      event_time: '',
      end_time: '',
      expected_guests: '',
      venue: '',
      description: '',
      status: 'pending',
    })
    setEditingEvent(null)
    setShowForm(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Get status badge color
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
      postponed: 'bg-orange-100 text-orange-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div>
      {/* Header with permission indicator */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Events Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            {canManageEvents ? (
              <span className="text-green-600">✓ You have full management permissions</span>
            ) : (
              <span className="text-orange-600">👁️ View only mode - Contact manager to modify events</span>
            )}
          </p>
        </div>
        
        {canManageEvents && (
          <button
            onClick={() => {
              resetForm()
              setShowForm(!showForm)
            }}
            className="btn btn-primary flex items-center gap-2"
          >
            {showForm ? (
              <>
                <XMarkIcon className="w-5 h-5" />
                Cancel
              </>
            ) : (
              <>
                <PlusIcon className="w-5 h-5" />
                Add Event
              </>
            )}
          </button>
        )}
      </div>

      {/* Event Form */}
      {showForm && canManageEvents && (
        <form onSubmit={handleSubmit} className="card mb-6 space-y-4">
          <h3 className="text-lg font-semibold">
            {editingEvent ? 'Edit Event' : 'Create New Event'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Name *
              </label>
              <input
                type="text"
                name="event_name"
                placeholder="e.g., Annual Conference 2024"
                value={formData.event_name}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Type *
              </label>
              <select
                name="event_type"
                value={formData.event_type}
                onChange={handleChange}
                className="input"
                required
              >
                {Object.entries(EVENT_TYPES).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                name="event_date"
                value={formData.event_date}
                onChange={handleChange}
                className="input"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time *
              </label>
              <input
                type="time"
                name="event_time"
                value={formData.event_time}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <input
                type="time"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                className="input"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected Guests
              </label>
              <input
                type="number"
                name="expected_guests"
                placeholder="e.g., 100"
                value={formData.expected_guests}
                onChange={handleChange}
                className="input"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Venue
              </label>
              <input
                type="text"
                name="venue"
                placeholder="e.g., Main Ballroom"
                value={formData.venue}
                onChange={handleChange}
                className="input"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              placeholder="Event details, special requirements, etc."
              value={formData.description}
              onChange={handleChange}
              className="input"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="input"
            >
              {Object.entries(EVENT_STATUS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-3">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </span>
              ) : (
                editingEvent ? 'Update Event' : 'Create Event'
              )}
            </button>
            <button 
              type="button" 
              onClick={resetForm}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Events Table */}
      <div className="card overflow-x-auto">
        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            <p className="mt-2 text-gray-600">Loading events...</p>
          </div>
        ) : events.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Venue</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guests</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {events.map(event => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{event.event_name}</td>
                  <td className="px-4 py-3">{EVENT_TYPES[event.event_type] || event.event_type}</td>
                  <td className="px-4 py-3">{formatDateDisplay(event.event_date)}</td>
                  <td className="px-4 py-3">
                    {event.event_time}
                    {event.end_time && ` - ${event.end_time}`}
                  </td>
                  <td className="px-4 py-3">{event.venue || '-'}</td>
                  <td className="px-4 py-3">{event.expected_guests || '-'}</td>
                  <td className="px-4 py-3">
                    {canChangeStatus ? (
                      <select
                        value={event.status}
                        onChange={(e) => handleStatusChange(event.id, e.target.value)}
                        className={`text-sm border rounded px-2 py-1 ${getStatusColor(event.status)}`}
                      >
                        {Object.keys(EVENT_STATUS).map(status => (
                          <option key={status} value={status}>
                            {EVENT_STATUS[status]}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className={`px-2 py-1 rounded text-sm ${getStatusColor(event.status)}`}>
                        {EVENT_STATUS[event.status] || event.status}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {canManageEvents && (
                        <button
                          onClick={() => handleEdit(event)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                          title="Edit event"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                      )}
                      {canDeleteEvents && (
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                          title="Delete event"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      )}
                      {!canManageEvents && !canDeleteEvents && (
                        <span className="text-gray-400 text-sm flex items-center gap-1">
                          <EyeIcon className="w-4 h-4" />
                          View only
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-10 text-gray-600">
            <p className="text-lg">No events found</p>
            {canManageEvents && (
              <button
                onClick={() => setShowForm(true)}
                className="btn btn-primary mt-4"
              >
                Create Your First Event
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default EventsManager