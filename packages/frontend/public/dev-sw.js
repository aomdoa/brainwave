/**
 * Provide 'dev' version of the sw
 */
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
  console.log(`push event with: ${Notification.permission} and ${JSON.stringify(data)}`)
  event.waitUntil(
    self.registration.showNotification(data.title, { body: data.body, icon: '/brainwave/icons/brainwave-192.png' })
  )
})

self.addEventListener('message', (event) => {
  console.log('message')
  console.dir(event)
})
