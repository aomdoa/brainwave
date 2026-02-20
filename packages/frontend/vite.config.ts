import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  base: '/brainwave/',
  build: {
    sourcemap: false,
  },
  plugins: [vue()],
})
