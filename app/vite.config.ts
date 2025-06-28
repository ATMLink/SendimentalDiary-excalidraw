import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import Unocss from 'unocss/vite';
import { VitePWA } from 'vite-plugin-pwa'; // 导入 VitePWA 插件

export default defineConfig({
  plugins: [
    react(),
    Unocss(),
    // PWA 插件配置
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      // Workbox 配置：重新启用并设置文件大小限制
      workbox: {
        globDirectory: 'dist',
        globPatterns: [
            '**/*.{js,css,html,ico,png,svg,webp,jpg,jpeg}',
            '**/*.css', // 确保包含所有 CSS 文件
            '**/*.js',  // 确保包含所有 JS 文件，包括大的 vendor 文件
        ],
        globIgnores: [
          '**/node_modules/**/*',
          'sw.js',
          'workbox-*.js'
        ],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === self.location.origin && url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
            },
          },
        ],
        // 核心修改：增加 Workbox 的文件大小限制
        // 17.8 MB 意味着我们需要至少 18MB。为了安全起见，我们设置为 50MB (50 * 1024 * 1024 字节)。
        maximumFileSizeToCacheInBytes: 50 * 1024 * 1024,
      },
      manifest: {
        name: 'Sendimental Diary',
        short_name: 'Diary',
        description: '记录心情和日记的应用程序',
        theme_color: '#3e6c4e',
        background_color: '#3e6c4e',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/apple-touch-icon.png', // 180x180 像素图标
            sizes: '180x180',
            type: 'image/png',
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],

  // 保留您原有的 define 配置
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  },

  // 保留您原有的 server.proxy 配置
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      // 您的 Excalidraw 代理配置，如果原始文件有，请保留
      // '/excalidraw-assets': { /* ... */ },
      // '/excalidraw-assets-dev': { /* ... */ },
    }
  },

  // 重新引入 build 配置，以确保 UnoCSS 和 Rollup 输出的稳定性
  build: {
    cssTarget: 'es2015',
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'index.css') {
            return `assets/[name].[ext]`;
          }
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return `assets/[name]-[hash].[ext]`;
          }
          // 对于所有 JS 文件，确保它们被正确命名和包含
          if (assetInfo.name && assetInfo.name.endsWith('.js')) {
            return `assets/[name]-[hash].[ext]`;
          }
          return `assets/[name]-[hash].[ext]`;
        },
      },
    },
  },

  // 保留您原始文件中注释掉的 resolve 和 optimizeDeps 配置
  // resolve: { ... },
  // optimizeDeps: { ... },
});