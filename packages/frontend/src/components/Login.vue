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
  <h1>Login</h1>
  <div>
    <label for="email">Email</label>
    <input id="email" v-model="email" type="text" />

    <label for="password">Password</label>
    <input id="password" v-model="password" type="password" />

    <button type="submit" @click="login">Login</button>
  </div>
  <a href="/register">Don't have an account? Register here.</a>
</template>

<style scoped></style>
