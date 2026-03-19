/// <reference lib="webworker" />
// @ts-nocheck
import { precacheAndRoute } from 'workbox-precaching'
const manifest = self.__WB_MANIFEST || []
precacheAndRoute(manifest)

self.addEventListener('install', (event: ExtendableEvent) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event: PushEvent) => {
  let data = { title: 'Brainwave Notification', body: 'Update', data: { url: '/thoughts' } }

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
      icon: '/icons/brainwave-192.png',
      data: data.data || { url: '/' },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  const url = event.notification.data?.url
  event.waitUntil(clients.openWindow(url))
})
