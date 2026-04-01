import React from 'react'
import ReactDOM from 'react-dom/client'
import axios from 'axios'
import App from './App.jsx'
import './index.css'

axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'https://new-folder-4-eyb0.onrender.com'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
