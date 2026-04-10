import React from 'react'
import PublicLayout from '../../components/public/layout/PublicLayout'
import HeroSection from '../../components/public/home/HeroSection'
import RoomPreview from '../../components/public/home/RoomPreview'
import MenuPreview from '../../components/public/home/MenuPreview'
import EventsPreview from '../../components/public/home/EventsPreview'
import TestimonialsSection from '../../components/public/home/TestimonialsSection'

const HomePage = () => {
  return (
    <PublicLayout>
      <HeroSection />
      <RoomPreview />
      <MenuPreview />
      <EventsPreview />
      <TestimonialsSection />
      
      {/* Newsletter Subscription */}
      <section className="bg-blue-600 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
          <p className="text-blue-100 mb-6">Get exclusive offers and updates delivered to your inbox</p>
          <div className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 rounded text-gray-900"
            />
            <button className="btn btn-primary bg-white text-blue-600 hover:bg-gray-100">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}

export default HomePage