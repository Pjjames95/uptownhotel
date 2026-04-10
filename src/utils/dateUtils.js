/**
 * Date Utility Functions
 */

import { 
  format, 
  addDays, 
  differenceInDays, 
  parseISO, 
  isAfter, 
  isBefore,
  isSameDay,
  startOfDay,
  endOfDay,
  eachDayOfInterval,
  isWithinInterval
} from 'date-fns'

// Format date for display
export const formatDateDisplay = (date) => {
  if (!date) return ''
  return format(new Date(date), 'MMM dd, yyyy')
}

// Format date for input
export const formatDateInput = (date) => {
  if (!date) return ''
  return format(new Date(date), 'yyyy-MM-dd')
}

// Format date and time
export const formatDateTime = (date) => {
  if (!date) return ''
  return format(new Date(date), 'MMM dd, yyyy HH:mm')
}

// Format time only
export const formatTime = (date) => {
  if (!date) return ''
  return format(new Date(date), 'HH:mm')
}

// Get number of nights between dates
export const getNights = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0
  return differenceInDays(new Date(checkOut), new Date(checkIn))
}

// Get number of days from today
export const daysFromToday = (date) => {
  if (!date) return 0
  return differenceInDays(new Date(date), new Date())
}

// Check if date is in the past
export const isPastDate = (date) => {
  if (!date) return false
  return isBefore(new Date(date), new Date())
}

// Check if date is in the future
export const isFutureDate = (date) => {
  if (!date) return false
  return isAfter(new Date(date), new Date())
}

// Check if date is today
export const isTodayDate = (date) => {
  if (!date) return false
  return isSameDay(new Date(date), new Date())
}

// Add days to date
export const addDaysToDate = (date, days) => {
  if (!date) return new Date()
  return addDays(new Date(date), days)
}

// Subtract days from date
export const subtractDays = (date, days) => {
  if (!date) return new Date()
  return addDays(new Date(date), -days)
}

// Get date range for month
export const getMonthDateRange = (date) => {
  const d = date ? new Date(date) : new Date()
  const firstDay = new Date(d.getFullYear(), d.getMonth(), 1)
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0)
  return { firstDay, lastDay }
}

// Check for date overlap
export const hasDateOverlap = (startDate1, endDate1, startDate2, endDate2) => {
  if (!startDate1 || !endDate1 || !startDate2 || !endDate2) return false
  
  const start1 = new Date(startDate1)
  const end1 = new Date(endDate1)
  const start2 = new Date(startDate2)
  const end2 = new Date(endDate2)
  
  return isAfter(end1, start2) && isBefore(start1, end2)
}

// Get array of dates between two dates
export const getDatesInRange = (startDate, endDate) => {
  if (!startDate || !endDate) return []
  
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  return eachDayOfInterval({ start, end })
}

// Check if date is within range
export const isDateInRange = (date, startDate, endDate) => {
  if (!date || !startDate || !endDate) return false
  
  const checkDate = new Date(date)
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  return isWithinInterval(checkDate, { start, end })
}

// Get relative time string (e.g., "2 days ago", "in 3 days")
export const getRelativeTime = (date) => {
  if (!date) return ''
  
  const now = new Date()
  const then = new Date(date)
  const diffInDays = differenceInDays(then, now)
  
  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Tomorrow'
  if (diffInDays === -1) return 'Yesterday'
  if (diffInDays > 1) return `In ${diffInDays} days`
  if (diffInDays < -1) return `${Math.abs(diffInDays)} days ago`
  
  return formatDateDisplay(date)
}

// Get day name from date
export const getDayName = (date) => {
  if (!date) return ''
  return format(new Date(date), 'EEEE')
}

// Get month name from date
export const getMonthName = (date) => {
  if (!date) return ''
  return format(new Date(date), 'MMMM')
}

// Get year from date
export const getYear = (date) => {
  if (!date) return new Date().getFullYear()
  return new Date(date).getFullYear()
}

