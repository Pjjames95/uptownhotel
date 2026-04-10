/**
 * Comprehensive Validation Functions
 * All inputs must be validated on client AND server
 */

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Phone validation - supports international format
export const validatePhone = (phone) => {
  // Remove spaces and special characters for validation
  const cleaned = phone.replace(/\D/g, '')
  // Accept 10-15 digit numbers
  return cleaned.length >= 10 && cleaned.length <= 15
}

// Format phone number
export const formatPhoneNumber = (phone) => {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `+254${cleaned.slice(1)}`
  } else if (cleaned.length === 12 && cleaned.startsWith('254')) {
    return `+${cleaned}`
  }
  return phone
}

// Password validation
export const validatePassword = (password) => {
  // Minimum 8 characters, 1 uppercase, 1 lowercase, 1 number
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
  return regex.test(password)
}

// Validate date format (YYYY-MM-DD)
export const validateDate = (date) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/
  if (!regex.test(date)) return false
  const d = new Date(date)
  return d instanceof Date && !isNaN(d)
}

// Validate check-in before check-out
export const validateBookingDates = (checkIn, checkOut) => {
  const checkInDate = new Date(checkIn)
  const checkOutDate = new Date(checkOut)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Check-in cannot be before today
  if (checkInDate < today) return { valid: false, error: 'Check-in cannot be in the past' }
  // Check-out must be after check-in
  if (checkOutDate <= checkInDate) return { valid: false, error: 'Check-out must be after check-in' }
  // Maximum stay 90 days
  const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24))
  if (nights > 90) return { valid: false, error: 'Maximum stay is 90 days' }

  return { valid: true, nights }
}

// Validate price
export const validatePrice = (price) => {
  const num = parseFloat(price)
  return !isNaN(num) && num > 0 && num <= 999999.99
}

// Validate party size
export const validatePartySize = (size, maxCapacity) => {
  const num = parseInt(size)
  return !isNaN(num) && num > 0 && num <= maxCapacity
}

// Validate number of guests
export const validateGuestCount = (count, roomCapacity) => {
  const num = parseInt(count)
  return !isNaN(num) && num > 0 && num <= roomCapacity
}

// Validate room number format
export const validateRoomNumber = (roomNumber) => {
  return /^[A-Z0-9]{2,5}$/.test(roomNumber)
}

// Validate credit card (basic Luhn algorithm)
export const validateCreditCard = (cardNumber) => {
  const cleaned = cardNumber.replace(/\D/g, '')
  if (cleaned.length < 13 || cleaned.length > 19) return false

  let sum = 0
  let isEven = false

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i), 10)

    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }

    sum += digit
    isEven = !isEven
  }

  return sum % 10 === 0
}

// Validate file upload
export const validateFileUpload = (file, maxSize, allowedTypes) => {
  if (!file) return { valid: false, error: 'No file selected' }
  if (file.size > maxSize) return { valid: false, error: `File size exceeds ${maxSize / 1024 / 1024}MB limit` }
  if (!allowedTypes.includes(file.type)) return { valid: false, error: 'File type not allowed' }
  return { valid: true }
}