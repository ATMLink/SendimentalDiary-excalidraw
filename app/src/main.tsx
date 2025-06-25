// app/src/main.tsx
// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// import App from './App'
import 'uno.css'
import './assets/fonts/fonts.css'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import React from 'react'
// import { BrowserRouter } from 'react-router-dom'
import { RouterProvider } from 'react-router-dom'; // 导入 RouterProvider
import router from './router'; // 导入我们创建的路由实例
// import ReactDOM from 'react-dom/client'

// window.EXCALIDRAW_ASSET_PATH = "/excalidraw-assets/";

const queryClient = new QueryClient

const rootElement = document.getElementById('root') as HTMLElement;
const root = createRoot(rootElement);


root.render(
  // <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  // </React.StrictMode>,
)
