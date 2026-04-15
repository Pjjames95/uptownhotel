import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import PublicLayout from '../../components/public/layout/PublicLayout'
import ProfileTab from '../../components/public/guest/ProfileTab'
import BookingHistoryTab from '../../components/public/guest/BookingHistoryTab'
import ReservationsTab from '../../components/public/guest/ReservationsTab'
import ReviewsTab from '../../components/public/guest/ReviewsTab'
import ProtectedRoute from '../../components/admin/auth/ProtectedRoute'

const GuestDashboard = () => {
  const { profile } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')

  const tabs = [
    { id: 'profile', label: 'My Profile' },
    { id: 'bookings', label: 'Room Bookings' },
    { id: 'reservations', label: 'Table Reservations' },
    { id: 'reviews', label: 'My Reviews' },
  ]

  // Get display name
  const displayName = profile?.full_name || profile?.email?.split('@')[0] || 'Guest'

  return (
    <ProtectedRoute>
      <PublicLayout>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-2">
              Welcome, {displayName}!
            </h1>
            <p className="text-gray-600 mb-8">Manage your bookings and profile</p>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-md mb-6">
              <div className="flex border-b overflow-x-auto">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-4 font-medium transition whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-b-4 border-blue-600 text-blue-600'
                        : 'text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'profile' && <ProfileTab />}
                {activeTab === 'bookings' && <BookingHistoryTab />}
                {activeTab === 'reservations' && <ReservationsTab />}
                {activeTab === 'reviews' && <ReviewsTab />}
              </div>
            </div>
          </div>
        </div>
      </PublicLayout>
    </ProtectedRoute>
  )
}

export default GuestDashboard