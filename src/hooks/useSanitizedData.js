/**
 * Data Sanitization Hook
 * Ensures all data is properly sanitized before storage
 */

import { useCallback } from 'react'
import { sanitizeObject, removeDangerousTags } from '../utils/sanitize'

export const useSanitizedData = () => {
  const sanitize = useCallback((data) => {
    if (!data) return null
    return sanitizeObject(data)
  }, [])

  const sanitizeText = useCallback((text) => {
    if (!text) return ''
    return removeDangerousTags(text)
  }, [])

  const sanitizeArray = useCallback((arr) => {
    if (!Array.isArray(arr)) return []
    return arr.map(item => 
      typeof item === 'string' ? sanitizeText(item) : item
    )
  }, [sanitizeText])

  return {
    sanitize,
    sanitizeText,
    sanitizeArray,
  }
}