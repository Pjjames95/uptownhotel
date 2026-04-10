import React, { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { formatCurrency } from '../../../utils/currency'

const RevenueChart = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('week') // week, month, year
  const [chartType, setChartType] = useState('area') // area, line

  useEffect(() => {
    fetchRevenueData()
  }, [timeRange])

  const fetchRevenueData = async () => {
    setLoading(true)
    try {
      const daysToFetch = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 12
      const labels = []
      const revenueData = []
      const bookingsData = []

      for (let i = daysToFetch - 1; i >= 0; i--) {
        const date = new Date()
        
        if (timeRange === 'week' || timeRange === 'month') {
          date.setDate(date.getDate() - i)
          labels.push(date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          }))
        } else {
          date.setMonth(date.getMonth() - i)
          labels.push(date.toLocaleDateString('en-US', { 
            month: 'short',
            year: '2-digit'
          }))
        }

        // Get start and end of the period
        const startDate = new Date(date)
        startDate.setHours(0, 0, 0, 0)
        const endDate = new Date(date)
        endDate.setHours(23, 59, 59, 999)

        const startDateStr = startDate.toISOString()
        const endDateStr = endDate.toISOString()

        // Fetch revenue for this period
        const { data: invoices } = await supabase
          .from('invoices')
          .select('total_amount')
          .eq('payment_status', 'completed')
          .gte('invoice_date', startDateStr)
          .lte('invoice_date', endDateStr)

        const periodRevenue = invoices?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0
        revenueData.push(periodRevenue)

        // Fetch booking count
        const { count: bookingCount } = await supabase
          .from('room_bookings')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startDateStr)
          .lte('created_at', endDateStr)

        bookingsData.push(bookingCount || 0)
      }

      setData(labels.map((label, index) => ({
        name: label,
        revenue: revenueData[index],
        bookings: bookingsData[index],
      })))
    } catch (error) {
      console.error('Error fetching revenue data:', error)
      setDemoData()
    } finally {
      setLoading(false)
    }
  }

  const setDemoData = () => {
    const demoData = timeRange === 'week'
      ? [
          { name: 'Mon', revenue: 45000, bookings: 8 },
          { name: 'Tue', revenue: 52000, bookings: 10 },
          { name: 'Wed', revenue: 48000, bookings: 9 },
          { name: 'Thu', revenue: 61000, bookings: 12 },
          { name: 'Fri', revenue: 75000, bookings: 15 },
          { name: 'Sat', revenue: 89000, bookings: 18 },
          { name: 'Sun', revenue: 72000, bookings: 14 },
        ]
      : timeRange === 'month'
      ? Array.from({ length: 30 }, (_, i) => ({
          name: `${i + 1}`,
          revenue: Math.floor(Math.random() * 50000) + 30000,
          bookings: Math.floor(Math.random() * 15) + 5,
        }))
      : [
          { name: 'Jan', revenue: 1250000, bookings: 150 },
          { name: 'Feb', revenue: 1180000, bookings: 140 },
          { name: 'Mar', revenue: 1350000, bookings: 165 },
          { name: 'Apr', revenue: 1420000, bookings: 175 },
          { name: 'May', revenue: 1580000, bookings: 190 },
          { name: 'Jun', revenue: 1720000, bookings: 210 },
          { name: 'Jul', revenue: 1890000, bookings: 230 },
          { name: 'Aug', revenue: 1950000, bookings: 240 },
          { name: 'Sep', revenue: 1680000, bookings: 200 },
          { name: 'Oct', revenue: 1520000, bookings: 185 },
          { name: 'Nov', revenue: 1450000, bookings: 175 },
          { name: 'Dec', revenue: 2100000, bookings: 260 },
        ]
    setData(demoData)
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((item, index) => (
            <p key={index} style={{ color: item.color }}>
              {item.name}: {item.name === 'revenue' 
                ? formatCurrency(item.value)
                : item.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0)
  const totalBookings = data.reduce((sum, d) => sum + d.bookings, 0)
  const averageRevenue = data.length > 0 ? totalRevenue / data.length : 0

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Revenue Overview</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1 text-sm rounded transition ${
              timeRange === 'week'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1 text-sm rounded transition ${
              timeRange === 'month'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setTimeRange('year')}
            className={`px-3 py-1 text-sm rounded transition ${
              timeRange === 'year'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Year
          </button>
          <button
            onClick={() => setChartType(chartType === 'area' ? 'line' : 'area')}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition"
          >
            {chartType === 'area' ? '📈 Line' : '📊 Area'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          {chartType === 'area' ? (
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis 
                yAxisId="left"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => formatCurrency(value).replace('KSh', '')}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.3}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="bookings"
                name="Bookings"
                stroke="#f59e0b"
                strokeWidth={2}
              />
            </AreaChart>
          ) : (
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis 
                yAxisId="left"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => formatCurrency(value).replace('KSh', '')}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#10b981"
                strokeWidth={2}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="bookings"
                name="Bookings"
                stroke="#f59e0b"
                strokeWidth={2}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
        <div className="text-center">
          <p className="text-sm text-gray-600">Total Revenue</p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(totalRevenue)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Total Bookings</p>
          <p className="text-2xl font-bold text-blue-600">
            {totalBookings}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Avg. Daily Revenue</p>
          <p className="text-2xl font-bold text-purple-600">
            {formatCurrency(averageRevenue)}
          </p>
        </div>
      </div>
    </div>
  )
}

export default RevenueChart