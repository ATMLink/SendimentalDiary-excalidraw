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
    safelist: [
      'toast-zelda',
      'toast-zelda-success',
      'toast-zelda-error',
    ],
    theme: {
      colors: {
        zeldaGold: '#f8f1d5',
        zeldaGreen: '#3e6c4e',
        zeldaGreenBright: '#45a049',
        lightGreen: '#4CAF50',
        mintGreen: '#5DBB63',
        grassGreen: '#66BB6A',
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
      
      'btn-zelda-square': `
        relative inline-flex items-center justify-center
        w-12 h-12 p-2 
        font-semibold font-orbitron text-lg
        rounded-lg border border-zeldaGreen
        bg-zeldaGreen text-zeldaGold
        hover:bg-zeldaYellow hover:text-zeldaGreen
        transition-all duration-200 ease-in-out
        will-change-transform transform hover:scale-105
        overflow-hidden
        backdrop-blur-md bg-opacity-80
        after:(content-empty absolute inset-0 -z-1 bg-zeldaYellow rounded-lg transform -translate-x-[110%] rotate-6 transition-transform duration-200)
        hover:after:(translate-x-0)
      `,

      'btn-zelda-apple': `
        relative inline-block
        font-semibold font-orbitron text-lg leading-snug tracking-tight
        px-5 py-2 rounded-full border border-zeldaGreen
        bg-zeldaGreen text-zeldaGold
        hover:bg-zeldaYellow hover:text-zeldaGreen
        transition-all duration-200 ease-in-out
        will-change-transform transform hover:scale-105
        overflow-hidden whitespace-nowrap
        min-w-24 text-center
        backdrop-blur-md bg-opacity-80
        after:(content-empty absolute inset-0 -z-1 bg-zeldaYellow rounded-full transform -translate-x-full rotate-6 transition-transform duration-200)
        hover:after:(translate-x-0)`,

        'input-zelda-apple': `
          w-full max-w-600
          font-orbitron text-base text-zeldaGold placeholder-zeldaGold
          bg-zeldaGreen/30 border border-zeldaGreen rounded-full
          p-3 px-5 shadow-inner shadow-zeldaGreen/20
          focus:outline-none focus:ring-2 focus:ring-zeldaYellow
          transition-all duration-200 backdrop-blur-md`,

        'input-zelda-glow': `
          relative inline-block
          w-full max-w-[600px]
          font-orbitron text-base text-zeldaGold placeholder-zeldaGold/80
          bg-zeldaGreen/70 border-2 border-zeldaGreen rounded-full // 提高背景不透明度
          px-5 py-3
          shadow-md shadow-zeldaGreen/40 // 增强阴影
          backdrop-blur-lg // 使用更大的模糊效果
          transition-all duration-200 ease-in-out
          focus:(outline-none ring-2 ring-zeldaYellow)
          hover:scale-[1.02]
          supports-not-(backdrop-filter): bg-zeldaGreen/80`,

        'input-zelda-apple-lite': `
          appearance-none
          w-full max-w-600
          font-orbitron text-base text-zeldaGold placeholder-zeldaGold
          bg-#3e6c4e/30 bg-opacity-80
          border border-#3e6c4e rounded-full
          p-3 px-5
          shadow-inner shadow-#3e6c4e/20
          focus:outline-none focus:ring-2 focus:ring-zeldaYellow
          transition-all duration-200
          backdrop-blur-md`,

        'container-zelda-apple-lite': `
          font-orbitron text-zeldaGold
          bg-#3e6c4e/30 bg-opacity-80
          border border-#3e6c4e
          shadow-inner shadow-#3e6c4e/20
          backdrop-blur-md
          transition-all duration-200`,

        'select-zelda-apple': `
          appearance-none
          font-orbitron text-base text-zeldaGold
          bg-zeldaGreen border border-zeldaGreen rounded-full
          p-3 pr-8 shadow-inner shadow-zeldaGreen
          backdrop-blur-md bg-opacity-80
          focus:outline-none focus:ring-2 focus:ring-zeldaYellow
          transition-all duration-200 backdrop-blur-md`,


        // tag input
        'taginput-zelda': `
          flex items-center gap-2
          px-4 py-2
          bg-#3e6c4e/30 bg-opacity-80
          border border-#3e6c4e rounded-full
          shadow-inner shadow-#3e6c4e/20
          text-zeldaGold font-orbitron text-sm
          max-w-600 w-full
          overflow-x-auto
          h-10
          focus-within:ring-2 focus-within:ring-zeldaYellow
          transition-all duration-200
          backdrop-blur-md
          overflow-y-hidden
        `,

        'taginput-tag': `
          inline-flex items-center gap-1
          font-orbitron text-sm
          px-3 py-1
          rounded-full border border-zeldaGreen
          bg-zeldaGreen text-zeldaYellow
          transition-all duration-200 ease-in-out
          flex-shrink-0
        `,

        'taginput-input': `
          bg-transparent outline-none border-none
          text-zeldaGold placeholder-zeldaGold/60
          font-orbitron text-sm
          min-w-[60px] w-auto px-2 py-1
          flex-shrink-0
        `,

        'taginput-tag button': `
          bg-transparent text-red-300 hover:text-red-500
          outline-none border-none
          font-bold
          hover:bg-transparent
          rounded-full w-5 h-5 flex items-center justify-center
        `,

        // toast styles
        'toast-zelda': `
          bg-zeldaGreen/70 text-zeldaGold font-orbitron text-sm px-4 py-2
          rounded-sheikah shadow-md shadow-zeldaGreen/40 backdrop-blur-md
          border border-zeldaYellow/50 transition-all duration-200 hover:scale-105`,
        'toast-zelda-success': `
          bg-zeldaYellow/80 text-zeldaGreen font-orbitron text-sm px-4 py-2
          rounded-sheikah shadow-md shadow-zeldaYellow/40 backdrop-blur-md
          border border-zeldaGreen/50 transition-all duration-200 hover:scale-105`,
        'toast-zelda-error': `
          bg-pink-500/80 text-zeldaGold font-orbitron text-sm px-4 py-2
          rounded-sheikah shadow-md shadow-pink-500/40 backdrop-blur-md
          border border-zeldaGold/50 transition-all duration-200 hover:scale-105`,

      // sheikah slate style
      'btn-sheikah': 'bg-sheikah-blue text-black font-bold px-4 py-2 rounded-lg hover:bg-cyan-300 transition',
      'input-sheikah': 'w-full max-w-600 bg-black text-sheikah-blue border border-sheikah-blue rounded-lg p-3 shadow-inner shadow-sheikah-blue/20 focus:outline-none focus:ring-2 focus:ring-sheikah-blue',
      'select-sheikah': 'bg-black border border-sheikah-blue text-sheikah-blue rounded p-2 focus:outline-none',
      'canvas-sheikah': 'px-12 flex-1 min-h-0 border-2 border-sheikah-blue rounded-lg shadow-md shadow-sheikah-blue/30 overflow-hidden',
      'page-sheikah': 'flex flex-col h-screen w-screen bg-[#0c0c0c] text-#f8f1d5 font-sheikah',
      'centered-container': 'flex flex-col items-center justify-center',
    
      // side bar icon
      'icon-sidebar-collapse': 'i-cuida-sidebar-collapse-outline text-zeldaGold text-2xl transform scale-x--100 hover:text-zeldaYellow transition-colors duration-200',
      'icon-sidebar-expand': 'i-cuida-sidebar-expand-outline text-zeldaGreen text-2xl transform scale-x--100 hover:text-lightGreen transition-colors duration-200', 
      
      // back icon
      'icon-back': 'i-formkit-arrowleft text-grassGreen text-2xl',

      // x
      'icon-close': 'i-cuida-x-outline text-red-300 text-lg hover:text-red-500 transition-colors duration-200',

      // font shortcuts
      'font-orbitron': 'font-orbitron',
      'font-sheikah': 'font-cinzel',
    },
  })