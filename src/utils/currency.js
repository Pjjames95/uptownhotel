/**
 * Currency and Formatting Utilities
 */

// Format currency for display
export const formatCurrency = (amount, currency = 'KES') => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

// Parse currency string to number
export const parseCurrency = (currencyString) => {
  const cleaned = currencyString.replace(/[^0-9.-]/g, '')
  return parseFloat(cleaned)
}

// Calculate total with tax
export const calculateTotal = (subtotal, taxRate = 0.16) => {
  const tax = subtotal * taxRate
  return { subtotal, tax, total: subtotal + tax }
}

// Calculate discount
export const calculateDiscount = (originalPrice, discountPercent) => {
  const discountAmount = originalPrice * (discountPercent / 100)
  return originalPrice - discountAmount
}

// Format percentage
export const formatPercentage = (value) => {
  return `${(value * 100).toFixed(2)}%`
}