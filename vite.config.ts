import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
    watch: {
      ignored: [
        path.resolve(__dirname, './src/routes'),
        path.resolve(__dirname, './src/services'),
        path.resolve(__dirname, './src/middleware'),
        path.resolve(__dirname, './src/worker.ts'),
      ],
    },
  },
  build: {
    manifest: true,
  },
}) 