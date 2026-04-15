import React, { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import toast from 'react-hot-toast'
import { PlusIcon } from '@heroicons/react/24/outline'

const BulkRoomGenerator = ({ onComplete }) => {
  const [roomTypes, setRoomTypes] = useState([])
  const [floors, setFloors] = useState([])
  const [formData, setFormData] = useState({
    room_type_id: '',
    floor_id: '',
    room_numbers: '', // Comma-separated or range
    prefix: '',
    start_number: '',
    end_number: '',
  })
  const [loading, setLoading] = useState(false)
  const [generationMode, setGenerationMode] = useState('range') // 'range' or 'list'

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data: types } = await supabase.from('room_types').select('id, name, code')
    const { data: floorsData } = await supabase.from('floors').select('*').order('floor_number')
    setRoomTypes(types || [])
    setFloors(floorsData || [])
  }

  const generateRoomNumbers = () => {
    if (generationMode === 'range') {
      const rooms = []
      for (let i = parseInt(formData.start_number); i <= parseInt(formData.end_number); i++) {
        rooms.push(`${formData.prefix}${i.toString().padStart(3, '0')}`)
      }
      return rooms
    } else {
      return formData.room_numbers.split(',').map(r => r.trim()).filter(r => r)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const roomNumbers = generateRoomNumbers()
      
      if (roomNumbers.length === 0) {
        toast.error('No room numbers generated')
        return
      }

      const rooms = roomNumbers.map(number => ({
        room_number: number,
        room_type_id: formData.room_type_id,
        floor_id: formData.floor_id || null,
        status: 'active',
      }))

      const { error } = await supabase.from('rooms').insert(rooms)
      
      if (error) {
        if (error.code === '23505') {
          toast.error('Some room numbers already exist')
        } else {
          throw error
        }
      } else {
        toast.success(`${rooms.length} rooms created successfully`)
        onComplete?.()
      }
    } catch (error) {
      toast.error('Failed to create rooms')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <h3 className="text-lg font-semibold">Generate Rooms</h3>
      
      <select value={formData.room_type_id} onChange={(e) => setFormData({...formData, room_type_id: e.target.value})} className="input" required>
        <option value="">Select Room Type</option>
        {roomTypes.map(type => <option key={type.id} value={type.id}>{type.name} ({type.code})</option>)}
      </select>

      <select value={formData.floor_id} onChange={(e) => setFormData({...formData, floor_id: e.target.value})} className="input">
        <option value="">Select Floor (Optional)</option>
        {floors.map(floor => <option key={floor.id} value={floor.id}>Floor {floor.floor_number} - {floor.name}</option>)}
      </select>

      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input type="radio" checked={generationMode === 'range'} onChange={() => setGenerationMode('range')} /> Range
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" checked={generationMode === 'list'} onChange={() => setGenerationMode('list')} /> List
        </label>
      </div>

      {generationMode === 'range' ? (
        <div className="grid grid-cols-3 gap-4">
          <input type="text" placeholder="Prefix (e.g., RM)" value={formData.prefix} onChange={(e) => setFormData({...formData, prefix: e.target.value})} className="input" />
          <input type="number" placeholder="Start Number" value={formData.start_number} onChange={(e) => setFormData({...formData, start_number: e.target.value})} className="input" />
          <input type="number" placeholder="End Number" value={formData.end_number} onChange={(e) => setFormData({...formData, end_number: e.target.value})} className="input" />
        </div>
      ) : (
        <textarea placeholder="Room numbers (comma-separated)&#10;e.g., 101, 102, 103, 201, 202" value={formData.room_numbers} onChange={(e) => setFormData({...formData, room_numbers: e.target.value})} className="input" rows={4} />
      )}

      <div className="bg-gray-50 p-3 rounded">
        <p className="text-sm font-medium">Preview ({generateRoomNumbers().length} rooms):</p>
        <p className="text-xs text-gray-600 font-mono">{generateRoomNumbers().slice(0, 10).join(', ')}{generateRoomNumbers().length > 10 ? '...' : ''}</p>
      </div>

      <button type="submit" disabled={loading} className="btn btn-primary w-full">
        {loading ? 'Creating...' : `Create ${generateRoomNumbers().length} Rooms`}
      </button>
    </form>
  )
}

export default BulkRoomGenerator