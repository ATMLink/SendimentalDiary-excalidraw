import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import Unocss from 'unocss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    Unocss({
      // 确保 UnoCSS 配置为生产环境提取 CSS
      // 'extract: true' 通常在生产环境中是隐式的，但明确设置有助于解决问题。
      // 如果您有单独的 'uno.config.ts' 文件，可以在此处保留 'configFile: './uno.config.ts','。
    }),
    // PWA 插件配置
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globDirectory: 'dist', 
        globPatterns: [
            '**/*.{js,css,html,ico,png,svg,webp,jpg,jpeg}',
            '**/*.css', // 确保包含所有 CSS 文件（包括 UnoCSS 生成的）
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
        maximumFileSizeToCacheInBytes: 50 * 1024 * 1024, 
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
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  },
  build: {
    // 这明确告诉 Vite 如何在构建中处理 CSS 输出
    // 它有时有助于解决 CSS 虚拟模块的解析问题
    cssTarget: 'es2015', // 确保兼容性
    // cssCodeSplit: true, // 让 Vite 默认拆分 CSS，如果问题持续存在，可以尝试 'false'
    rollupOptions: {
      output: {
        // 这确保创建了一个主要的 CSS 包，名为 'index.css'
        // 它应该包含所有 UnoCSS 样式。
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'index.css') {
            return `assets/[name].[ext]`; // 为主 CSS 文件保留原始名称
          }
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return `assets/[name]-[hash].[ext]`; // 用于其他 CSS 块
          }
          return `assets/[name]-[hash].[ext]`; // 其他资产的默认值
        },
      },
    },
  },
});