import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { readFileSync } from 'fs'
import { resolve } from 'path'

export default defineConfig({
  base: '/brainwave/',
  build: {
    sourcemap: false,
  },
  server: {
    host: true, // allows LAN access if needed
    https: {
      key: readFileSync(resolve(__dirname, 'certs/localhost-key.pem')),
      cert: readFileSync(resolve(__dirname, 'certs/localhost.pem')),
    },
  },
  plugins: [vue()],
})
