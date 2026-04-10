import React from 'react'
import { Link } from 'react-router-dom'
import { formatCurrency } from '../../../utils/currency'
import { ROOM_TYPES } from '../../../utils/constants'
import { UsersIcon } from '@heroicons/react/24/outline'

const RoomList = ({ rooms, onSelectRoom }) => {
  if (!rooms || rooms.length === 0) {
    return (
      <div className="text-center py-10 text-gray-600">
        <p className="text-xl">No rooms available at the moment</p>
        <p className="mt-2">Please check back later or contact us for assistance.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map(room => (
          <div 
            key={room.id} 
            className="card hover:shadow-xl transition cursor-pointer group"
            onClick={() => onSelectRoom(room)}
          >
            {/* Room Image */}
            <div className="relative h-48 mb-4 overflow-hidden rounded-lg bg-gray-200">
              {room.images && room.images[0] ? (
                <img
                  src={room.images[0]}
                  alt={`Room ${room.room_number}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
              <div className="absolute top-2 right-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  room.status === 'available' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {room.status === 'available' ? 'Available' : room.status}
                </span>
              </div>
            </div>

            {/* Room Info */}
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-xl font-bold">Room {room.room_number}</h3>
                <p className="text-sm text-gray-600">Floor {room.floor_number || '1'}</p>
              </div>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                {ROOM_TYPES[room.room_type]?.label || room.room_type}
              </span>
            </div>

            <div className="flex items-center gap-2 mb-3 text-gray-600">
              <UsersIcon className="w-4 h-4" />
              <span className="text-sm">
                Up to {room.capacity} {room.capacity > 1 ? 'guests' : 'guest'}
              </span>
            </div>

            {room.description && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {room.description}
              </p>
            )}

            {/* Amenities Preview */}
            {room.amenities && room.amenities.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {room.amenities.slice(0, 3).map((amenity, index) => (
                  <span 
                    key={index}
                    className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                  >
                    {amenity}
                  </span>
                ))}
                {room.amenities.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{room.amenities.length - 3} more
                  </span>
                )}
              </div>
            )}

            {/* Price and Action */}
            <div className="flex items-center justify-between pt-3 border-t">
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(room.price_per_night)}
                </p>
                <p className="text-xs text-gray-500">per night</p>
              </div>
              <button 
                className="btn btn-primary"
                onClick={(e) => {
                  e.stopPropagation()
                  onSelectRoom(room)
                }}
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RoomList