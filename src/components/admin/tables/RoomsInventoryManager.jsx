import React, { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../context/AuthContext'
import { formatCurrency } from '../../../utils/currency'
import toast from 'react-hot-toast'
import { PencilIcon, TrashIcon, WrenchIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

const RoomsInventoryManager = () => {
  const { profile } = useAuth()
  const [rooms, setRooms] = useState([])
  const [roomTypes, setRoomTypes] = useState([])
  const [floors, setFloors] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterFloor, setFilterFloor] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [editingRoom, setEditingRoom] = useState(null)
  const [formData, setFormData] = useState({
    room_number: '',
    room_type_id: '',
    floor_id: '',
    status: 'active',
    notes: '',
  })

  const canManage = profile?.role && ['super_admin', 'hotel_manager', 'receptionist'].includes(profile.role)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch rooms with related data
      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select(`
          *,
          room_type:room_types(*),
          floor:floors(*)
        `)
        .order('room_number')

      if (roomsError) throw roomsError

      // Fetch room types
      const { data: typesData } = await supabase
        .from('room_types')
        .select('*')
        .eq('is_active', true)
        .order('name')

      // Fetch floors
      const { data: floorsData } = await supabase
        .from('floors')
        .select('*')
        .order('floor_number')

      setRooms(roomsData || [])
      setRoomTypes(typesData || [])
      setFloors(floorsData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load rooms')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateRoom = async (e) => {
    e.preventDefault()
    
    try {
      const { error } = await supabase
        .from('rooms')
        .update({
          room_number: formData.room_number,
          room_type_id: formData.room_type_id || null,
          floor_id: formData.floor_id || null,
          status: formData.status,
          notes: formData.notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingRoom.id)

      if (error) throw error

      toast.success('Room updated')
      setEditingRoom(null)
      fetchData()
    } catch (error) {
      toast.error('Failed to update room')
    }
  }

  const handleStatusChange = async (roomId, newStatus) => {
    try {
      const { error } = await supabase
        .from('rooms')
        .update({ 
          status: newStatus, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', roomId)

      if (error) throw error
      
      toast.success(`Room marked as ${newStatus}`)
      fetchData()
    } catch (error) {
      console.error('Status update error:', error)
      toast.error('Failed to update room status')
    }
  }

  const handleDelete = async (roomId) => {
    if (!confirm('Are you sure you want to delete this room?')) return

    try {
      // Check if room has bookings
      const { data: bookings } = await supabase
        .from('room_bookings')
        .select('id')
        .eq('room_id', roomId)
        .limit(1)

      if (bookings && bookings.length > 0) {
        toast.error('Cannot delete room with existing bookings')
        return
      }

      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', roomId)

      if (error) throw error
      toast.success('Room deleted')
      fetchData()
    } catch (error) {
      toast.error('Failed to delete room')
    }
  }

  const filteredRooms = rooms.filter(room => {
    if (filterFloor !== 'all' && room.floor_id !== filterFloor) return false
    if (filterType !== 'all' && room.room_type_id !== filterType) return false
    if (filterStatus !== 'all' && room.status !== filterStatus) return false
    return true
  })

  // Stats
  const stats = {
    total: rooms.length,
    active: rooms.filter(r => r.status === 'active').length,
    maintenance: rooms.filter(r => r.status === 'maintenance').length,
    inactive: rooms.filter(r => r.status === 'inactive').length,
  }

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <p className="mt-2 text-gray-600">Loading rooms...</p>
      </div>
    )
  }

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="card bg-blue-50">
          <p className="text-sm text-gray-600">Total Rooms</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="card bg-green-50">
          <p className="text-sm text-gray-600">Active</p>
          <p className="text-2xl font-bold">{stats.active}</p>
        </div>
        <div className="card bg-yellow-50">
          <p className="text-sm text-gray-600">Maintenance</p>
          <p className="text-2xl font-bold">{stats.maintenance}</p>
        </div>
        <div className="card bg-red-50">
          <p className="text-sm text-gray-600">Inactive</p>
          <p className="text-2xl font-bold">{stats.inactive}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <select value={filterFloor} onChange={(e) => setFilterFloor(e.target.value)} className="input w-40">
            <option value="all">All Floors</option>
            {floors.map(floor => (
              <option key={floor.id} value={floor.id}>Floor {floor.floor_number}</option>
            ))}
          </select>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="input w-48">
            <option value="all">All Types</option>
            {roomTypes.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input w-40">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="maintenance">Maintenance</option>
            <option value="inactive">Inactive</option>
          </select>
          <button onClick={() => { setFilterFloor('all'); setFilterType('all'); setFilterStatus('all') }} className="btn btn-secondary text-sm">
            Clear Filters
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {editingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Edit Room {editingRoom.room_number}</h3>
            <form onSubmit={handleUpdateRoom} className="space-y-4">
              <input type="text" value={formData.room_number} onChange={(e) => setFormData({...formData, room_number: e.target.value})} className="input" placeholder="Room Number" required />
              <select value={formData.room_type_id} onChange={(e) => setFormData({...formData, room_type_id: e.target.value})} className="input">
                <option value="">Select Room Type</option>
                {roomTypes.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}
              </select>
              <select value={formData.floor_id} onChange={(e) => setFormData({...formData, floor_id: e.target.value})} className="input">
                <option value="">Select Floor</option>
                {floors.map(floor => <option key={floor.id} value={floor.id}>Floor {floor.floor_number}</option>)}
              </select>
              <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="input">
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactive">Inactive</option>
              </select>
              <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="input" placeholder="Notes (optional)" rows={2} />
              <div className="flex gap-3">
                <button type="submit" className="btn btn-primary flex-1">Save</button>
                <button type="button" onClick={() => setEditingRoom(null)} className="btn btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredRooms.map(room => (
          <div key={room.id} className="card hover:shadow-lg transition">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold">Room {room.room_number}</h3>
              <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(room.status)}`}>
                {room.status}
              </span>
            </div>
            
            <p className="text-sm text-gray-600">{room.room_type?.name || 'No type'}</p>
            <p className="text-sm text-gray-600">Floor {room.floor?.floor_number || 'N/A'} - {room.floor?.name}</p>
            <p className="text-lg font-bold text-blue-600 mt-2">
              {formatCurrency(room.room_type?.base_price || 0)}/night
            </p>
            <p className="text-sm text-gray-600">Capacity: {room.room_type?.capacity || 0} guests</p>
            
            {room.notes && (
              <p className="text-xs text-gray-500 mt-2 italic">{room.notes}</p>
            )}

            {canManage && (
              <div className="flex gap-2 mt-4 pt-3 border-t">
                <button onClick={() => { setEditingRoom(room); setFormData(room) }} className="text-blue-600 hover:text-blue-800" title="Edit">
                  <PencilIcon className="w-4 h-4" />
                </button>
                
                {room.status === 'active' ? (
                  <button onClick={() => handleStatusChange(room.id, 'maintenance')} className="text-yellow-600 hover:text-yellow-800" title="Mark Maintenance">
                    <WrenchIcon className="w-4 h-4" />
                  </button>
                ) : room.status === 'maintenance' ? (
                  <button onClick={() => handleStatusChange(room.id, 'active')} className="text-green-600 hover:text-green-800" title="Mark Active">
                    <CheckCircleIcon className="w-4 h-4" />
                  </button>
                ) : null}
                
                <button onClick={() => handleDelete(room.id)} className="text-red-600 hover:text-red-800" title="Delete">
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredRooms.length === 0 && (
        <div className="text-center py-10 text-gray-600">
          <p>No rooms found</p>
        </div>
      )}
    </div>
  )
}

export default RoomsInventoryManager