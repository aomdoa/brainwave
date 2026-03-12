/// <reference lib="webworker" />
// @ts-nocheck
import { precacheAndRoute } from 'workbox-precaching'
declare const __WB_MANIFEST: Array<any>

precacheAndRoute(__WB_MANIFEST)

self.addEventListener('push', (event: PushEvent) => {
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
