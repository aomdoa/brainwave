<script setup lang="ts">
/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { login as apiLogin, oauthLogin } from '../store/user.store'
import { config } from '../utils/config'
import { forgotPassword } from '../api'

const router = useRouter()
const email = ref('')
const password = ref('')
const isProcessing = ref(false)
const message = ref('')
const failed = ref('')
const showReset = ref(false)

onMounted(() => {
  message.value = (router.options.history.state?.message as string) ?? ''
})

const login = async () => {
  if (isProcessing.value) return
  isProcessing.value = true
  apiLogin(email.value, password.value)
    .then(() => {
      router.push('/dashboard')
    })
    .catch((err) => {
      const error = err as Error
      if (error.message === 'need confirmation') {
        failed.value = 'You must confirm your account before logging in, please check your email'
      } else {
        failed.value = 'Invalid credentials provided, please check your input and try again.'
        showReset.value = true
      }
      isProcessing.value = false
    })
}

const loginWithGoogle = () => {
  const width = 500
  const height = 600

  const left = window.screenX + (window.outerWidth - width) / 2
  const top = window.screenY + (window.outerHeight - height) / 2

  const url = new URL(`${config.VITE_API_URL}/auth/google`)
  const popup = window.open(url, 'google-login', `width=${width},height=${height},left=${left},top=${top}`)

  const listener = (event: MessageEvent) => {
    if (event.origin !== url.origin) return
    const { token } = event.data
    if (token) {
      oauthLogin(token).then(() => {
        window.removeEventListener('message', listener)
        popup?.close()
        router.push('/dashboard')
      })
    }
  }

  window.addEventListener('message', listener)
}

const startResetPassword = async () => {
  await forgotPassword(email.value)
  failed.value = ''
  showReset.value = false
  message.value = `A password reset link has been sent to ${email.value}. Please check your email and follow the instructions to reset your password.`
}
</script>
<template>
  <p>
    Connect your brain to Brainwave and unlock the full potential of your mind. Log in to access your personalized
    dashboard, where you can monitor your brain activity, set goals, and explore new ways to enhance your cognitive
    abilities.
  </p>
  <p v-if="message">{{ message }}</p>
  <p v-if="failed" style="color: red">
    {{ failed }}
    <a v-if="showReset" href="#" @click.prevent="startResetPassword" style="color: red; text-decoration: underline">
      Reset Password
    </a>
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
    <div class="form-group actions"></div>
    <div class="form-group actions">
      <button type="button" @click="loginWithGoogle">Sign in with Google</button>

      <div style="margin-left: auto">
        <button id="login" type="submit" :disabled="isProcessing">
          {{ isProcessing ? 'Logging in...' : 'Login' }}
        </button>
      </div>
    </div>
  </form>
  <router-link to="/register">
    Don't have an account? Register <span style="text-decoration: underline">here</span>.
  </router-link>
</template>

<style scoped></style>
