import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { router } from './router'
import { reportError } from './api'
import 'flatpickr/dist/flatpickr.css'

const app = createApp(App)
app.config.errorHandler = (err, instance, info) => {
  const error = err as Error
  console.log(JSON.stringify(error))
  reportError(error, instance, info)
  //  router.push('/error')
}
app.use(router)
app.mount('#app')
