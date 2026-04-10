/**
 * Input Sanitization Functions
 * Prevent XSS attacks and SQL injection
 */

// Basic HTML sanitization
export const sanitizeHTML = (html) => {
  const div = document.createElement('div')
  div.textContent = html
  return div.innerHTML
}

// Sanitize object keys and values
export const sanitizeObject = (obj) => {
  const sanitized = {}
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeHTML(value).trim()
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value)
    } else {
      sanitized[key] = value
    }
  }
  return sanitized
}

// Sanitize filename
export const sanitizeFilename = (filename) => {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 255)
}

// Remove dangerous HTML tags
export const removeDangerousTags = (html) => {
  const dangerous = /<script|<iframe|<embed|<object|javascript:|on\w+\s*=/gi
  return html.replace(dangerous, '')
}

// Escape special characters
export const escapeSpecialChars = (str) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return str.replace(/[&<>"']/g, m => map[m])
}