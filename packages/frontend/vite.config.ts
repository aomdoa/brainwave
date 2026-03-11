import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { VitePWA } from 'vite-plugin-pwa'

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
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate', // automatically update SW
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js', // <-- your dev SW
      injectManifest: {
        // specify source SW
        swSrc: 'src/sw.ts', // <-- this is the source TS file
      },

      devOptions: {
        enabled: false, // enable PWA in dev for testing
      },
      manifest: {
        name: 'Brainwave',
        short_name: 'Brainwave',
        description: 'Brainwave PWA',
        start_url: '/brainwave/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#4f46e5',
        icons: [
          {
            src: 'icons/brainwave-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/brainwave-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        // just log what workbox sees for now
        navigateFallback: '/brainwave/index.html',
      },
    }),
  ],
})
