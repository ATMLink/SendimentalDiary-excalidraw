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
        sheikahBlue: '#00f9e5',
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
          orbitron: ['orbitron','sans-serif'],
        },
      borderRadius: {
        sheikah: '12px',
      }
    },
    shortcuts: {
      // 'btn': 'px-4 py-2 rounded-sheikah bg-pink text-white hover:bg-blue transition',
      // zelda theme style
      'btn-zelda': 'bg-[#3ba477] hover:bg-[#2f9d67] text-[#ffdc55] font-semibold py-2 rounded transition',
      'input-zelda': 'bg-[#1a3322] text-[#ffdc55] placeholder-[#ffdc55] border-none p-2 rounded outline-none focus:ring-2 focus:ring-[#3ba477]',
      'title-zelda': 'text-4xl font-cinzel text-center text-zeldaGold drop-shadow',
      
      // sheikah slate style
      'btn-sheikah': 'bg-sheikah-blue text-black font-bold px-4 py-2 rounded-lg hover:bg-cyan-300 transition',
      'input-sheikah': 'w-full max-w-600 bg-black text-sheikah-blue border border-sheikah-blue rounded-lg p-3 shadow-inner shadow-sheikah-blue/20 focus:outline-none focus:ring-2 focus:ring-sheikah-blue',
      'select-sheikah': 'bg-black border border-sheikah-blue text-sheikah-blue rounded p-2 focus:outline-none',
      'canvas-sheikah': 'px-12 flex-1 min-h-0 border-2 border-sheikah-blue rounded-lg shadow-md shadow-sheikah-blue/30 overflow-hidden',
      'page-sheikah': 'flex flex-col h-screen w-screen bg-[#0c0c0c] text-sheikah-blue font-sheikah',
      'centered-container': 'flex flex-col items-center justify-center',
    
      // font shortcuts
      'font-orbitron': 'font-orbitron',
      'font-sheikah': 'font-cinzel',
    },
  })