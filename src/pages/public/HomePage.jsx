import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PublicLayout from '../../components/public/layout/PublicLayout'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../utils/currency'
import { UsersIcon, StarIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import HeroSection from '../../components/public/home/HeroSection'

const HomePage = () => {
  const navigate = useNavigate()
  const [roomTypes, setRoomTypes] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [quickSearch, setQuickSearch] = useState({
    check_in: '',
    check_out: '',
    guests: 1,
  })

  useEffect(() => {
    fetchHomeData()
  }, [])

  const fetchHomeData = async () => {
    setLoading(true)
    try {
      // Fetch room types for preview
      const { data: typesData, error: typesError } = await supabase
        .from('room_types')
        .select('*')
        .eq('is_active', true)
        .order('base_price')
        .limit(3)

      if (typesError) throw typesError
      setRoomTypes(typesData || [])

      // Fetch recent reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('guest_reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          guest:guest_id(full_name)
        `)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(3)

      if (reviewsError) {
        console.warn('Reviews error:', reviewsError)
        setDemoReviews()
      } else {
        setReviews(reviewsData || [])
      }
    } catch (error) {
      console.error('Error fetching home data:', error)
      setDemoReviews()
    } finally {
      setLoading(false)
    }
  }

  const setDemoReviews = () => {
    setReviews([
      { id: '1', rating: 5, comment: 'Amazing experience! The staff was incredibly friendly.', guest: { full_name: 'Sarah Johnson' } },
      { id: '2', rating: 4, comment: 'Great location and beautiful views.', guest: { full_name: 'Michael Chen' } },
      { id: '3', rating: 5, comment: 'Perfect stay for our anniversary!', guest: { full_name: 'Emily Rodriguez' } },
    ])
  }

  const handleQuickSearch = (e) => {
    e.preventDefault()
    // Navigate to rooms page with search params
    const params = new URLSearchParams()
    if (quickSearch.check_in) params.set('check_in', quickSearch.check_in)
    if (quickSearch.check_out) params.set('check_out', quickSearch.check_out)
    if (quickSearch.guests) params.set('guests', quickSearch.guests)
    navigate(`/rooms?${params.toString()}`)
  }

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          star <= rating ? (
            <StarSolidIcon key={star} className="w-5 h-5 text-yellow-400" />
          ) : (
            <StarIcon key={star} className="w-5 h-5 text-gray-300" />
          )
        ))}
      </div>
    )
  }

  return (
    <PublicLayout>
      {/* Hero Section */}
      <HeroSection />

      {/* Quick Booking Search */}
      <section className="py-8 bg-white -mt-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="card shadow-xl max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold mb-4">Find Your Perfect Room</h2>
            <form onSubmit={handleQuickSearch}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  type="date"
                  value={quickSearch.check_in}
                  onChange={(e) => setQuickSearch({...quickSearch, check_in: e.target.value})}
                  className="input"
                  placeholder="Check-in"
                  min={new Date().toISOString().split('T')[0]}
                />
                <input
                  type="date"
                  value={quickSearch.check_out}
                  onChange={(e) => setQuickSearch({...quickSearch, check_out: e.target.value})}
                  className="input"
                  placeholder="Check-out"
                  min={quickSearch.check_in || new Date().toISOString().split('T')[0]}
                />
                <select
                  value={quickSearch.guests}
                  onChange={(e) => setQuickSearch({...quickSearch, guests: parseInt(e.target.value)})}
                  className="input"
                >
                  {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} Guest{n>1?'s':''}</option>)}
                </select>
                <button type="submit" className="btn btn-primary">
                  Check Availability
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Room Types Preview */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">Our Room Types</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Choose from our selection of comfortable and well-appointed rooms
          </p>

          {loading ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {roomTypes.map(type => (
                <div key={type.id} className="card hover:shadow-lg transition group">
                  {type.images && type.images[0] ? (
                    <img
                      src={type.images[0]}
                      alt={type.name}
                      className="w-full h-48 object-cover rounded-lg mb-4 group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg mb-4 flex items-center justify-center">
                      <span className="text-gray-500 text-2xl">🏨</span>
                    </div>
                  )}
                  
                  <h3 className="text-xl font-bold mb-2">{type.name}</h3>
                  
                  <div className="flex items-center gap-2 mb-2 text-gray-600">
                    <UsersIcon className="w-4 h-4" />
                    <span className="text-sm">Up to {type.capacity} guests</span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{type.description}</p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(type.base_price)}
                      <span className="text-sm font-normal text-gray-500">/night</span>
                    </p>
                    <Link
                      to={`/rooms/${type.id}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/rooms" className="btn btn-primary">
              View All Room Types
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Why Choose HotelHub?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏨</span>
              </div>
              <h3 className="font-semibold mb-2">Luxury Rooms</h3>
              <p className="text-sm text-gray-600">Comfortable and well-appointed accommodations</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🍽️</span>
              </div>
              <h3 className="font-semibold mb-2">Fine Dining</h3>
              <p className="text-sm text-gray-600">Exceptional cuisine in elegant surroundings</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏊</span>
              </div>
              <h3 className="font-semibold mb-2">Pool & Spa</h3>
              <p className="text-sm text-gray-600">Relax and rejuvenate in our wellness facilities</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📍</span>
              </div>
              <h3 className="font-semibold mb-2">Prime Location</h3>
              <p className="text-sm text-gray-600">Centrally located with easy access to attractions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">Guest Testimonials</h2>
          <p className="text-gray-600 text-center mb-12">What our guests say about us</p>

          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {reviews.map(review => (
                <div key={review.id} className="card">
                  <div className="mb-4">
                    {renderStars(review.rating)}
                  </div>
                  <p className="text-gray-700 mb-4 italic">"{review.comment}"</p>
                  <p className="font-semibold text-gray-900">
                    {review.guest?.full_name || 'Guest'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {review.created_at ? new Date(review.created_at).toLocaleDateString() : 'Recent stay'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-600">
              <p>No reviews yet. Be the first to leave a review!</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
          <p className="text-blue-100 mb-8 max-w-md mx-auto">
            Get exclusive offers and updates delivered to your inbox
          </p>
          <div className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900"
            />
            <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}

export default HomePage