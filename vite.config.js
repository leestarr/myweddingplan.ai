import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: ['react-toastify', 'recharts'],
      output: {
        globals: {
          'react-toastify': 'ReactToastify',
          'recharts': 'Recharts'
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react-toastify', 'recharts']
  },
  server: {
    host: true,
    port: 3000
  },
  preview: {
    port: 3000
  }
})
