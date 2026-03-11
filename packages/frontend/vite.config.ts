import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/brainwave/',
  build: {
    sourcemap: false,
  },
  plugins: [vue()],
})
