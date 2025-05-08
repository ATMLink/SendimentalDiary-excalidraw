// app/src/main.tsx
// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import 'uno.css'
import './assets/fonts/fonts.css'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
// import ReactDOM from 'react-dom/client'

const queryClient = new QueryClient

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)
