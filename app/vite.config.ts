import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import Unocss from 'unocss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({

  plugins: [react(),
    Unocss()
  ],

  resolve: {
    alias: {
      '@excalidraw/excalidraw': path.resolve(__dirname, 'node_modules/@excalidraw/excalidraw'),
    },
  },
  optimizeDeps: {
    include: ['@excalidraw/excalidraw'],
  },

  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/excalidraw-assets': {
        target: 'http://localhost:5173',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/excalidraw-assets/, '/node_modules/@excalidraw/excalidraw/dist/excalidraw-assets'),
      },
      '/excalidraw-assets-dev': {
        target: 'http://localhost:5173',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/excalidraw-assets-dev/, '/node_modules/@excalidraw/excalidraw/dist/excalidraw-assets-dev'),
      },
    },
  },
  assetsInclude: ['**/*.woff2'],
})
