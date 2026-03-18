<script setup lang="ts">
/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { ref, onMounted, watch, computed } from 'vue'
import { userClientUpdateSchema } from '@brainwave/shared'
import { getAuthConfig, updateUser } from '../api'
import { router } from '../router'
import { currentUser, loadCurrentUser, logout } from '../store/user.store'
const form = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
})
const status = ref('loading')
const schema = ref<ReturnType<typeof userClientUpdateSchema> | null>(null)
const errors = ref<Record<string, string>>({})
const originalForm = ref<any>(null)

onMounted(async () => {
  const config = await getAuthConfig()
  schema.value = userClientUpdateSchema(config)
  await loadCurrentUser()
  status.value = 'loaded'
})

watch(
  currentUser,
  (user) => {
    if (user) {
      const base = {
        name: user.name,
        email: user.email,
        password: '',
        confirmPassword: '',
      }
      form.value = { ...base }
      originalForm.value = { ...base }
    }
  },
  { immediate: true }
)

const isDirty = computed(() => {
  return JSON.stringify(form.value) !== JSON.stringify(originalForm.value)
})

const userUpdate = async () => {
  let doLogout = false
  errors.value = {}

  if (schema.value === null) {
    throw new Error('Schema not loaded')
  }
  const updateValue = {
    name: undefined as string | undefined,
    email: undefined as string | undefined,
    password: undefined as string | undefined,
    confirmPassword: undefined as string | undefined,
  }
  if (form.value.name !== originalForm.value.name) {
    updateValue.name = form.value.name
  }
  if (form.value.email !== originalForm.value.email) {
    updateValue.email = form.value.email
    doLogout = true
  }
  if (form.value.password.length > 0 || form.value.confirmPassword.length > 0) {
    updateValue.password = form.value.password
    updateValue.confirmPassword = form.value.confirmPassword
  }
  const result = schema.value.safeParse(updateValue)
  if (!result.success) {
    const { fieldErrors } = result.error.flatten((i) => i.message)

    Object.assign(errors.value, {
      name: fieldErrors.name?.[0] ?? '',
      email: fieldErrors.email?.[0] ?? '',
      password: fieldErrors.password?.[0] ?? '',
      confirmPassword: fieldErrors.confirmPassword?.[0] ?? '',
    })

    return
  }

  await updateUser(result.data).catch((err) => {
    const status = err.response?.status ?? 400
    if (status === 400) {
      errors.value['server'] = 'Please fix the validation errors and try again'
    } else if (status === 409) {
      errors.value['server'] = 'A user with that email already exists'
    } else {
      errors.value['server'] = 'An error occurred during registration'
    }
    return null
  })
  if (doLogout) {
    logout()
    return router.push('/login')
  } else {
    await loadCurrentUser(true)
  }
}
</script>

<template>
  <form @submit.prevent="userUpdate">
    <div class="form-group">
      <label for="name">Name: </label>
      <input id="name" v-model="form.name" type="text" />
      <div v-if="errors.name" class="field-error">
        {{ errors.name }}
      </div>
    </div>
    <div class="form-group">
      <label for="email">Email: <span class="warning">Changing your email will require confirmation</span></label>
      <input id="email" v-model="form.email" type="text" />
      <div v-if="errors.email" class="field-error">
        {{ errors.email }}
      </div>
    </div>
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
      <button type="button" @click="router.back()">Back</button>
      <div style="margin-left: auto">
        <button type="submit" :disabled="!isDirty">Update</button>
      </div>
    </div>
  </form>
</template>

<style scoped></style>
