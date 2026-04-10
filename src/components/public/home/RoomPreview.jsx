import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../../lib/supabase'
import { ROOM_TYPES } from '../../../utils/constants'

const RoomPreview = () => {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('is_available', true)
        .limit(6)

      if (error) throw error
      setRooms(data || [])
    } catch (error) {
      console.error('Error fetching rooms:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">Our Rooms</h2>

        {loading ? (
          <div className="text-center py-10">
            <p>Loading rooms...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {rooms.map(room => (
              <div key={room.id} className="card hover:shadow-lg transition">
                {room.images?.[0] && (
                  <img
                    src={room.images[0]}
                    alt={room.room_number}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold">Room {room.room_number}</h3>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {ROOM_TYPES[room.room_type]?.label}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">
                  Capacity: {room.capacity} {room.capacity > 1 ? 'guests' : 'guest'}
                </p>
                <p className="font-bold text-lg text-blue-600 mb-4">
                  KES {room.price_per_night?.toLocaleString()}/night
                </p>
                <Link to="/rooms" className="btn btn-primary w-full text-center">
                  View Details
                </Link>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link to="/rooms" className="btn btn-primary">
            View All Rooms
          </Link>
        </div>
      </div>
    </section>
  )
}

export default RoomPreview