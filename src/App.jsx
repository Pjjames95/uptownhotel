import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { Toaster } from 'react-hot-toast'
import ProtectedRoute from './components/admin/auth/ProtectedRoute'

// Public Pages
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

// Admin Pages
import AdminLoginPage from './pages/admin/AdminLoginPage'
import DashboardPage from './pages/admin/DashboardPage'
import RoomsAdminPage from './pages/admin/RoomsPage'
import BookingsAdminPage from './pages/admin/BookingsPage'
import MenuAdminPage from './pages/admin/MenuPage'
import EventsAdminPage from './pages/admin/EventsPage'
import StaffAdminPage from './pages/admin/StaffPage'
import HousekeepingAdminPage from './pages/admin/HousekeepingPage'
import ReportsAdminPage from './pages/admin/ReportsPage'
import SettingsAdminPage from './pages/admin/SettingsPage'

function App() {
  return (
    <Router>
      <AuthProvider>
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

          {/* Admin Management Pages */}
          <Route
            path="/admin/rooms"
            element={
              <ProtectedRoute>
                <RoomsAdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <ProtectedRoute>
                <BookingsAdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/menu"
            element={
              <ProtectedRoute>
                <MenuAdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/events"
            element={
              <ProtectedRoute>
                <EventsAdminPage />
              </ProtectedRoute>
            }
          />
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

        {/* Notifications */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </AuthProvider>
    </Router>
  )
}

export default App