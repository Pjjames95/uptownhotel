import React, { createContext, useContext } from 'react'
import { useHotelSettings } from '../hooks/useHotelSettings'

const HotelSettingsContext = createContext(null)

export const HotelSettingsProvider = ({ children }) => {
  const hotelSettings = useHotelSettings()
  
  return (
    <HotelSettingsContext.Provider value={hotelSettings}>
      {children}
    </HotelSettingsContext.Provider>
  )
}

export const useHotelSettingsContext = () => {
  const context = useContext(HotelSettingsContext)
  if (!context) {
    throw new Error('useHotelSettingsContext must be used within HotelSettingsProvider')
  }
  return context
}