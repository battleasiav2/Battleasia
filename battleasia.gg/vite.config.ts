import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    cssCodeSplit: true,
    assetsInlineLimit: 2048,
    modulePreload: { polyfill: false },
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('socket.io')) return 'socket'
          if (id.includes('@sentry')) return 'sentry'
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) return 'react'
          if (id.includes('react-router')) return 'router'
        },
      },
    },
  },
  server: {
    port: 8082,
    strictPort: true,
    host: true,
    watch: {
      ignored: ['**/.lh-tmp/**', '**/lighthouse-*.json'],
    },
    proxy: {
      '/api': { target: 'http://127.0.0.1:5050', changeOrigin: true },
      '/uploads': { target: 'http://127.0.0.1:5050', changeOrigin: true },
      '/socket.io': { target: 'http://127.0.0.1:5050', ws: true, changeOrigin: true },
    },
  },
  preview: {
    port: 4173,
    host: true,
    proxy: {
      '/api': { target: 'http://127.0.0.1:5050', changeOrigin: true },
      '/uploads': { target: 'http://127.0.0.1:5050', changeOrigin: true },
      '/socket.io': { target: 'http://127.0.0.1:5050', ws: true, changeOrigin: true },
    },
  },
})
