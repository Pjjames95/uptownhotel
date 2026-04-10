import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useAuthActions } from '../../../hooks/useAuth'
import LogoutButton from '../../common/LogoutButton'
import { 
  Bars3Icon, 
  XMarkIcon, 
  UserCircleIcon, 
  ArrowLeftOnRectangleIcon 
} from '@heroicons/react/24/outline'

const PublicNavbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { user, profile } = useAuth()
  const { logout } = useAuthActions()
  const navigate = useNavigate()

  const handleLogout = async () => {
    if (isLoggingOut) return
    
    setIsLoggingOut(true)
    try {
      await logout()
      setMobileMenuOpen(false)
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const publicLinks = [
    { name: 'Rooms', path: '/rooms' },
    { name: 'Restaurant', path: '/restaurant' },
    { name: 'Events', path: '/events' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Contact', path: '/contact' },
  ]

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-blue-600">
            🏨 UptownHotel
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {publicLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className="text-gray-700 hover:text-blue-600 transition"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <span className="text-gray-700">
                  Welcome, {profile?.full_name?.split(' ')[0] || 'Guest'}
                </span>
                <button
                  onClick={() => navigate('/guest/profile')}
                  className="text-gray-700 hover:text-blue-600"
                >
                  <UserCircleIcon className="w-6 h-6" />
                </button>
                <LogoutButton className="text-red-600 hover:text-red-800 flex items-center gap-2">
                  <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                  Logout
                </LogoutButton>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {publicLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <hr className="my-2" />
            {user ? (
              <>
                <button
                  onClick={() => {
                    navigate('/guest/profile')
                    setMobileMenuOpen(false)
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  My Profile
                </button>
                <LogoutButton className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50">
                  Logout
                </LogoutButton>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

export default PublicNavbar