import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Split vendor libraries into separate chunk
        manualChunks: {
          vendor: ['react', 'react-dom']
        }
      }
    },
    // Increase warning limit to avoid noisy warnings
    chunkSizeWarningLimit: 1000
  }
})
