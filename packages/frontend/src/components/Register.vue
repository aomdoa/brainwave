<script setup lang="ts">
/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { ref } from 'vue'

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')

const register = async () => {}
</script>

<template>
  <form @submit.prevent="register">
    <div class="form-group">
      <label for="name">Name: </label>
      <input id="name" v-model="name" type="text" />
    </div>
    <div class="form-group">
      <label for="email">Email: </label>
      <input id="email" v-model="email" type="text" />
    </div>
    <div class="form-group">
      <label for="password">Password: </label>
      <input id="password" v-model="password" type="password" />
    </div>
    <div class="form-group">
      <label for="confirmPassword">Confirm Password: </label>
      <input id="confirmPassword" v-model="confirmPassword" type="password" />
    </div>
    <div class="form-group actions">
      <button type="submit">Register</button>
    </div>
  </form>
</template>

<style scoped></style>
