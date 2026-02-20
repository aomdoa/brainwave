import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { router } from './router'

const app = createApp(App)
app.config.errorHandler = (err) => {
  console.error('Global error handler:', err)
  router.push('/error')
}
app.use(router)
app.mount('#app')
