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
    port: 5173,
    host: true,
    strictPort: true,
    open: true,
    historyApiFallback: true
  },
  preview: {
    port: 5173,
    strictPort: true,
    historyApiFallback: true
  }
})
