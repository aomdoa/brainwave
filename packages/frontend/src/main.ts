import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { router } from './router'
import { reportError } from './api'
import PrimeVue from 'primevue/config'
import { DatePicker, MultiSelect, Select, AutoComplete, Dialog } from 'primevue'
import Aura from '@primeuix/themes/aura'
import 'primeicons/primeicons.css'

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
