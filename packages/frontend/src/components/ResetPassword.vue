<script setup lang="ts">
/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { userUpdateSchema } from '@brainwave/shared'
import { ref, onMounted } from 'vue'
import { getAuthConfig, resetPassword } from '../api'
import { router } from '../router'

const form = ref({
  password: '',
  confirmPassword: '',
})
const token = ref('')
const schema = ref<ReturnType<typeof userUpdateSchema> | null>(null)
const errors = ref<Record<string, string>>({})

onMounted(async () => {
  const config = await getAuthConfig()
  schema.value = userUpdateSchema(config)
  const params = new URLSearchParams(window.location.search)
  token.value = params.get('token') ?? ''
})

const updatePassword = async () => {
  errors.value = {}
  if (schema.value === null) {
    throw new Error('Schema not loaded')
  }

  const result = schema.value.safeParse(form.value)
  if (!result.success) {
    const { fieldErrors } = result.error.flatten((i) => i.message)
    Object.assign(errors.value, {
      password: fieldErrors.password?.[0] ?? '',
      confirmPassword: fieldErrors.confirmPassword?.[0] ?? '',
    })
    return
  }

  await resetPassword(token.value, form.value.password, form.value.confirmPassword)
  router.push({
    path: '/login',
    state: {
      message: `Password has been updated. Please login.`,
    },
  })
}
</script>

<template>
  <p>Please enter and confirm your new password below.</p>
  <form @submit.prevent="updatePassword">
    <div class="form-group">
      <label for="password">Password: </label>
      <input id="password" v-model="form.password" type="password" />
      <div v-if="errors.password" class="field-error">
        {{ errors.password }}
      </div>
    </div>
    <div class="form-group">
      <label for="confirmPassword">Confirm Password: </label>
      <input id="confirmPassword" v-model="form.confirmPassword" type="password" />
      <div v-if="errors.confirmPassword" class="field-error">
        {{ errors.confirmPassword }}
      </div>
    </div>
    <div v-if="errors.server" class="field-error">
      {{ errors.server }}
    </div>
    <div class="form-group actions">
      <div style="margin-left: auto">
        <button type="submit">Update</button>
      </div>
    </div>
  </form>
</template>

<style scoped></style>
