<script setup lang="ts">
/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { ref, onMounted } from 'vue'
import { me } from '../api'

const user = ref<{ id: string; email: string; name?: string } | null>(null)

onMounted(async () => {
  user.value = await me()
})
</script>

<template>
  <div v-if="user">
    <h1>Welcome, {{ user.name || user.email }}!</h1>
  </div>
  <div v-else>Loading...</div>
</template>
