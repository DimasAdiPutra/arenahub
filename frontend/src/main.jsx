import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.jsx'

import { AuthProvider } from './context/AuthContext.jsx' // ◄ Import Provider-nya

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider> {/* ◄ Bungkus App di sini */}
      <App />
    </AuthProvider>
  </StrictMode>,
)