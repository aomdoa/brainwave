<script setup lang="ts">
/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login as apiLogin } from '../api'

const email = ref('')
const password = ref('')
const router = useRouter()

const login = async () => {
  window.alert(`Logging in with ${email.value} and ${password.value}`)
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
  <a href="/register">Don't have an account? Register here.</a>
</template>

<style scoped></style>
