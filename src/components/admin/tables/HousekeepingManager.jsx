import React, { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { formatDateDisplay } from '../../../utils/dateUtils'
import StatusBadge from '../../common/StatusBadge'
import toast from 'react-hot-toast'

const HousekeepingManager = () => {
  const [tasks, setTasks] = useState([])
  const [rooms, setRooms] = useState([])
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    room_id: '',
    assigned_to: '',
    task_type: 'cleaning',
    scheduled_date: new Date().toISOString().split('T')[0],
    notes: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch tasks
      const { data: tasksData } = await supabase
        .from('housekeeping_tasks')
        .select('*, room:rooms(room_number), staff:profiles(full_name)')
        .order('scheduled_date', { ascending: false })

      // Fetch rooms
      const { data: roomsData } = await supabase
        .from('rooms')
        .select('id, room_number')
        .order('room_number')

      // Fetch housekeeping staff
      const { data: staffData } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'housekeeping_staff')
        .eq('active', true)

      setTasks(tasksData || [])
      setRooms(roomsData || [])
      setStaff(staffData || [])
    } catch (error) {
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const { error } = await supabase
        .from('housekeeping_tasks')
        .insert([{ ...formData, status: 'pending' }])

      if (error) throw error
      toast.success('Task assigned successfully')
      setShowForm(false)
      setFormData({
        room_id: '',
        assigned_to: '',
        task_type: 'cleaning',
        scheduled_date: new Date().toISOString().split('T')[0],
        notes: '',
      })
      fetchData()
    } catch (error) {
      toast.error('Failed to assign task')
    }
  }

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const updateData = { status: newStatus }
      if (newStatus === 'completed') {
        updateData.completed_date = new Date().toISOString()
      }

      const { error } = await supabase
        .from('housekeeping_tasks')
        .update(updateData)
        .eq('id', taskId)

      if (error) throw error

      // If task completed, update room status to available
      if (newStatus === 'completed') {
        const task = tasks.find(t => t.id === taskId)
        if (task) {
          await supabase
            .from('rooms')
            .update({ status: 'available' })
            .eq('id', task.room_id)
        }
      }

      toast.success('Status updated')
      fetchData()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const handleDelete = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      const { error } = await supabase
        .from('housekeeping_tasks')
        .delete()
        .eq('id', taskId)

      if (error) throw error
      toast.success('Task deleted')
      fetchData()
    } catch (error) {
      toast.error('Failed to delete task')
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Housekeeping Management</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          {showForm ? 'Cancel' : 'Assign Task'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-6 space-y-4">
          <h3 className="text-lg font-semibold">Assign New Task</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={formData.room_id}
              onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
              className="input"
              required
            >
              <option value="">Select Room</option>
              {rooms.map(room => (
                <option key={room.id} value={room.id}>
                  Room {room.room_number}
                </option>
              ))}
            </select>
            <select
              value={formData.assigned_to}
              onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
              className="input"
              required
            >
              <option value="">Assign To</option>
              {staff.map(s => (
                <option key={s.id} value={s.id}>
                  {s.full_name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={formData.task_type}
              onChange={(e) => setFormData({ ...formData, task_type: e.target.value })}
              className="input"
            >
              <option value="cleaning">Full Cleaning</option>
              <option value="turnover">Turnover Service</option>
              <option value="deep_clean">Deep Clean</option>
              <option value="inspection">Inspection</option>
              <option value="maintenance">Maintenance Check</option>
            </select>
            <input
              type="date"
              value={formData.scheduled_date}
              onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
              className="input"
              required
            />
          </div>
          <textarea
            placeholder="Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="input"
            rows={2}
          />
          <button type="submit" className="btn btn-primary">
            Assign Task
          </button>
        </form>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Room</th>
              <th className="px-4 py-2 text-left">Task Type</th>
              <th className="px-4 py-2 text-left">Assigned To</th>
              <th className="px-4 py-2 text-left">Scheduled Date</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">Room {task.room?.room_number}</td>
                <td className="px-4 py-2 capitalize">{task.task_type?.replace('_', ' ')}</td>
                <td className="px-4 py-2">{task.staff?.full_name || 'Unassigned'}</td>
                <td className="px-4 py-2">{formatDateDisplay(task.scheduled_date)}</td>
                <td className="px-4 py-2">
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="skipped">Skipped</option>
                  </select>
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="text-red-600 hover:underline text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!loading && tasks.length === 0 && (
          <div className="text-center py-10 text-gray-600">
            No housekeeping tasks found
          </div>
        )}
      </div>
    </div>
  )
}

export default HousekeepingManager