import './utils/dom-patch';
import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes'
import AuthInitializer from './features/auth/AuthInitializer'
import './index.css'

import { HelmetProvider } from 'react-helmet-async'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <AuthInitializer>
        <RouterProvider router={router} />
      </AuthInitializer>
    </HelmetProvider>
  </React.StrictMode>,
)
