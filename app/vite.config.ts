import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa'; // 导入 VitePWA

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // 配置 VitePWA 插件
    VitePWA({
      registerType: 'autoUpdate', // 自动更新 Service Worker
      injectRegister: 'auto',    // 自动注入注册代码
      workbox: {
        // Workbox 配置，用于控制 Service Worker 的缓存行为
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,jpg,jpeg}'], // 缓存这些类型的文件
        // 确保在开发模式下不缓存 index.html，避免开发时的缓存问题
        // 在生产环境中，Workbox 会自动处理 index.html 的缓存
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === self.location.origin && url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst', // API 请求优先使用网络，如果离线则使用缓存
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 缓存 7 天
              },
            },
          },
        ],
      },
      manifest: {
        // PWA Manifest 文件配置，定义应用的外观和行为
        name: 'Sendimental Diary', // 应用名称
        short_name: 'Diary',      // 短名称，显示在主屏幕上
        description: '记录心情和日记的应用程序', // 应用描述
        theme_color: '#ffffff',   // 主题颜色，影响浏览器地址栏颜色
        background_color: '#ffffff', // 背景颜色
        display: 'standalone',    // 显示模式：standalone 会隐藏浏览器UI
        scope: '/',               // PWA 的作用域，通常是根路径
        start_url: '/',           // PWA 的起始URL
        icons: [
          // 应用图标配置
          // 请确保这些图片文件存在于 public 文件夹中
          {
            src: '/pwa-192x192.png', // 192x192 像素图标
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png', // 512x512 像素图标
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/pwa-maskable-192x192.png', // 可遮罩图标，用于适应不同形状的图标
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/pwa-maskable-512x512.png', // 可遮罩图标
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      devOptions: {
        enabled: true, // 在开发模式下启用 PWA，方便调试
      },
    }),
  ],
});
