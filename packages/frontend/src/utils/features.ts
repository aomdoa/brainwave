/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { subscribeEvents } from '../api'
import { config } from './config'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
}

export async function subscribeUser(reg: ServiceWorkerRegistration) {
  let sub = await reg.pushManager.getSubscription()
  if (sub == null) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(config.VITE_VAPID_PUBLIC),
    })
  }
  await subscribeEvents(sub).catch((err) => console.error(err))
}

export async function isSubscribed(): Promise<boolean> {
  const permission = await Notification.requestPermission()
  if (permission === 'granted') {
    return true
  } else {
    return false
  }
}

export async function pwaConfigure(reg: ServiceWorkerRegistration | undefined) {
  if (!reg) {
    console.warn('No pwa setup...')
    return
  }
  const permission = await Notification.requestPermission()
  if (permission === 'granted') {
    console.log('subscribed')
    await subscribeUser(reg)
  }
}

export function setupPwa() {
  if (import.meta.env.DEV) {
    console.debug('dev sw')
    navigator.serviceWorker
      .register('/dev-sw.js')
      .then((reg) => pwaConfigure(reg))
      .catch((err) => console.error('Dev SW failed:', err))
  } else {
    console.debug('prod sw')
    navigator.serviceWorker
      .register('/sw.js', { scope: '/brainwave/' })
      .then((reg) => pwaConfigure(reg))
      .catch((err) => console.error('SW registration failed:', err))
  }
}

// send notifications
export async function requestNotificationPermission() {
  if (!('Notification' in window)) return
  const permission = await Notification.requestPermission()
  if (permission === 'granted') {
    console.log('Notification permission granted!')
  } else {
    console.warn('Notification permission denied!')
  }
}
