/// <reference lib="webworker" />
// @ts-nocheck
import { precacheAndRoute } from 'workbox-precaching'
const manifest = self.__WB_MANIFEST || []
precacheAndRoute(manifest)

self.addEventListener('install', (event: ExtendableEvent) => {
  console.log('install')
  self.skipWaiting()
})

self.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('activate')
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event: PushEvent) => {
  console.log('push')
  console.dir(event)
  let data = { title: 'Brainwave', body: 'Push received' }

  if (event.data) {
    try {
      data = event.data.json()
    } catch {
      data.body = event.data.text()
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/brainwave/icons/brainwave-192.png',
    })
  )
})
