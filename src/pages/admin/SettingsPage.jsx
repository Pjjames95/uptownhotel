import React, { useState } from 'react'
import AdminLayout from '../../components/admin/layout/AdminLayout'
import ProtectedRoute from '../../components/admin/auth/ProtectedRoute'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

const SettingsPage = () => {
  const { profile } = useAuth()
  const [activeTab, setActiveTab] = useState('general')
  const [generalSettings, setGeneralSettings] = useState({
    hotel_name: 'HotelHub',
    hotel_email: 'info@hotelhub.com',
    hotel_phone: '+254712345678',
    hotel_address: '123 Hotel Street, Nairobi, Kenya',
    currency: 'KES',
    tax_rate: '16',
    check_in_time: '14:00',
    check_out_time: '11:00',
  })
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })
  const [notificationSettings, setNotificationSettings] = useState({
    email_booking_confirmation: true,
    email_checkin_reminder: true,
    email_review_request: true,
    sms_notifications: false,
  })

  const handleGeneralSubmit = async (e) => {
    e.preventDefault()
    // In production, save to settings table
    toast.success('Settings saved successfully')
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('Passwords do not match')
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.new_password,
      })

      if (error) throw error
      toast.success('Password updated successfully')
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      })
    } catch (error) {
      toast.error('Failed to update password')
    }
  }

  const handleNotificationSubmit = (e) => {
    e.preventDefault()
    toast.success('Notification preferences saved')
  }

  const tabs = [
    { id: 'general', label: 'General Settings' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'security', label: 'Security' },
    { id: 'backup', label: 'Backup & Data' },
  ]

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div>
          <h1 className="text-3xl font-bold mb-6">Settings</h1>

          <div className="bg-white rounded-lg shadow-md">
            {/* Tabs */}
            <div className="flex border-b">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 font-medium transition ${
                    activeTab === tab.id
                      ? 'border-b-4 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'general' && (
                <form onSubmit={handleGeneralSubmit} className="max-w-2xl space-y-4">
                  <h3 className="text-lg font-semibold mb-4">General Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hotel Name
                      </label>
                      <input
                        type="text"
                        value={generalSettings.hotel_name}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, hotel_name: e.target.value })}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hotel Email
                      </label>
                      <input
                        type="email"
                        value={generalSettings.hotel_email}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, hotel_email: e.target.value })}
                        className="input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hotel Phone
                      </label>
                      <input
                        type="tel"
                        value={generalSettings.hotel_phone}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, hotel_phone: e.target.value })}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Currency
                      </label>
                      <select
                        value={generalSettings.currency}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, currency: e.target.value })}
                        className="input"
                      >
                        <option value="KES">KES - Kenyan Shilling</option>
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hotel Address
                    </label>
                    <textarea
                      value={generalSettings.hotel_address}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, hotel_address: e.target.value })}
                      className="input"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tax Rate (%)
                      </label>
                      <input
                        type="number"
                        value={generalSettings.tax_rate}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, tax_rate: e.target.value })}
                        className="input"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Check-in Time
                      </label>
                      <input
                        type="time"
                        value={generalSettings.check_in_time}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, check_in_time: e.target.value })}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Check-out Time
                      </label>
                      <input
                        type="time"
                        value={generalSettings.check_out_time}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, check_out_time: e.target.value })}
                        className="input"
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary">
                    Save Changes
                  </button>
                </form>
              )}

              {activeTab === 'notifications' && (
                <form onSubmit={handleNotificationSubmit} className="max-w-2xl space-y-4">
                  <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
                  
                  <div className="space-y-3">
                    {Object.entries(notificationSettings).map(([key, value]) => (
                      <label key={key} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => setNotificationSettings({
                            ...notificationSettings,
                            [key]: e.target.checked,
                          })}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="capitalize">
                          {key.replace(/_/g, ' ')}
                        </span>
                      </label>
                    ))}
                  </div>

                  <button type="submit" className="btn btn-primary">
                    Save Preferences
                  </button>
                </form>
              )}

              {activeTab === 'security' && (
                <form onSubmit={handlePasswordSubmit} className="max-w-md space-y-4">
                  <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.current_password}
                      onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                      className="input"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                      className="input"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirm_password}
                      onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                      className="input"
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary">
                    Update Password
                  </button>
                </form>
              )}

              {activeTab === 'backup' && (
                <div className="max-w-2xl">
                  <h3 className="text-lg font-semibold mb-4">Backup & Data Management</h3>
                  
                  <div className="space-y-4">
                    <div className="card bg-gray-50">
                      <h4 className="font-semibold mb-2">Export Data</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Download a backup of all your hotel data including bookings, guests, and financial records.
                      </p>
                      <button className="btn btn-secondary">
                        Export Data
                      </button>
                    </div>

                    <div className="card bg-red-50 border border-red-200">
                      <h4 className="font-semibold text-red-800 mb-2">Danger Zone</h4>
                      <p className="text-sm text-red-600 mb-4">
                        These actions are irreversible. Please proceed with caution.
                      </p>
                      <div className="space-y-2">
                        <button className="btn bg-red-600 text-white hover:bg-red-700">
                          Clear All Test Data
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  )
}

export default SettingsPage