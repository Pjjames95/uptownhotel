import React, { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import OccupancyChart from './OccupancyChart'
import RevenueChart from './RevenueChart'

const DashboardHome = () => {
  const [stats, setStats] = useState({
    totalRooms: 0,
    occupiedRooms: 0,
    totalBookings: 0,
    totalRevenue: 0,
  })

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      // Fetch rooms
      const { data: roomsData } = await supabase
        .from('rooms')
        .select('*')

      const { data: bookingsData } = await supabase
        .from('room_bookings')
        .select('*')
        .in('status', ['confirmed', 'checked_in'])

      const { data: invoicesData } = await supabase
        .from('invoices')
        .select('total_amount')
        .eq('payment_status', 'completed')

      setStats({
        totalRooms: roomsData?.length || 0,
        occupiedRooms: bookingsData?.length || 0,
        totalBookings: bookingsData?.length || 0,
        totalRevenue: invoicesData?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Rooms"
          value={stats.totalRooms}
          color="bg-blue-500"
        />
        <StatCard
          title="Occupied Rooms"
          value={stats.occupiedRooms}
          color="bg-red-500"
        />
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings}
          color="bg-green-500"
        />
        <StatCard
          title="Total Revenue"
          value={`KES ${stats.totalRevenue.toLocaleString()}`}
          color="bg-purple-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OccupancyChart />
        <RevenueChart />
      </div>
    </div>
  )
}

const StatCard = ({ title, value, color }) => {
  return (
    <div className={`${color} rounded-lg shadow-md p-6 text-white`}>
      <p className="text-sm font-medium opacity-90">{title}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  )
}

export default DashboardHome