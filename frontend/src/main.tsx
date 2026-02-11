import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { preloadCursors } from './lib/preloadCursors'

// Preload all cursor SVGs on app initialization
preloadCursors().finally(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
})
