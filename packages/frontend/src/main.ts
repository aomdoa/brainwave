/// <reference types="vite-plugin-pwa/client" />
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { router } from './router'
import { reportError } from './api'
import PrimeVue from 'primevue/config'
import { DatePicker, MultiSelect, Select, AutoComplete, Dialog } from 'primevue'
import Aura from '@primeuix/themes/aura'

if (import.meta.env.DEV) {
  // DEV: manually register our dev SW
  navigator.serviceWorker
    .register('/brainwave/dev-sw.js')
    .then((reg) => console.log('Dev SW registered:', reg))
    .catch((err) => console.error('Dev SW failed:', err))
} else {
  // PROD: let VitePWA handle registration
  import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({
      onRegistered: (reg) => console.log('Prod SW registered:', reg),
      onRegisterError: (err) => console.error('Prod SW failed:', err),
    })
  })
}

async function requestNotificationPermission() {
  if (!('Notification' in window)) return

  const permission = await Notification.requestPermission()
  if (permission === 'granted') {
    console.log('Notification permission granted!')
  } else {
    console.warn('Notification permission denied!')
  }
}

requestNotificationPermission()

const app = createApp(App)
app.config.errorHandler = (err, instance, info) => {
  if (err) {
    const error = err as Error
    if (error.name === 'TypeError') {
      router.push('/login')
      return
    } else {
      reportError(error, instance, info)
    }
  }
  router.push('/error')
}

app.use(PrimeVue, { theme: { preset: Aura } })
app.component('DatePicker', DatePicker)
app.component('MultiSelect', MultiSelect)
app.component('Select', Select)
app.component('AutoComplete', AutoComplete)
app.component('Dialog', Dialog)

app.use(router)

app.mount('#app')
