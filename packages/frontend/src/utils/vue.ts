/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { createApp } from 'vue'
import '../style.css'
import App from '../components/App.vue'
import { router } from '../router'
import { reportError } from '../api'
import PrimeVue from 'primevue/config'
import DatePicker from 'primevue/datepicker'
import MultiSelect from 'primevue/multiselect'
import Select from 'primevue/select'
import AutoComplete from 'primevue/autocomplete'
import Dialog from 'primevue/dialog'
import ConfirmDialog from 'primevue/confirmdialog'
import ConfirmationService from 'primevue/confirmationservice'
import Aura from '@primeuix/themes/aura'

export function setupVue() {
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
  app.use(ConfirmationService)

  app.component('DatePicker', DatePicker)
  app.component('MultiSelect', MultiSelect)
  app.component('Select', Select)
  app.component('AutoComplete', AutoComplete)
  app.component('Dialog', Dialog)
  app.component('ConfirmDialog', ConfirmDialog)

  app.use(router)

  app.mount('#app')
}
