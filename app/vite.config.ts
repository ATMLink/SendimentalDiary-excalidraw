// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import Unocss from 'unocss/vite'
// import path from 'path'

// // https://vite.dev/config/
// export default defineConfig({

//   plugins: [react(),
//     Unocss()
//   ],

//   resolve: {
//     alias: {
//       '@excalidraw/excalidraw': path.resolve(__dirname, 'node_modules/@excalidraw/excalidraw'),
//     },
//   },
//   optimizeDeps: {
//     include: ['@excalidraw/excalidraw'],
//   },

//   server: {
//     proxy: {
//       '/api': {
//         target: 'http://localhost:3000',
//         changeOrigin: true,
//       },
//       '/excalidraw-assets': {
//         target: 'http://localhost:5173',
//         changeOrigin: true,
//         rewrite: path => path.replace(/^\/excalidraw-assets/, '/node_modules/@excalidraw/excalidraw/dist/excalidraw-assets'),
//       },
//       '/excalidraw-assets-dev': {
//         target: 'http://localhost:5173',
//         changeOrigin: true,
//         rewrite: path => path.replace(/^\/excalidraw-assets-dev/, '/node_modules/@excalidraw/excalidraw/dist/excalidraw-assets-dev'),
//       },
//     },
//   },
//   assetsInclude: ['**/*.woff2'],
// })
// app/vite.config.ts

// app/vite.config.ts

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import Unocss from 'unocss/vite'
// import path from 'path'

export default defineConfig({
  plugins: [react(), Unocss()],

//   resolve: {
//     alias: {
// '@excalidraw/excalidraw': path.resolve(
//         __dirname,
//         'node_modules/@excalidraw/excalidraw/dist/excalidraw.production.min.js'
//       )    
//     },
//   },

//   optimizeDeps: {
//     include: ['@excalidraw/excalidraw'],
//   },

  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  },

  server: {
    proxy: {
      // 保留 API 代理
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      
      // --- 关键修复：强制代理所有对 unpkg.com 上 excalidraw 资源的请求 ---
      // 捕获类似 https://unpkg.com/@excalidraw/excalidraw@.../dist/... 的请求
      // '/@excalidraw/excalidraw': {
      //   target: 'https://unpkg.com',
      //   changeOrigin: true,
      //   // 将其重写到本地 node_modules 的正确路径
      //   rewrite: (p) => {
      //     // 例如，将 /@excalidraw/excalidraw@0.18.0/dist/excalidraw-assets/Assistant-Regular.woff2
      //     // 重写为 /node_modules/@excalidraw/excalidraw/dist/excalidraw-assets/Assistant-Regular.woff2
      //     // 这样 Vite 就能从您的本地依赖中提供正确的文件
      //     const newPath = p.replace(/.*\/@excalidraw\/excalidraw@.*\/dist/, '/node_modules/@excalidraw/excalidraw/dist');
      //     console.log(`Rewriting ${p} to ${newPath}`); // 添加日志方便调试
      //     return newPath;
      //   }
      // }
    }
  }
});