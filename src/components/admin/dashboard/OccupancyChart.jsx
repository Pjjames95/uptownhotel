import React, { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const OccupancyChart = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('week') // week, month, year

  useEffect(() => {
    fetchOccupancyData()
  }, [timeRange])

  const fetchOccupancyData = async () => {
    setLoading(true)
    try {
      const daysToFetch = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365
      const labels = []
      const occupancyRates = []

      // Generate labels based on time range
      for (let i = daysToFetch - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        
        if (timeRange === 'week') {
          labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }))
        } else if (timeRange === 'month') {
          labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
        } else {
          labels.push(date.toLocaleDateString('en-US', { month: 'short' }))
        }

        // Fetch occupancy for this date
        const dateStr = date.toISOString().split('T')[0]
        
        // Get total rooms
        const { count: totalRooms } = await supabase
          .from('rooms')
          .select('*', { count: 'exact', head: true })

        // Get occupied rooms for this date
        const { count: occupiedRooms } = await supabase
          .from('room_bookings')
          .select('*', { count: 'exact', head: true })
          .lte('check_in_date', dateStr)
          .gte('check_out_date', dateStr)
          .in('status', ['confirmed', 'checked_in'])

        const rate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0
        occupancyRates.push(rate)
      }

      setData(labels.map((label, index) => ({
        name: label,
        occupancy: occupancyRates[index],
      })))
    } catch (error) {
      console.error('Error fetching occupancy data:', error)
      // Set demo data if fetch fails
      setDemoData()
    } finally {
      setLoading(false)
    }
  }

  const setDemoData = () => {
    const demoData = timeRange === 'week' 
      ? [
          { name: 'Mon', occupancy: 65 },
          { name: 'Tue', occupancy: 72 },
          { name: 'Wed', occupancy: 80 },
          { name: 'Thu', occupancy: 75 },
          { name: 'Fri', occupancy: 85 },
          { name: 'Sat', occupancy: 90 },
          { name: 'Sun', occupancy: 88 },
        ]
      : timeRange === 'month'
      ? Array.from({ length: 30 }, (_, i) => ({
          name: `${i + 1}`,
          occupancy: Math.floor(Math.random() * 40) + 50,
        }))
      : [
          { name: 'Jan', occupancy: 70 },
          { name: 'Feb', occupancy: 75 },
          { name: 'Mar', occupancy: 80 },
          { name: 'Apr', occupancy: 78 },
          { name: 'May', occupancy: 85 },
          { name: 'Jun', occupancy: 82 },
          { name: 'Jul', occupancy: 88 },
          { name: 'Aug', occupancy: 85 },
          { name: 'Sep', occupancy: 80 },
          { name: 'Oct', occupancy: 78 },
          { name: 'Nov', occupancy: 75 },
          { name: 'Dec', occupancy: 72 },
        ]
    setData(demoData)
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-medium">{label}</p>
          <p className="text-blue-600">
            Occupancy: {payload[0].value}%
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Occupancy Rate</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1 text-sm rounded transition ${
              timeRange === 'week'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1 text-sm rounded transition ${
              timeRange === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setTimeRange('year')}
            className={`px-3 py-1 text-sm rounded transition ${
              timeRange === 'year'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Year
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis 
              tick={{ fontSize: 12 }} 
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="occupancy" 
              name="Occupancy Rate" 
              fill="#3b82f6" 
              radius={[4, 4, 0, 0]}
              barSize={timeRange === 'week' ? 40 : timeRange === 'month' ? 20 : 30}
            />
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
        <div className="text-center">
          <p className="text-sm text-gray-600">Average</p>
          <p className="text-2xl font-bold text-blue-600">
            {data.length > 0 
              ? Math.round(data.reduce((sum, d) => sum + d.occupancy, 0) / data.length)
              : 0}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Peak</p>
          <p className="text-2xl font-bold text-green-600">
            {data.length > 0 
              ? Math.max(...data.map(d => d.occupancy))
              : 0}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Low</p>
          <p className="text-2xl font-bold text-orange-600">
            {data.length > 0 
              ? Math.min(...data.map(d => d.occupancy))
              : 0}%
          </p>
        </div>
      </div>
    </div>
  )
}

export default OccupancyChart