// Validate booking dates
export const validateBookingDates = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) {
    return { valid: false, error: 'Please select both check-in and check-out dates' }
  }
  
  const checkInDate = startOfDay(new Date(checkIn))
  const checkOutDate = startOfDay(new Date(checkOut))
  const today = startOfDay(new Date())
  
  // Check-in cannot be before today
  if (isBefore(checkInDate, today)) {
    return { valid: false, error: 'Check-in date cannot be in the past' }
  }
  
  // Check-out must be after check-in
  if (isBefore(checkOutDate, checkInDate) || isSameDay(checkOutDate, checkInDate)) {
    return { valid: false, error: 'Check-out date must be after check-in date' }
  }
  
  // Maximum stay 90 days
  const nights = differenceInDays(checkOutDate, checkInDate)
  if (nights > 90) {
    return { valid: false, error: 'Maximum stay is 90 days' }
  }
  
  // Maximum advance booking 365 days
  const maxAdvance = addDays(today, 365)
  if (isAfter(checkInDate, maxAdvance)) {
    return { valid: false, error: 'Cannot book more than 365 days in advance' }
  }
  
  return { valid: true, nights }
}

// Validate reservation time
export const validateReservationTime = (date, time) => {
  if (!date || !time) {
    return { valid: false, error: 'Please select both date and time' }
  }
  
  const reservationDateTime = new Date(`${date}T${time}`)
  const now = new Date()
  const minTime = new Date(now.getTime() + 30 * 60000) // At least 30 minutes from now
  
  if (isBefore(reservationDateTime, minTime)) {
    return { valid: false, error: 'Reservations must be made at least 30 minutes in advance' }
  }
  
  // Check if within operating hours (6 AM - 10 PM)
  const hour = parseInt(time.split(':')[0])
  if (hour < 6 || hour >= 22) {
    return { valid: false, error: 'Reservations are only available between 6:00 AM and 10:00 PM' }
  }
  
  return { valid: true }
}

// Format date range for display
export const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return ''
  
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${format(start, 'MMM d')} - ${format(end, 'd, yyyy')}`
  }
  
  if (start.getFullYear() === end.getFullYear()) {
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`
  }
  
  return `${formatDateDisplay(startDate)} - ${formatDateDisplay(endDate)}`
}

// Get start of week
export const getStartOfWeek = (date) => {
  const d = date ? new Date(date) : new Date()
  const day = d.getDay()
  const diff = d.getDate() - day
  return new Date(d.setDate(diff))
}

// Get end of week
export const getEndOfWeek = (date) => {
  const d = date ? new Date(date) : new Date()
  const day = d.getDay()
  const diff = d.getDate() + (6 - day)
  return new Date(d.setDate(diff))
}

// Get week number
export const getWeekNumber = (date) => {
  const d = date ? new Date(date) : new Date()
  const firstDayOfYear = new Date(d.getFullYear(), 0, 1)
  const pastDaysOfYear = (d - firstDayOfYear) / 86400000
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
}

// Check if dates are consecutive
export const areDatesConsecutive = (date1, date2) => {
  if (!date1 || !date2) return false
  
  const d1 = startOfDay(new Date(date1))
  const d2 = startOfDay(new Date(date2))
  const diff = Math.abs(differenceInDays(d1, d2))
  
  return diff === 1
}

// Get business days between dates (excluding weekends)
export const getBusinessDays = (startDate, endDate) => {
  if (!startDate || !endDate) return 0
  
  const dates = getDatesInRange(startDate, endDate)
  return dates.filter(date => {
    const day = date.getDay()
    return day !== 0 && day !== 6 // Not Sunday (0) or Saturday (6)
  }).length
}

// Parse date string safely
export const parseDateSafely = (dateString) => {
  if (!dateString) return null
  
  try {
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? null : date
  } catch {
    return null
  }
}

// Compare dates (returns -1, 0, or 1)
export const compareDates = (date1, date2) => {
  const d1 = startOfDay(new Date(date1))
  const d2 = startOfDay(new Date(date2))
  
  if (isBefore(d1, d2)) return -1
  if (isAfter(d1, d2)) return 1
  return 0
}

// Sort dates array
export const sortDates = (dates, ascending = true) => {
  if (!Array.isArray(dates)) return []
  
  return [...dates].sort((a, b) => {
    const result = compareDates(a, b)
    return ascending ? result : -result
  })
}

// Get age from date of birth
export const getAge = (dateOfBirth) => {
  if (!dateOfBirth) return null
  
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}

// Check if date is weekend
export const isWeekend = (date) => {
  if (!date) return false
  const day = new Date(date).getDay()
  return day === 0 || day === 6
}

// Get next available date (skipping weekends)
export const getNextBusinessDay = (date) => {
  let nextDate = addDays(new Date(date), 1)
  while (isWeekend(nextDate)) {
    nextDate = addDays(nextDate, 1)
  }
  return nextDate
}