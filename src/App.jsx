import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { HotelSettingsProvider } from './context/HotelSettingsContext'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './context/AuthContext'
import LoadingSpinner from './components/common/LoadingSpinner'
import ProtectedRoute from './components/admin/auth/ProtectedRoute'

// ============================================================================
// PUBLIC PAGES
// ============================================================================
import HomePage from './pages/public/HomePage'
import RoomsPage from './pages/public/RoomsPage'
import RoomDetailPage from './pages/public/RoomDetailPage'
import RestaurantPage from './pages/public/RestaurantPage'
import EventsPage from './pages/public/EventsPage'
import EventDetailPage from './pages/public/EventDetailPage'
import GalleryPage from './pages/public/GalleryPage'
import ContactPage from './pages/public/ContactPage'
import LoginPage from './pages/public/LoginPage'
import RegisterPage from './pages/public/RegisterPage'
import GuestDashboard from './pages/public/GuestDashboard'

// ============================================================================
// ADMIN PAGES
// ============================================================================
import AdminLoginPage from './pages/admin/AdminLoginPage'
import DashboardPage from './pages/admin/DashboardPage'

// Room Management (NEW SYSTEM)
import RoomTypesPage from './pages/admin/RoomTypesPage'
import RoomsInventoryPage from './pages/admin/RoomsInventoryPage'
import FloorsPage from './pages/admin/FloorsPage'
import SeasonalPricingPage from './pages/admin/SeasonalPricingPage'

// Booking & Reservations
import BookingsAdminPage from './pages/admin/BookingsPage'
import TableReservationsAdminPage from './pages/admin/TableReservationsPage'
import EventBookingsAdminPage from './pages/admin/EventBookingsPage'

// Restaurant & Menu
import MenuAdminPage from './pages/admin/MenuPage'

// Events
import EventsAdminPage from './pages/admin/EventsPage'

// Staff & Housekeeping
import StaffAdminPage from './pages/admin/StaffPage'
import HousekeepingAdminPage from './pages/admin/HousekeepingPage'

// Gallery & Messages
import GalleryAdminPage from './pages/admin/GalleryPage'
import ContactMessagesPage from './pages/admin/ContactMessagesPage'

// Reports & Settings
import ReportsAdminPage from './pages/admin/ReportsPage'
import SettingsAdminPage from './pages/admin/SettingsPage'

// ============================================================================
// APP CONTENT (Handles loading state)
// ============================================================================
function AppContent() {
  const { loading, initialized } = useAuth()

  // Show loading spinner only during initial auth check
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading UptownHotel...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      {/* ==================== PUBLIC ROUTES ==================== */}
      
      {/* Home and Info Pages */}
      <Route path="/" element={<HomePage />} />
      <Route path="/rooms" element={<RoomsPage />} />
      <Route path="/rooms/:id" element={<RoomDetailPage />} />
      <Route path="/restaurant" element={<RestaurantPage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/events/:id" element={<EventDetailPage />} />
      <Route path="/gallery" element={<GalleryPage />} />
      <Route path="/contact" element={<ContactPage />} />

      {/* Auth Pages */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Guest Dashboard */}
      <Route
        path="/guest/profile"
        element={
          <ProtectedRoute>
            <GuestDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/guest/dashboard"
        element={
          <ProtectedRoute>
            <GuestDashboard />
          </ProtectedRoute>
        }
      />

      {/* ==================== ADMIN ROUTES ==================== */}

      {/* Admin Auth */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Admin Dashboard */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Room Management (NEW SYSTEM) */}
      <Route
        path="/admin/room-types"
        element={
          <ProtectedRoute>
            <RoomTypesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/rooms-inventory"
        element={
          <ProtectedRoute>
            <RoomsInventoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/floors"
        element={
          <ProtectedRoute>
            <FloorsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/seasonal-pricing"
        element={
          <ProtectedRoute>
            <SeasonalPricingPage />
          </ProtectedRoute>
        }
      />

      {/* Bookings & Reservations */}
      <Route
        path="/admin/bookings"
        element={
          <ProtectedRoute>
            <BookingsAdminPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/table-reservations"
        element={
          <ProtectedRoute>
            <TableReservationsAdminPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/event-bookings"
        element={
          <ProtectedRoute>
            <EventBookingsAdminPage />
          </ProtectedRoute>
        }
      />

      {/* Restaurant & Menu */}
      <Route
        path="/admin/menu"
        element={
          <ProtectedRoute>
            <MenuAdminPage />
          </ProtectedRoute>
        }
      />

      {/* Events */}
      <Route
        path="/admin/events"
        element={
          <ProtectedRoute>
            <EventsAdminPage />
          </ProtectedRoute>
        }
      />

      {/* Staff & Housekeeping */}
      <Route
        path="/admin/staff"
        element={
          <ProtectedRoute>
            <StaffAdminPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/housekeeping"
        element={
          <ProtectedRoute>
            <HousekeepingAdminPage />
          </ProtectedRoute>
        }
      />

      {/* Gallery & Messages */}
      <Route
        path="/admin/gallery"
        element={
          <ProtectedRoute>
            <GalleryAdminPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/messages"
        element={
          <ProtectedRoute>
            <ContactMessagesPage />
          </ProtectedRoute>
        }
      />

      {/* Reports & Settings */}
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute>
            <ReportsAdminPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute>
            <SettingsAdminPage />
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

// ============================================================================
// MAIN APP
// ============================================================================
function App() {
  return (
    <Router>
      <AuthProvider>
        <HotelSettingsProvider>
          <AppContent />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              success: { duration: 3000 },
              error: { duration: 4000 },
            }}
          />
        </HotelSettingsProvider>
      </AuthProvider>
    </Router>
  )
}

export default App