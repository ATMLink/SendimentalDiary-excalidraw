// app/src/uno.config.ts
import {
    defineConfig, presetUno, presetAttributify, presetIcons
  } from 'unocss'
  
  export default defineConfig({
    presets: [
      presetUno(),
      presetAttributify(),
      presetIcons()
    ],
    theme: {
      colors: {
        zeldaGold: '#f8f1d5',
        zeldaGreen: '#3e6c4e',
        zeldaYellow: '#ffe86c',
        pink: {
          400: '#f472b6', // 可以根据需要自定义
          500: '#ec4899',
          600: '#db2777',
          
        },
        blue: {
            400: '#60a5fa',
            500: '#3b82f6',
            600: '#2563eb',
          },
      },
        fontFamily: {
          cinzel: ['Cinzel','serif'],
        },
      borderRadius: {
        sheikah: '12px',
      }
    },
    shortcuts: {
      // 'btn': 'px-4 py-2 rounded-sheikah bg-pink text-white hover:bg-blue transition',
      'btn-zelda': 'bg-[#3ba477] hover:bg-[#2f9d67] text-[#ffdc55] font-semibold py-2 rounded transition',
      'input-zelda': 'bg-[#1a3322] text-[#ffdc55] placeholder-[#ffdc55] border-none p-2 rounded outline-none focus:ring-2 focus:ring-[#3ba477]',
      'title-zelda': 'text-4xl font-cinzel text-center text-zeldaGold drop-shadow',
    },
  })