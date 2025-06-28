import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import Unocss from 'unocss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    Unocss(), // UnoCSS 插件应该在 VitePWA 之前，确保其样式被正确处理
    // 配置 VitePWA 插件
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        // 修正 globPatterns 的路径，确保它指向 dist 目录内的文件
        // Vercel 的构建路径是 /vercel/path0/app/dist
        globDirectory: 'dist', // 确保 globDirectory 指向构建输出目录
        globPatterns: [
            '**/*.{js,css,html,ico,png,svg,webp,jpg,jpeg}',
            // 如果你的 UnoCSS 样式是单独的 CSS 文件，也需要包含
            // 例如：'assets/uno.css' 或 'uno.css'
        ],
        // globIgnores 保持不变
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
      },
      manifest: {
        name: 'Sendimental Diary',
        short_name: 'Diary',
        description: '记录心情和日记的应用程序',
        theme_color: '#ffffff',
        background_color: '#ffffff',
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
            src: '/apple-touch-icon.png',
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
  // 移除 server.proxy 配置，因为它在生产环境中不再需要
  // 新增 build 配置，禁用 CSS 代码分割
  build: {
    cssCodeSplit: false, // 禁用 CSS 代码分割，尝试解决 UnoCSS 导入问题
  },
});
