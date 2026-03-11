// public/brainwave/dev-sw.js
self.addEventListener('install', (event) => {
  console.log('Dev SW installing…')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('Dev SW activating…')
  self.clients.claim()
})

self.addEventListener('push', (event) => {
  console.dir(event)
  const data = event.data?.json() || { title: 'Brainwave Dev', body: 'Test push' }
  console.log(data.title)
  console.log(data.body)
  event.waitUntil(
    self.registration.showNotification(data.title, { body: data.body, icon: '/brainwave/icons/brainwave-192.png' })
  )
  console.log('done')
})
