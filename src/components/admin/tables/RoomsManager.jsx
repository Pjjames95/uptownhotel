import React, { useState } from 'react'
import { useRooms } from '../../../hooks/useRooms'
import DataTable from '../../common/DataTable'
import toast from 'react-hot-toast'

const RoomsManager = () => {
  const { rooms, createRoom, updateRoom, deleteRoom } = useRooms()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    room_number: '',
    room_type: 'single',
    capacity: 1,
    price_per_night: 0,
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await createRoom(formData)

    if (result.success) {
      toast.success('Room created successfully')
      setFormData({
        room_number: '',
        room_type: 'single',
        capacity: 1,
        price_per_night: 0,
      })
      setShowForm(false)
    } else {
      toast.error(result.error)
    }
  }

  const handleDelete = async (roomId) => {
    if (confirm('Are you sure you want to delete this room?')) {
      const result = await deleteRoom(roomId)
      if (result.success) {
        toast.success('Room deleted successfully')
      } else {
        toast.error('Failed to delete room')
      }
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Rooms Management</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          {showForm ? 'Cancel' : 'Add Room'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-6 space-y-4">
          <input
            type="text"
            placeholder="Room Number"
            value={formData.room_number}
            onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
            className="input"
            required
          />
          <select
            value={formData.room_type}
            onChange={(e) => setFormData({ ...formData, room_type: e.target.value })}
            className="input"
          >
            <option value="single">Single</option>
            <option value="double">Double</option>
            <option value="suite">Suite</option>
            <option value="presidential">Presidential</option>
            <option value="family">Family</option>
          </select>
          <input
            type="number"
            placeholder="Capacity"
            value={formData.capacity}
            onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
            className="input"
            required
          />
          <input
            type="number"
            placeholder="Price per Night"
            value={formData.price_per_night}
            onChange={(e) => setFormData({ ...formData, price_per_night: parseFloat(e.target.value) })}
            className="input"
            required
          />
          <button type="submit" className="btn btn-primary w-full">
            Create Room
          </button>
        </form>
      )}

      <div className="card">
        <DataTable
          columns={['room_number', 'room_type', 'capacity', 'price_per_night', 'status']}
          data={rooms}
          onDelete={handleDelete}
        />
      </div>
    </div>
  )
}

export default RoomsManager