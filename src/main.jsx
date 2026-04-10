import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/index.css'

// Filter out extension-related warnings in development
if (import.meta.env.DEV) {
  const originalError = console.error
  const originalWarn = console.warn
  
  console.error = (...args) => {
    const message = args[0]
    if (typeof message === 'string' && 
        (message.includes('message channel closed') || 
         message.includes('back/forward cache') ||
         message.includes('asynchronous response'))) {
      return // Suppress these specific warnings
    }
    originalError.apply(console, args)
  }
  
  console.warn = (...args) => {
    const message = args[0]
    if (typeof message === 'string' && 
        message.includes('asynchronous response')) {
      return // Suppress these specific warnings
    }
    originalWarn.apply(console, args)
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)