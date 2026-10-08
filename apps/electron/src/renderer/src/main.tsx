import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './app/App'
import './styles/main.css'

const storedTheme = localStorage.getItem('maple-insight-theme')
document.documentElement.dataset.theme = storedTheme === 'light' ? 'light' : 'dark'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
