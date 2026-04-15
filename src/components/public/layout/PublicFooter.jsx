import React from 'react'
import { Link } from 'react-router-dom'
import { EnvelopeIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline'

const PublicFooter = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4">🏨 UptownHotel</h3>
            <p className="text-gray-400 text-sm">
              Experience luxury and comfort at UptownHotel. Your perfect stay awaits.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link to="/rooms" className="hover:text-white transition">Rooms</Link></li>
              <li><Link to="/restaurant" className="hover:text-white transition">Restaurant</Link></li>
              <li><Link to="/events" className="hover:text-white transition">Events</Link></li>
              <li><Link to="/contact" className="hover:text-white transition">Contact</Link></li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="font-semibold mb-4">Policies</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition">Cancellation Policy</a></li>
              <li><a href="#" className="hover:text-white transition">Cookie Policy</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <div className="space-y-3 text-gray-400 text-sm">
              <div className="flex items-start gap-2">
                <MapPinIcon className="w-5 h-5 mt-1 flex-shrink-0" />
                <span>1243 Central Street, Uptown, Kisii, Kenya</span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneIcon className="w-5 h-5 flex-shrink-0" />
                <a href="tel:+254741194238" className="hover:text-white transition">+254 741 194 238</a>
              </div>
              <div className="flex items-center gap-2">
                <EnvelopeIcon className="w-5 h-5 flex-shrink-0" />
                <a href="mailto:info@uptownhotel.com" className="hover:text-white transition">info@uptownhotel.com</a>
              </div>
            </div>
          </div>
        </div>

        <hr className="border-gray-800 mb-8" />

        {/* Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
          <p>&copy; 2026 UptownHotel. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition">Facebook</a>
            <a href="#" className="hover:text-white transition">Twitter</a>
            <a href="#" className="hover:text-white transition">Instagram</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default PublicFooter