import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const target = 'http://localhost:3001'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      // "/compress": "http://localhost:3001",
      '/compress': {
        target,
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/compress/, '/compress'),
      },
    },
  },
  build: {
    outDir: '../public',
  },
})
