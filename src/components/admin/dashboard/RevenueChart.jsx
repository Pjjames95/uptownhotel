import React, { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../context/AuthContext'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { formatCurrency } from '../../../utils/currency'
import mpesaService from '../../../services/mpesaService'

const RevenueChart = () => {
  const { profile } = useAuth()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('week')
  const [chartType, setChartType] = useState('area')
  const [paymentStats, setPaymentStats] = useState({
    total: 0,
    mpesa: 0,
    cash: 0,
    card: 0,
    pending: 0,
    completed: 0
  })

  const canViewFinancials = profile?.role && 
    ['super_admin', 'hotel_manager'].includes(profile.role)

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
      const mpesaData = []
      const cashData = []

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

        const startDate = new Date(date)
        startDate.setHours(0, 0, 0, 0)
        const endDate = new Date(date)
        endDate.setHours(23, 59, 59, 999)

        const startDateStr = startDate.toISOString()
        const endDateStr = endDate.toISOString()

        // Fetch completed payments from payment_transactions
        const { data: payments } = await supabase
          .from('payment_transactions')
          .select('amount, payment_method')
          .eq('status', 'completed')
          .gte('payment_date', startDateStr)
          .lte('payment_date', endDateStr)

        const periodRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0
        const periodMpesa = payments?.filter(p => p.payment_method === 'mpesa')
          .reduce((sum, p) => sum + (p.amount || 0), 0) || 0
        const periodCash = payments?.filter(p => p.payment_method === 'cash')
          .reduce((sum, p) => sum + (p.amount || 0), 0) || 0

        revenueData.push(periodRevenue)
        mpesaData.push(periodMpesa)
        cashData.push(periodCash)

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
        mpesa: mpesaData[index],
        cash: cashData[index],
        bookings: bookingsData[index],
      })))

      // Fetch overall payment stats for the period
      await fetchPaymentStats()
    } catch (error) {
      console.error('Error fetching revenue data:', error)
      setDemoData()
    } finally {
      setLoading(false)
    }
  }

  const fetchPaymentStats = async () => {
    try {
      const daysToFetch = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 12
      const startDate = new Date()
      
      if (timeRange === 'week' || timeRange === 'month') {
        startDate.setDate(startDate.getDate() - daysToFetch)
      } else {
        startDate.setMonth(startDate.getMonth() - daysToFetch)
      }
      startDate.setHours(0, 0, 0, 0)
      
      const endDate = new Date()
      endDate.setHours(23, 59, 59, 999)

      const stats = await mpesaService.getPaymentStats(startDate.toISOString(), endDate.toISOString())
      
      // Also get pending payments
      const { data: pendingPayments } = await supabase
        .from('payment_transactions')
        .select('amount')
        .eq('status', 'pending')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())

      const pendingAmount = pendingPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0

      setPaymentStats({
        ...stats,
        pending: pendingAmount,
        completed: stats.total
      })
    } catch (error) {
      console.error('Error fetching payment stats:', error)
    }
  }

  const setDemoData = () => {
    const demoData = timeRange === 'week'
      ? [
          { name: 'Mon', revenue: 45000, mpesa: 30000, cash: 15000, bookings: 8 },
          { name: 'Tue', revenue: 52000, mpesa: 35000, cash: 17000, bookings: 10 },
          { name: 'Wed', revenue: 48000, mpesa: 32000, cash: 16000, bookings: 9 },
          { name: 'Thu', revenue: 61000, mpesa: 40000, cash: 21000, bookings: 12 },
          { name: 'Fri', revenue: 75000, mpesa: 50000, cash: 25000, bookings: 15 },
          { name: 'Sat', revenue: 89000, mpesa: 60000, cash: 29000, bookings: 18 },
          { name: 'Sun', revenue: 72000, mpesa: 48000, cash: 24000, bookings: 14 },
        ]
      : timeRange === 'month'
      ? Array.from({ length: 30 }, (_, i) => ({
          name: `${i + 1}`,
          revenue: Math.floor(Math.random() * 50000) + 30000,
          mpesa: Math.floor(Math.random() * 30000) + 20000,
          cash: Math.floor(Math.random() * 20000) + 10000,
          bookings: Math.floor(Math.random() * 15) + 5,
        }))
      : [
          { name: 'Jan', revenue: 1250000, mpesa: 800000, cash: 450000, bookings: 150 },
          { name: 'Feb', revenue: 1180000, mpesa: 750000, cash: 430000, bookings: 140 },
          { name: 'Mar', revenue: 1350000, mpesa: 850000, cash: 500000, bookings: 165 },
          { name: 'Apr', revenue: 1420000, mpesa: 900000, cash: 520000, bookings: 175 },
          { name: 'May', revenue: 1580000, mpesa: 1000000, cash: 580000, bookings: 190 },
          { name: 'Jun', revenue: 1720000, mpesa: 1100000, cash: 620000, bookings: 210 },
          { name: 'Jul', revenue: 1890000, mpesa: 1200000, cash: 690000, bookings: 230 },
          { name: 'Aug', revenue: 1950000, mpesa: 1250000, cash: 700000, bookings: 240 },
          { name: 'Sep', revenue: 1680000, mpesa: 1050000, cash: 630000, bookings: 200 },
          { name: 'Oct', revenue: 1520000, mpesa: 950000, cash: 570000, bookings: 185 },
          { name: 'Nov', revenue: 1450000, mpesa: 900000, cash: 550000, bookings: 175 },
          { name: 'Dec', revenue: 2100000, mpesa: 1350000, cash: 750000, bookings: 260 },
        ]
    setData(demoData)
    setPaymentStats({
      total: demoData.reduce((sum, d) => sum + d.revenue, 0),
      mpesa: demoData.reduce((sum, d) => sum + (d.mpesa || 0), 0),
      cash: demoData.reduce((sum, d) => sum + (d.cash || 0), 0),
      card: 0,
      pending: 50000,
      completed: demoData.reduce((sum, d) => sum + d.revenue, 0)
    })
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((item, index) => (
            <p key={index} style={{ color: item.color }}>
              {item.name}: {item.name === 'bookings' ? item.value : formatCurrency(item.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const totalRevenue = data.reduce((sum, d) => sum + (d.revenue || 0), 0)
  const totalMpesa = data.reduce((sum, d) => sum + (d.mpesa || 0), 0)
  const totalCash = data.reduce((sum, d) => sum + (d.cash || 0), 0)
  const totalBookings = data.reduce((sum, d) => sum + (d.bookings || 0), 0)

  if (!canViewFinancials) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Revenue Overview</h3>
        <div className="text-center py-10 text-gray-600">
          <p>You don't have permission to view financial data</p>
        </div>
      </div>
    )
  }

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

      {/* Payment Method Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
          <p className="text-xs text-gray-600">Total Revenue</p>
          <p className="text-xl font-bold text-green-700">{formatCurrency(paymentStats.total)}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-4">
          <p className="text-xs text-gray-600">M-Pesa</p>
          <p className="text-xl font-bold text-emerald-700">{formatCurrency(paymentStats.mpesa)}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <p className="text-xs text-gray-600">Cash</p>
          <p className="text-xl font-bold text-blue-700">{formatCurrency(paymentStats.cash)}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
          <p className="text-xs text-gray-600">Pending</p>
          <p className="text-xl font-bold text-orange-700">{formatCurrency(paymentStats.pending)}</p>
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
                name="Total Revenue"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.3}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="mpesa"
                name="M-Pesa"
                stroke="#059669"
                fill="#059669"
                fillOpacity={0.2}
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
                name="Total Revenue"
                stroke="#10b981"
                strokeWidth={2}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="mpesa"
                name="M-Pesa"
                stroke="#059669"
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
      <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t">
        <div className="text-center">
          <p className="text-sm text-gray-600">Total Revenue</p>
          <p className="text-xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">M-Pesa Revenue</p>
          <p className="text-xl font-bold text-emerald-600">{formatCurrency(totalMpesa)}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Cash Revenue</p>
          <p className="text-xl font-bold text-blue-600">{formatCurrency(totalCash)}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Total Bookings</p>
          <p className="text-xl font-bold text-orange-600">{totalBookings}</p>
        </div>
      </div>
    </div>
  )
}

export default RevenueChart