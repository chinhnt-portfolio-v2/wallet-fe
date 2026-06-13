import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n'
import './index.css'
import App from './App.tsx'
import { useThemeStore } from './stores/theme-store'

// Sync the Zustand theme store with the pre-paint <head> script (no-flash boot).
useThemeStore.getState().init()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
