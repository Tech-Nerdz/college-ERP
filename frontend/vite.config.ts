import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // use specified frontend port
    port: 8086,
    strictPort: true,
    open: true,
    proxy: {
      '/api': {
        // backend runs on 3005
        target: 'http://localhost:3005',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost:3005',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
