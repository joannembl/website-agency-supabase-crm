import React from 'react'
import ErrorBoundary from './ErrorBoundary'

export default function AppProviders({ children }) {
  return <React.StrictMode>
    <ErrorBoundary>{children}</ErrorBoundary>
  </React.StrictMode>
}
