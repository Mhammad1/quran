import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/quran/',
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5175,
  },
  build: {
    // quran.json chunk is ~1.8MB (331KB gzipped) — expected for full Quran dataset
    chunkSizeWarningLimit: 2000,
  },
})
