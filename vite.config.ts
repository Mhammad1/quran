import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync } from 'fs'

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))

export default defineConfig({
  base: '/quran/',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
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
