import React, { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../context/AuthContext'
import OccupancyChart from './OccupancyChart'
import RevenueChart from './RevenueChart'
import StaffOverview from './StaffOverview'
import { 
  BuildingLibraryIcon, 
  UsersIcon, 
  CurrencyDollarIcon, 
  CalendarIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline'
import { formatCurrency } from '../../../utils/currency'

const DashboardHome = () => {
  const { profile } = useAuth()
  const [stats, setStats] = useState({
    totalRooms: 0,
    occupiedRooms: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingBookings: 0,
    todayCheckins: 0,
    todayCheckouts: 0,
  })
  const [recentBookings, setRecentBookings] = useState([])
  const [loading, setLoading] = useState(true)

  const isSuperAdmin = profile?.role === 'super_admin'
  const isManager = profile?.role && ['super_admin', 'hotel_manager'].includes(profile.role)

  useEffect(() => {
    fetchDashboardStats()
    fetchRecentBookings()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]

      // Fetch rooms
      const { data: roomsData } = await supabase
        .from('rooms')
        .select('*')

      // Fetch active bookings
      const { data: activeBookings } = await supabase
        .from('room_bookings')
        .select('*')
        .in('status', ['confirmed', 'checked_in'])

      // Fetch pending bookings
      const { data: pendingBookings } = await supabase
        .from('room_bookings')
        .select('*')
        .eq('status', 'pending')

      // Fetch today's check-ins
      const { data: todayCheckins } = await supabase
        .from('room_bookings')
        .select('*')
        .eq('check_in_date', today)
        .in('status', ['confirmed', 'pending'])

      // Fetch today's check-outs
      const { data: todayCheckouts } = await supabase
        .from('room_bookings')
        .select('*')
        .eq('check_out_date', today)
        .eq('status', 'checked_in')

      // Fetch completed invoices
      const { data: invoicesData } = await supabase
        .from('invoices')
        .select('total_amount, created_at')
        .eq('payment_status', 'completed')

      const thisMonthStart = new Date()
      thisMonthStart.setDate(1)
      thisMonthStart.setHours(0, 0, 0, 0)

      const thisMonthRevenue = invoicesData?.filter(inv => 
        inv.created_at && new Date(inv.created_at) >= thisMonthStart
      ).reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0

      setStats({
        totalRooms: roomsData?.length || 0,
        occupiedRooms: activeBookings?.filter(b => b.status === 'checked_in').length || 0,
        totalBookings: activeBookings?.length || 0,
        totalRevenue: thisMonthRevenue,
        pendingBookings: pendingBookings?.length || 0,
        todayCheckins: todayCheckins?.length || 0,
        todayCheckouts: todayCheckouts?.length || 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchRecentBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('room_bookings')
        .select('*, guest:profiles!room_bookings_guest_id_fkey(full_name), room:rooms(room_number)')
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error
      setRecentBookings(data || [])
    } catch (error) {
      console.error('Error fetching recent bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const occupancyRate = stats.totalRooms > 0 
    ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100)
    : 0

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {profile?.full_name || 'Admin'}
          </p>
        </div>
        <p className="text-gray-600">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Rooms"
          value={stats.totalRooms}
          subtitle={`${stats.occupiedRooms} occupied`}
          icon={<BuildingLibraryIcon className="w-6 h-6" />}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          trend={occupancyRate}
          trendLabel="Occupancy"
        />
        <StatCard
          title="Active Bookings"
          value={stats.totalBookings}
          subtitle={`${stats.pendingBookings} pending`}
          icon={<CalendarIcon className="w-6 h-6" />}
          color="bg-gradient-to-br from-green-500 to-green-600"
        />
        <StatCard
          title="Today's Activity"
          value={`${stats.todayCheckins} / ${stats.todayCheckouts}`}
          subtitle="Check-ins / Check-outs"
          icon={<UsersIcon className="w-6 h-6" />}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(stats.totalRevenue)}
          subtitle="This month"
          icon={<CurrencyDollarIcon className="w-6 h-6" />}
          color="bg-gradient-to-br from-orange-500 to-orange-600"
        />
      </div>

      {/* Staff Overview - Only for Super Admin */}
      {isSuperAdmin && (
        <div className="mb-8">
          <StaffOverview />
        </div>
      )}

      {/* Charts - For Managers and Super Admin */}
      {isManager && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <OccupancyChart />
          <RevenueChart />
        </div>
      )}

      {/* Recent Bookings */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Bookings</h2>
          <button className="text-blue-600 hover:underline text-sm">
            View All
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : recentBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guest</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-in</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-out</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentBookings.map(booking => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{booking.guest?.full_name || 'Guest'}</td>
                    <td className="px-4 py-3">Room {booking.room?.room_number}</td>
                    <td className="px-4 py-3">{new Date(booking.check_in_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{new Date(booking.check_out_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        booking.status === 'checked_in' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {formatCurrency(booking.total_amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center py-8 text-gray-600">No recent bookings</p>
        )}
      </div>
    </div>
  )
}

const StatCard = ({ title, value, subtitle, icon, color, trend, trendLabel }) => {
  return (
    <div className={`${color} rounded-lg shadow-lg p-6 text-white`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium opacity-90">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {subtitle && (
            <p className="text-sm opacity-75 mt-1">{subtitle}</p>
          )}
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {trend > 50 ? (
                <ArrowUpIcon className="w-4 h-4 text-green-200" />
              ) : (
                <ArrowDownIcon className="w-4 h-4 text-red-200" />
              )}
              <span className="text-sm opacity-90">{trend}% {trendLabel}</span>
            </div>
          )}
        </div>
        <div className="p-3 bg-white bg-opacity-20 rounded-lg">
          {icon}
        </div>
      </div>
    </div>
  )
}

export default DashboardHome