import React, { useState, useEffect } from 'react'
import { useContactMessages } from '../../../hooks/useContactMessages'
import { useAuth } from '../../../context/AuthContext'
import { formatDateTime } from '../../../utils/dateUtils'
import toast from 'react-hot-toast'
import { 
  EnvelopeIcon, 
  EnvelopeOpenIcon,
  CheckCircleIcon,
  ArchiveBoxIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

const ContactMessagesManager = () => {
  const { profile } = useAuth()
  const { fetchMessages, markAsRead, archiveMessage, deleteMessage, getUnreadCount } = useContactMessages()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)

  const canManageMessages = profile?.role && 
    ['super_admin', 'hotel_manager', 'receptionist'].includes(profile.role)

  useEffect(() => {
    loadMessages()
    loadUnreadCount()
  }, [filterStatus])

  const loadMessages = async () => {
    setLoading(true)
    const data = await fetchMessages({ 
      status: filterStatus,
      archived: false 
    })
    setMessages(data)
    setLoading(false)
  }

  const loadUnreadCount = async () => {
    const count = await getUnreadCount()
    setUnreadCount(count)
  }

  const handleMarkAsRead = async (messageId) => {
    const result = await markAsRead(messageId)
    if (result.success) {
      toast.success('Marked as read')
      loadMessages()
      loadUnreadCount()
    }
  }

  const handleArchive = async (messageId) => {
    const result = await archiveMessage(messageId)
    if (result.success) {
      toast.success('Message archived')
      loadMessages()
      loadUnreadCount()
      setSelectedMessage(null)
    }
  }

  const handleDelete = async (messageId) => {
    if (!confirm('Are you sure you want to delete this message?')) return
    
    const result = await deleteMessage(messageId)
    if (result.success) {
      toast.success('Message deleted')
      loadMessages()
      loadUnreadCount()
      setSelectedMessage(null)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      unread: 'bg-blue-100 text-blue-800',
      read: 'bg-gray-100 text-gray-800',
      replied: 'bg-green-100 text-green-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="flex h-full">
      {/* Messages List */}
      <div className={`flex-1 ${selectedMessage ? 'hidden md:block' : ''}`}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Contact Messages</h2>
            {unreadCount > 0 && (
              <p className="text-sm text-blue-600 mt-1">{unreadCount} unread messages</p>
            )}
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input w-40"
          >
            <option value="all">All Messages</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : messages.length === 0 ? (
          <div className="card text-center py-10 text-gray-600">
            <EnvelopeIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
            <p>No messages found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map(message => (
              <div
                key={message.id}
                onClick={() => {
                  setSelectedMessage(message)
                  if (message.status === 'unread') {
                    handleMarkAsRead(message.id)
                  }
                }}
                className={`card p-4 cursor-pointer hover:shadow-md transition ${
                  selectedMessage?.id === message.id ? 'border-l-4 border-blue-600' : ''
                } ${message.status === 'unread' ? 'bg-blue-50' : ''}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">{message.name}</h3>
                    <p className="text-sm text-gray-600">{message.email}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(message.status)}`}>
                    {message.status}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-700 mb-1">{message.subject}</p>
                <p className="text-sm text-gray-600 line-clamp-2">{message.message}</p>
                <p className="text-xs text-gray-400 mt-2">{formatDateTime(message.created_at)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message Detail */}
      {selectedMessage && (
        <div className="w-full md:w-96 md:ml-6 card">
          <div className="flex justify-between items-start mb-4">
            <button
              onClick={() => setSelectedMessage(null)}
              className="md:hidden text-gray-400 hover:text-gray-600 mb-2"
            >
              ← Back
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => handleArchive(selectedMessage.id)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                title="Archive"
              >
                <ArchiveBoxIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDelete(selectedMessage.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
                title="Delete"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          <h3 className="text-xl font-bold mb-2">{selectedMessage.subject}</h3>
          
          <div className="space-y-3 mb-6">
            <div>
              <p className="text-sm text-gray-500">From</p>
              <p className="font-medium">{selectedMessage.name}</p>
              <p className="text-sm text-gray-600">{selectedMessage.email}</p>
              {selectedMessage.phone && (
                <p className="text-sm text-gray-600">{selectedMessage.phone}</p>
              )}
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Received</p>
              <p className="text-sm">{formatDateTime(selectedMessage.created_at)}</p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
          </div>

          {canManageMessages && selectedMessage.status !== 'replied' && (
            <button
              onClick={() => {/* Open reply modal */}}
              className="btn btn-primary w-full"
            >
              Reply to Message
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default ContactMessagesManager