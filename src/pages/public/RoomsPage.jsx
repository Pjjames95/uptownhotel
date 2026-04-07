import React, { useState } from 'react'
import { useRooms } from '../../hooks/useRooms'
import RoomList from '../../components/public/rooms/RoomList'
import RoomDetail from '../../components/public/rooms/RoomDetail'
import PublicLayout from '../../components/public/layout/PublicLayout'

const RoomsPage = () => {
  const { rooms, loading } = useRooms()
  const [selectedRoom, setSelectedRoom] = useState(null)

  if (loading) {
    return <div className="text-center py-10">Loading rooms...</div>
  }

  return (
    <PublicLayout>
      <div className="py-10">
        <h1 className="text-4xl font-bold text-center mb-10">Our Rooms</h1>

        {selectedRoom ? (
          <RoomDetail room={selectedRoom} onBack={() => setSelectedRoom(null)} />
        ) : (
          <RoomList rooms={rooms} onSelectRoom={setSelectedRoom} />
        )}
      </div>
    </PublicLayout>
  )
}

export default RoomsPage