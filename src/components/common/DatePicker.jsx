import React, { useState } from 'react'
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns'

const DatePicker = ({ value, onChange, minDate, maxDate, placeholder = 'Select date' }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(value ? new Date(value) : new Date())

  const handleDateSelect = (date) => {
    onChange(date)
    setIsOpen(false)
  }

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  })

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  return (
    <div className="relative">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="input flex items-center justify-between cursor-pointer"
      >
        <span className={value ? 'text-gray-900' : 'text-gray-400'}>
          {value ? format(new Date(value), 'MMM dd, yyyy') : placeholder}
        </span>
        <CalendarIcon className="w-5 h-5 text-gray-400" />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 bg-white rounded-lg shadow-lg border p-4">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <span className="font-semibold">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Week Days */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-xs text-gray-500">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map(day => {
              const isSelected = value && isSameDay(day, new Date(value))
              const isCurrentMonth = isSameMonth(day, currentMonth)
              const isDisabled = (minDate && day < new Date(minDate)) || 
                               (maxDate && day > new Date(maxDate))

              return (
                <button
                  key={day.toString()}
                  onClick={() => !isDisabled && handleDateSelect(day)}
                  disabled={isDisabled}
                  className={`
                    w-8 h-8 text-sm rounded-full flex items-center justify-center
                    ${!isCurrentMonth && 'text-gray-300'}
                    ${isSelected && 'bg-blue-600 text-white'}
                    ${isToday(day) && !isSelected && 'border border-blue-600'}
                    ${!isSelected && isCurrentMonth && !isDisabled && 'hover:bg-gray-100'}
                    ${isDisabled && 'text-gray-300 cursor-not-allowed'}
                  `}
                >
                  {format(day, 'd')}
                </button>
              )
            })}
          </div>

          {/* Today Button */}
          <button
            onClick={() => handleDateSelect(new Date())}
            className="mt-4 text-sm text-blue-600 hover:underline w-full text-center"
          >
            Today
          </button>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

export default DatePicker