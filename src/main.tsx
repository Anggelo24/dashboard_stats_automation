import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Import centralized CSS structure
import './style/theme.css'
import './style/base.css'
import './style/components.css'
import App from './App.tsx'
import { ToastProvider } from './utils/toastManager'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </StrictMode>,
)
