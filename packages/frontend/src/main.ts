import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { router } from './router'
import { reportError } from './api'
import PrimeVue from 'primevue/config'
import { DatePicker, MultiSelect } from 'primevue'
import Aura from '@primeuix/themes/aura'
import 'primeicons/primeicons.css'

const app = createApp(App)
app.config.errorHandler = (err, instance, info) => {
  const error = err as Error
  console.log(JSON.stringify(error))
  reportError(error, instance, info)
  //  router.push('/error')
}
app.use(router)

app.use(PrimeVue, { theme: { preset: Aura } })
app.component('DatePicker', DatePicker)
app.component('MultiSelect', MultiSelect)

app.mount('#app')
