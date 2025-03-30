import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ToastContainer } from './components/ui/Toast'
import { useAuthStore } from './lib/store'

// Initialize auth on app load
useAuthStore.getState().initAuth()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <ToastContainer />
  </StrictMode>,
)