import { precacheAndRoute } from 'workbox-precaching'
precacheAndRoute(self.__WB_MANIFEST)

self.addEventListener('push', (event) => {
  const data = event.data?.json() || { title: 'Brainwave', body: 'Test push' }
  event.waitUntil(self.registration.showNotification(data.title, { body: data.body }))
})
