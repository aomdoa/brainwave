<script setup lang="ts">
/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { login as apiLogin } from '../api'

const router = useRouter()
const email = ref('')
const password = ref('')
const welcomeName = ref('')

onMounted(() => {
  welcomeName.value = (router.options.history.state?.userName as string) ?? ''
})
const login = async () => {
  await apiLogin(email.value, password.value).catch((err) => {
    window.alert(`Login failed: ${err.message}`)
  })
  router.push('/dashboard')
}
</script>
<template>
  <p>
    Connect your brain to Brainwave and unlock the full potential of your mind. Log in to access your personalized
    dashboard, where you can monitor your brain activity, set goals, and explore new ways to enhance your cognitive
    abilities.
  </p>
  <p v-if="welcomeName">Welcome {{ welcomeName }}! Please log in to continue.</p>
  <form @submit.prevent="login">
    <div class="form-group">
      <label for="email">Email: </label>
      <input id="email" v-model="email" type="text" />
    </div>
    <div class="form-group">
      <label for="password">Password: </label>
      <input id="password" v-model="password" type="password" />
    </div>
    <div class="form-group actions">
      <button type="submit">Login</button>
    </div>
  </form>
  <router-link to="/register">
    Don't have an account? Register <span style="text-decoration: underline">here</span>.
  </router-link>
</template>

<style scoped></style>
