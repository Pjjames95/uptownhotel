import React from 'react'
import { Link } from 'react-router-dom'

const HeroSection = () => {
  return (
    <section className="relative h-96 md:h-screen bg-gradient-to-r from-blue-600 to-blue-800 overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200)',
        }}
      />

      {/* Content */}
      <div className="relative h-full flex items-center justify-center text-center text-white px-4">
        <div className="max-w-2xl">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Welcome to UptownHotel</h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8">
            Experience Luxury and Comfort Like Never Before
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link to="/rooms" className="btn bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 font-semibold text-lg">
              Book a Room
            </Link>
            <Link to="/restaurant" className="btn border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 font-semibold text-lg">
              Reserve a Table
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection