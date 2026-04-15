import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export const useHotelSettings = () => {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSettings = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('hotel_settings')
        .select('*')
        .limit(1)
        .single()

      if (error) {
        // If no settings exist, create default
        if (error.code === 'PGRST116') {
          const defaultSettings = {
            hotel_name: 'UptwonHotel',
            hotel_email: 'info@uptownhotel.com',
            hotel_phone: '+254789249656',
            hotel_address: '123 Central Street, CBD, Kisii, Kenya',
            currency: 'KES',
            tax_rate: 16.00,
            check_in_time: ' From 09:00',
            check_out_time: ' From 08:00',
          }
          
          const { data: newData, error: insertError } = await supabase
            .from('hotel_settings')
            .insert([defaultSettings])
            .select()
            .single()

          if (insertError) throw insertError
          setSettings(newData)
        } else {
          throw error
        }
      } else {
        setSettings(data)
      }
    } catch (error) {
      console.error('Error fetching hotel settings:', error)
      setError(error.message)
      // Set fallback defaults
      setSettings({
        hotel_name: 'Uptown Hotel',
        hotel_email: 'info@uptownhotel.com',
        hotel_phone: '+254789249656',
        hotel_address: '123 Central Street, CBD, Kisii, Kenya',
        currency: 'KES',
        tax_rate: 16.00,
        check_in_time: '14:00',
        check_out_time: '11:00',
      })
    } finally {
      setLoading(false)
    }
  }, [])

  const updateSettings = async (updates) => {
    try {
      // Get current settings ID
      const { data: current } = await supabase
        .from('hotel_settings')
        .select('id')
        .limit(1)
        .single()

      let result
      if (current?.id) {
        result = await supabase
          .from('hotel_settings')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', current.id)
          .select()
          .single()
      } else {
        result = await supabase
          .from('hotel_settings')
          .insert([updates])
          .select()
          .single()
      }

      const { data, error } = result

      if (error) throw error

      setSettings(data)
      toast.success('Settings saved successfully')
      return { success: true, data }
    } catch (error) {
      console.error('Error updating settings:', error)
      toast.error('Failed to save settings: ' + error.message)
      return { success: false, error: error.message }
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  return {
    settings,
    loading,
    error,
    fetchSettings,
    updateSettings,
  }
}