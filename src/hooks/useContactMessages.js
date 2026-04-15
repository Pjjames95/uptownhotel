import { useState } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export const useContactMessages = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const sendMessage = async (messageData) => {
    setLoading(true)
    setError(null)

    try {
      // Get client IP (optional)
      let ipAddress = null
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json')
        const ipData = await ipResponse.json()
        ipAddress = ipData.ip
      } catch (e) {
        console.warn('Could not fetch IP address')
      }

      const { data, error } = await supabase
        .from('contact_messages')
        .insert([{
          ...messageData,
          ip_address: ipAddress,
          status: 'unread',
        }])
        .select()
        .single()

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('Error sending message:', error)
      setError(error.message)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (filters = {}) => {
    try {
      let query = supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false })

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }

      if (filters.archived !== undefined) {
        query = query.eq('is_archived', filters.archived)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching messages:', error)
      return []
    }
  }

  const updateMessageStatus = async (messageId, updates) => {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', messageId)
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error updating message:', error)
      return { success: false, error: error.message }
    }
  }

  const markAsRead = async (messageId) => {
    return updateMessageStatus(messageId, { status: 'read' })
  }

  const markAsReplied = async (messageId, replyMessage, userId) => {
    return updateMessageStatus(messageId, {
      status: 'replied',
      replied_at: new Date().toISOString(),
      replied_by: userId,
      reply_message: replyMessage,
    })
  }

  const archiveMessage = async (messageId) => {
    return updateMessageStatus(messageId, { is_archived: true })
  }

  const deleteMessage = async (messageId) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', messageId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error deleting message:', error)
      return { success: false, error: error.message }
    }
  }

  const getUnreadCount = async () => {
    try {
      const { count, error } = await supabase
        .from('contact_messages')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'unread')
        .eq('is_archived', false)

      if (error) throw error
      return count || 0
    } catch (error) {
      console.error('Error getting unread count:', error)
      return 0
    }
  }

  return {
    loading,
    error,
    sendMessage,
    fetchMessages,
    updateMessageStatus,
    markAsRead,
    markAsReplied,
    archiveMessage,
    deleteMessage,
    getUnreadCount,
  }
}