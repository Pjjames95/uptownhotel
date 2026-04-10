import React, { useEffect } from 'react'
import PublicNavbar from './PublicNavbar'
import PublicFooter from './PublicFooter'
import { useSessionManager } from '../../../hooks/useSessionManager'

const PublicLayout = ({ children }) => {
  useSessionManager()

  return (
    <div className="flex flex-col min-h-screen">
      <PublicNavbar />
      <main className="flex-1">
        {children}
      </main>
      <PublicFooter />
    </div>
  )
}

export default PublicLayout