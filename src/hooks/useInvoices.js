/**
 * Invoices Hook
 * Manages billing and invoice operations
 */

import { useState } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export const useInvoices = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const generateInvoiceNumber = () => {
    return `INV-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
  }

  const createInvoice = async (invoiceData) => {
    setLoading(true)
    try {
      const invoice = {
        ...invoiceData,
        invoice_number: generateInvoiceNumber(),
      }

      const { data, error } = await supabase
        .from('invoices')
        .insert([invoice])
        .select()

      if (error) throw error
      toast.success('Invoice created successfully')
      return { success: true, data: data[0] }
    } catch (err) {
      setError(err.message)
      toast.error(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const updatePaymentStatus = async (invoiceId, status) => {
    setLoading(true)
    try {
      const updateData = { payment_status: status }
      if (status === 'completed') {
        updateData.paid_date = new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('invoices')
        .update(updateData)
        .eq('id', invoiceId)
        .select()

      if (error) throw error
      toast.success('Payment status updated')
      return { success: true, data: data[0] }
    } catch (err) {
      setError(err.message)
      toast.error(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const getGuestInvoices = async (guestId) => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('guest_id', guestId)
        .order('invoice_date', { ascending: false })

      if (error) throw error
      return data
    } catch (err) {
      setError(err.message)
      return []
    }
  }

  const getInvoiceByBooking = async (bookingId) => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('booking_id', bookingId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data
    } catch (err) {
      return null
    }
  }

  return {
    createInvoice,
    updatePaymentStatus,
    getGuestInvoices,
    getInvoiceByBooking,
    loading,
    error,
  }
}