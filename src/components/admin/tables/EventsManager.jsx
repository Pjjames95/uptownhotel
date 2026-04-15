import React, { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../context/AuthContext'
import { formatDateDisplay } from '../../../utils/dateUtils'
import { EVENT_TYPES, EVENT_STATUS } from '../../../utils/constants'
import ImageUploader from '../../common/ImageUploader'
import toast from 'react-hot-toast'
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline'

const EventsManager = () => {
  const { profile } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
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
    image_url: '',
  })

  const canManageEvents = profile?.role && 
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

    try {
      let result
      if (editingEvent) {
        result = await supabase.from('events').update(formData).eq('id', editingEvent.id)
      } else {
        result = await supabase.from('events').insert([formData])
      }

      const { error } = result
      if (error) throw error

      toast.success(editingEvent ? 'Event updated' : 'Event created')
      resetForm()
      fetchEvents()
    } catch (error) {
      toast.error('Failed to save event')
    }
  }

  const handleEdit = (event) => {
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
      image_url: event.image_url || '',
    })
    setShowForm(true)
  }

  const handleDelete = async (eventId) => {
    if (!confirm('Are you sure?')) return
    try {
      await supabase.from('events').delete().eq('id', eventId)
      toast.success('Event deleted')
      fetchEvents()
    } catch (error) {
      toast.error('Failed to delete')
    }
  }

  const resetForm = () => {
    setFormData({
      event_name: '', event_type: 'conference', event_date: '', event_time: '',
      end_time: '', expected_guests: '', venue: '', description: '', status: 'pending', image_url: '',
    })
    setEditingEvent(null)
    setShowForm(false)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Events Management</h2>
        {canManageEvents && (
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary flex items-center gap-2">
            {showForm ? <><XMarkIcon className="w-5 h-5" /> Cancel</> : <><PlusIcon className="w-5 h-5" /> Add Event</>}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-6 space-y-4">
          <h3 className="text-lg font-semibold">{editingEvent ? 'Edit Event' : 'Create Event'}</h3>
          
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Event Image</label>
            <ImageUploader 
              onUpload={(url) => setFormData({...formData, image_url: url})} 
              existingImage={formData.image_url}
              bucket="event-images" 
              folder="events" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="event_name" placeholder="Event Name" value={formData.event_name} onChange={(e) => setFormData({...formData, event_name: e.target.value})} className="input" required />
            <select name="event_type" value={formData.event_type} onChange={(e) => setFormData({...formData, event_type: e.target.value})} className="input">
              {Object.entries(EVENT_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* <input type="date" name="event_date" value={formData.event_date} onChange={(e) => setFormData({...formData, event_date: e.target.value})} className="input" required /> */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  name="event_date"
                  value={formData.event_date}
                  onChange={(e) => setFormData({...formData, event_date: e.target.value})}
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
                  onChange={(e) => setFormData({...formData, event_date: e.target.value})}
                  className="input"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">24-hour format</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  name="end_time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({...formData, event_date: e.target.value})}
                  className="input"
                />
                <p className="text-xs text-gray-500 mt-1">24-hour format</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="number" name="expected_guests" placeholder="Expected Guests" value={formData.expected_guests} onChange={(e) => setFormData({...formData, expected_guests: e.target.value})} className="input" />
            <input type="text" name="venue" placeholder="Venue" value={formData.venue} onChange={(e) => setFormData({...formData, venue: e.target.value})} className="input" />
          </div>

          <textarea name="description" placeholder="Description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="input" rows={3} />
          
          <select name="status" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="input">
            {Object.entries(EVENT_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>

          <div className="flex gap-3">
            <button type="submit" className="btn btn-primary">{editingEvent ? 'Update' : 'Create'}</button>
            <button type="button" onClick={resetForm} className="btn btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(event => (
          <div key={event.id} className="card">
            {event.image_url ? (
              <img src={event.image_url} alt={event.event_name} className="w-full h-48 object-cover rounded-lg mb-4" />
            ) : (
              <div className="w-full h-48 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-white text-4xl">📅</span>
              </div>
            )}
            <h3 className="text-xl font-bold">{event.event_name}</h3>
            <p className="text-sm text-gray-600">{EVENT_TYPES[event.event_type]} • {formatDateDisplay(event.event_date)}</p>
            <p className="text-sm text-gray-600">{event.event_time} • {event.venue || 'TBD'}</p>
            <span className={`inline-block mt-2 px-2 py-1 text-xs rounded ${event.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {EVENT_STATUS[event.status]}
            </span>
            {canManageEvents && (
              <div className="flex gap-2 mt-4 pt-3 border-t">
                <button onClick={() => handleEdit(event)} className="text-blue-600"><PencilIcon className="w-4 h-4 inline" /> Edit</button>
                <button onClick={() => handleDelete(event.id)} className="text-red-600"><TrashIcon className="w-4 h-4 inline" /> Delete</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default EventsManager