import React, { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/layout/AdminLayout'
import ProtectedRoute from '../../components/admin/auth/ProtectedRoute'
import { useAuth } from '../../context/AuthContext'
import { useHotelSettings } from '../../hooks/useHotelSettings'
import { supabase } from '../../lib/supabase'
import PasswordInput from '../../components/common/PasswordInput'
import toast from 'react-hot-toast'

const SettingsPage = () => {
  const { profile } = useAuth()
  const { settings, loading: settingsLoading, updateSettings } = useHotelSettings()
  const [activeTab, setActiveTab] = useState('general')
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [generalSettings, setGeneralSettings] = useState({
    hotel_name: '',
    hotel_email: '',
    hotel_phone: '',
    hotel_address: '',
    currency: 'KES',
    tax_rate: '16',
    check_in_time: '14:00',
    check_out_time: '11:00',
  })

  // Update local state when settings are loaded
  useEffect(() => {
    if (settings) {
      setGeneralSettings({
        hotel_name: settings.hotel_name || '',
        hotel_email: settings.hotel_email || '',
        hotel_phone: settings.hotel_phone || '',
        hotel_address: settings.hotel_address || '',
        currency: settings.currency || 'KES',
        tax_rate: settings.tax_rate?.toString() || '16',
        check_in_time: settings.check_in_time || '14:00',
        check_out_time: settings.check_out_time || '11:00',
      })
    }
  }, [settings])

  const canManageSettings = profile?.role && 
    ['super_admin', 'hotel_manager'].includes(profile.role)

  const validatePasswordChange = () => {
    const newErrors = {}

    if (!passwordData.current_password) {
      newErrors.current_password = 'Current password is required'
    }

    if (!passwordData.new_password) {
      newErrors.new_password = 'New password is required'
    } else if (passwordData.new_password.length < 8) {
      newErrors.new_password = 'Password must be at least 8 characters'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.new_password)) {
      newErrors.new_password = 'Must contain uppercase, lowercase, and number'
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match'
    }

    if (passwordData.current_password === passwordData.new_password) {
      newErrors.new_password = 'New password must be different from current password'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()

    if (!validatePasswordChange()) {
      toast.error('Please fix the errors before submitting')
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      // Re-authenticate
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwordData.current_password,
      })

      if (signInError) {
        setErrors({ current_password: 'Current password is incorrect' })
        toast.error('Current password is incorrect')
        setLoading(false)
        return
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.new_password
      })

      if (updateError) throw updateError

      toast.success('Password updated successfully')
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      })
      setErrors({})
    } catch (error) {
      console.error('Password update error:', error)
      toast.error('Failed to update password: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGeneralSubmit = async (e) => {
    e.preventDefault()
    
    if (!canManageSettings) {
      toast.error('You do not have permission to modify settings')
      return
    }

    setLoading(true)

    try {
      const updates = {
        hotel_name: generalSettings.hotel_name,
        hotel_email: generalSettings.hotel_email,
        hotel_phone: generalSettings.hotel_phone,
        hotel_address: generalSettings.hotel_address,
        currency: generalSettings.currency,
        tax_rate: parseFloat(generalSettings.tax_rate),
        check_in_time: generalSettings.check_in_time,
        check_out_time: generalSettings.check_out_time,
        updated_by: profile?.id,
      }

      const result = await updateSettings(updates)
      
      if (result.success) {
        toast.success('Hotel settings saved successfully')
      }
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  const handleGeneralChange = (e) => {
    const { name, value } = e.target
    setGeneralSettings(prev => ({ ...prev, [name]: value }))
  }

  const handleChangePassword = () => {
    // Placeholder for password change
  }

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div>
          <h1 className="text-3xl font-bold mb-6">Settings</h1>

          <div className="bg-white rounded-lg shadow-md">
            {/* Tabs */}
            <div className="flex border-b">
              {['general', 'security', 'notifications'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 font-medium transition ${
                    activeTab === tab
                      ? 'border-b-4 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'general' && (
                <form onSubmit={handleGeneralSubmit} className="max-w-2xl space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Hotel Information</h3>
                    {!canManageSettings && (
                      <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded">
                        View only
                      </span>
                    )}
                  </div>
                  
                  {settingsLoading ? (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                      <p className="mt-2 text-gray-600">Loading settings...</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Hotel Name *
                          </label>
                          <input
                            type="text"
                            name="hotel_name"
                            value={generalSettings.hotel_name}
                            onChange={handleGeneralChange}
                            className="input"
                            disabled={!canManageSettings}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Hotel Email *
                          </label>
                          <input
                            type="email"
                            name="hotel_email"
                            value={generalSettings.hotel_email}
                            onChange={handleGeneralChange}
                            className="input"
                            disabled={!canManageSettings}
                            required
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
                            name="hotel_phone"
                            value={generalSettings.hotel_phone}
                            onChange={handleGeneralChange}
                            className="input"
                            disabled={!canManageSettings}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Currency
                          </label>
                          <select
                            name="currency"
                            value={generalSettings.currency}
                            onChange={handleGeneralChange}
                            className="input"
                            disabled={!canManageSettings}
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
                          name="hotel_address"
                          value={generalSettings.hotel_address}
                          onChange={handleGeneralChange}
                          className="input"
                          rows={2}
                          disabled={!canManageSettings}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tax Rate (%)
                          </label>
                          <input
                            type="number"
                            name="tax_rate"
                            value={generalSettings.tax_rate}
                            onChange={handleGeneralChange}
                            className="input"
                            step="0.1"
                            min="0"
                            max="100"
                            disabled={!canManageSettings}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Check-in Time
                          </label>
                          <input
                            type="time"
                            name="check_in_time"
                            value={generalSettings.check_in_time}
                            onChange={handleGeneralChange}
                            className="input"
                            disabled={!canManageSettings}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Check-out Time
                          </label>
                          <input
                            type="time"
                            name="check_out_time"
                            value={generalSettings.check_out_time}
                            onChange={handleGeneralChange}
                            className="input"
                            disabled={!canManageSettings}
                          />
                        </div>
                      </div>

                      {canManageSettings && (
                        <button 
                          type="submit" 
                          className="btn btn-primary"
                          disabled={loading}
                        >
                          {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                      )}
                    </>
                  )}
                </form>
              )}

              {activeTab === 'security' && (
                <form onSubmit={handlePasswordSubmit} className="max-w-md space-y-6">
                  <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                  
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <p className="text-sm text-blue-800">
                      <strong>Password Requirements:</strong>
                    </p>
                    <ul className="text-xs text-blue-700 mt-2 space-y-1 list-disc list-inside">
                      <li>At least 8 characters long</li>
                      <li>At least one uppercase letter</li>
                      <li>At least one lowercase letter</li>
                      <li>At least one number</li>
                    </ul>
                  </div>

                  <PasswordInput
                    label="Current Password"
                    name="current_password"
                    value={passwordData.current_password}
                    onChange={handleChange}
                    placeholder="Enter current password"
                    required
                    error={errors.current_password}
                  />

                  <PasswordInput
                    label="New Password"
                    name="new_password"
                    value={passwordData.new_password}
                    onChange={handleChange}
                    placeholder="Enter new password"
                    required
                    error={errors.new_password}
                  />

                  <PasswordInput
                    label="Confirm New Password"
                    name="confirm_password"
                    value={passwordData.confirm_password}
                    onChange={handleChange}
                    placeholder="Confirm new password"
                    required
                    error={errors.confirm_password}
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary w-full"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Updating...
                      </span>
                    ) : (
                      'Update Password'
                    )}
                  </button>
                </form>
              )}

              {activeTab === 'notifications' && (
                <div className="max-w-2xl">
                  <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
                  
                  <div className="space-y-3">
                    {[
                      { key: 'email_booking', label: 'Booking confirmations' },
                      { key: 'email_checkin', label: 'Check-in reminders' },
                      { key: 'email_review', label: 'Review requests' },
                      { key: 'email_promotion', label: 'Promotional emails' },
                    ].map((item) => (
                      <label key={item.key} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-4 h-4 text-blue-600 rounded"
                          disabled={!canManageSettings}
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>

                  {canManageSettings && (
                    <button className="btn btn-primary mt-6">
                      Save Preferences
                    </button>
                  )}
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