import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { router } from './router'
import { reportError } from './api'

const app = createApp(App)
app.config.errorHandler = (err, instance, info) => {
  reportError(err as Error, instance, info)
  router.push('/error')
}
app.use(router)
app.mount('#app')
