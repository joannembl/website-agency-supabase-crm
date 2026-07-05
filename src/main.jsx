import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { AppProviders } from './app/index.js'
import './styles.css'
import './design-system.css'

createRoot(document.getElementById('root')).render(
  <AppProviders>
    <App />
  </AppProviders>
)
