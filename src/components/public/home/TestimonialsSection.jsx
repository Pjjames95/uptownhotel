import React, { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { StarIcon } from '@heroicons/react/24/solid'

const TestimonialsSection = () => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('guest_reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          guest:guest_id (
            full_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(3)

      if (error) {
        console.warn('Error fetching reviews, using demo data:', error.message)
        setDemoReviews()
        return
      }
      
      setReviews(data || [])
    } catch (error) {
      console.warn('Error fetching reviews, using demo data:', error)
      setDemoReviews()
    } finally {
      setLoading(false)
    }
  }

  const setDemoReviews = () => {
    // Demo reviews for when database is not accessible
    setReviews([
      {
        id: '1',
        rating: 5,
        comment: 'Amazing experience! The staff was incredibly friendly and the room was spotless.',
        guest: { full_name: 'Sarah Johnson' },
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        rating: 4,
        comment: 'Great location and beautiful views. The restaurant food was delicious.',
        guest: { full_name: 'Michael Chen' },
        created_at: new Date().toISOString(),
      },
      {
        id: '3',
        rating: 5,
        comment: 'Perfect stay for our anniversary. Will definitely come back!',
        guest: { full_name: 'Emily Rodriguez' },
        created_at: new Date().toISOString(),
      },
    ])
  }

  if (loading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Guest Testimonials</h2>
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">Guest Testimonials</h2>

        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map(review => (
              <div key={review.id} className="card">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`w-5 h-5 ${
                        i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>

                <p className="text-gray-700 mb-4 italic">"{review.comment}"</p>

                <p className="font-semibold text-gray-900">
                  {review.guest?.full_name || 'Guest'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(review.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-600">
            <p>No reviews yet. Be the first to leave a review!</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default TestimonialsSection