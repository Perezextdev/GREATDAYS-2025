import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Aggressive code-splitting to reduce chunk sizes
        // manualChunks(id) {
        //   // React core libraries
        //   if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
        //     return 'react-vendor';
        //   }

        //   // React Router
        //   if (id.includes('node_modules/react-router-dom')) {
        //     return 'react-router';
        //   }

        //   // Framer Motion animations
        //   if (id.includes('node_modules/framer-motion')) {
        //     return 'framer-motion';
        //   }

        //   // Charts library
        //   if (id.includes('node_modules/recharts')) {
        //     return 'recharts';
        //   }

        //   // Form libraries
        //   if (id.includes('node_modules/react-hook-form') || id.includes('node_modules/@hookform')) {
        //     return 'forms';
        //   }

        //   // Excel and file utilities
        //   if (id.includes('node_modules/xlsx') || id.includes('node_modules/file-saver') ||
        //     id.includes('node_modules/jszip')) {
        //     return 'excel-utils';
        //   }

        //   // Canvas and image utilities
        //   if (id.includes('node_modules/html2canvas') || id.includes('node_modules/qrcode')) {
        //     return 'canvas-utils';
        //   }

        //   // Supabase
        //   if (id.includes('node_modules/@supabase')) {
        //     return 'supabase';
        //   }

        //   // Other node_modules
        //   if (id.includes('node_modules')) {
        //     return 'vendor-misc';
        //   }
        // }
      }
    },
    // Increase warning limit
    chunkSizeWarningLimit: 1000
  }
})
