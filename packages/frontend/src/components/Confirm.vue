<script setup lang="ts">
/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { confirmAccount } from '../api'
import { router } from '../router'

const route = useRoute()
const email = route.query.email as string
const token = route.query.token as string
const status = ref('loading')
const error = ref('')

onMounted(async () => {
  if (email == null || token == null) {
    status.value = 'error'
    error.value = 'Unable to parse/confirm token - please try again or contact support'
    return
  }
  try {
    await confirmAccount(email, token)
    router.push({ path: '/login', state: { message: 'Your account has been activated! Please login...' } })
  } catch (err) {
    status.value = 'error'
    error.value = 'Activation has failed... your token may have expired'
  }
})
</script>
<template>
  <p v-if="status === 'loading'">Confirming validation...</p>
  <p v-else-if="status === 'error'">{{ error }}</p>
</template>
