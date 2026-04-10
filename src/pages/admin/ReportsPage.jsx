import React, { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/layout/AdminLayout'
import ProtectedRoute from '../../components/admin/auth/ProtectedRoute'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../utils/currency'
import { formatDateDisplay } from '../../utils/dateUtils'
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  BuildingLibraryIcon,
} from '@heroicons/react/24/outline'

const ReportsPage = () => {
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  })
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    occupancyRate: 0,
    averageDailyRate: 0,
  })
  const [recentBookings, setRecentBookings] = useState([])
  const [revenueByRoomType, setRevenueByRoomType] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReportData()
  }, [dateRange])

  const fetchReportData = async () => {
    setLoading(true)
    try {
      // Fetch bookings in date range
      const { data: bookings } = await supabase
        .from('room_bookings')
        .select('*, room:rooms(room_type, price_per_night)')
        .gte('check_in_date', dateRange.start)
        .lte('check_out_date', dateRange.end)
        .in('status', ['confirmed', 'checked_in', 'checked_out'])

      // Fetch invoices
      const { data: invoices } = await supabase
        .from('invoices')
        .select('*')
        .eq('payment_status', 'completed')
        .gte('invoice_date', dateRange.start)
        .lte('invoice_date', dateRange.end)

      // Calculate stats
      const totalRevenue = invoices?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0
      const totalBookings = bookings?.length || 0

      // Calculate revenue by room type
      const roomTypeRevenue = {}
      bookings?.forEach(booking => {
        const type = booking.room?.room_type || 'unknown'
        roomTypeRevenue[type] = (roomTypeRevenue[type] || 0) + (booking.total_amount || 0)
      })

      setStats({
        totalRevenue,
        totalBookings,
        occupancyRate: calculateOccupancyRate(bookings),
        averageDailyRate: totalBookings > 0 ? totalRevenue / totalBookings : 0,
      })

      setRecentBookings(bookings?.slice(0, 10) || [])
      setRevenueByRoomType(Object.entries(roomTypeRevenue).map(([type, amount]) => ({
        type,
        amount,
      })))
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateOccupancyRate = (bookings) => {
    if (!bookings?.length) return 0
    const totalRooms = 20 // This should come from rooms table count
    const occupiedRoomDays = bookings.reduce((sum, b) => {
      const nights = Math.ceil((new Date(b.check_out_date) - new Date(b.check_in_date)) / (1000 * 60 * 60 * 24))
      return sum + nights
    }, 0)
    const totalDays = Math.ceil((new Date(dateRange.end) - new Date(dateRange.start)) / (1000 * 60 * 60 * 24))
    return Math.round((occupiedRoomDays / (totalRooms * totalDays)) * 100)
  }

  const handleExportCSV = () => {
    // Implement CSV export
    const csvContent = recentBookings.map(b => ({
      reference: b.booking_reference,
      checkIn: b.check_in_date,
      checkOut: b.check_out_date,
      amount: b.total_amount,
      status: b.status,
    }))

    const csv = Papa.unparse(csvContent)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `report_${dateRange.start}_${dateRange.end}.csv`
    a.click()
  }

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Reports & Analytics</h1>
            <button onClick={handleExportCSV} className="btn btn-secondary">
              Export CSV
            </button>
          </div>

          {/* Date Range Selector */}
          <div className="card mb-6">
            <div className="flex gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="input"
                />
              </div>
              <button
                onClick={fetchReportData}
                className="btn btn-primary"
              >
                Generate Report
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Revenue</p>
                  <p className="text-3xl font-bold mt-2">{formatCurrency(stats.totalRevenue)}</p>
                </div>
                <CurrencyDollarIcon className="w-12 h-12 opacity-50" />
              </div>
            </div>

            <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Bookings</p>
                  <p className="text-3xl font-bold mt-2">{stats.totalBookings}</p>
                </div>
                <BuildingLibraryIcon className="w-12 h-12 opacity-50" />
              </div>
            </div>

            <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Occupancy Rate</p>
                  <p className="text-3xl font-bold mt-2">{stats.occupancyRate}%</p>
                </div>
                <ChartBarIcon className="w-12 h-12 opacity-50" />
              </div>
            </div>

            <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Avg. Daily Rate</p>
                  <p className="text-3xl font-bold mt-2">{formatCurrency(stats.averageDailyRate)}</p>
                </div>
                <UsersIcon className="w-12 h-12 opacity-50" />
              </div>
            </div>
          </div>

          {/* Revenue by Room Type */}
          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4">Revenue by Room Type</h2>
            <div className="space-y-3">
              {revenueByRoomType.map((item) => (
                <div key={item.type} className="flex items-center">
                  <span className="w-32 capitalize">{item.type}</span>
                  <div className="flex-1 mx-4">
                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{
                          width: `${(item.amount / stats.totalRevenue) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="w-32 text-right font-semibold">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Bookings Table */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Recent Bookings</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Reference</th>
                    <th className="px-4 py-2 text-left">Check-in</th>
                    <th className="px-4 py-2 text-left">Check-out</th>
                    <th className="px-4 py-2 text-left">Amount</th>
                    <th className="px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map(booking => (
                    <tr key={booking.id} className="border-b">
                      <td className="px-4 py-2 font-mono text-sm">
                        {booking.booking_reference}
                      </td>
                      <td className="px-4 py-2">{formatDateDisplay(booking.check_in_date)}</td>
                      <td className="px-4 py-2">{formatDateDisplay(booking.check_out_date)}</td>
                      <td className="px-4 py-2 font-semibold">
                        {formatCurrency(booking.total_amount)}
                      </td>
                      <td className="px-4 py-2">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  )
}

export default ReportsPage