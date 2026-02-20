<script setup lang="ts">
/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { ref, onMounted } from 'vue'
import { createRegisterSchema } from '@brainwave/shared'
import { getAuthConfig, registerUser } from '../api'
import { router } from '../router'

const form = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
})
const status = ref('loading')
const schema = ref<ReturnType<typeof createRegisterSchema> | null>(null)
const errors = ref<Record<string, string>>({})

onMounted(async () => {
  try {
    const config = await getAuthConfig()
    schema.value = createRegisterSchema({
      minNameLength: Number(config.minNameLength),
      minPasswordLength: Number(config.minPasswordLength),
    })
  } finally {
    status.value = 'loaded'
  }
})

const register = async () => {
  errors.value = {}

  if (schema.value === null) {
    throw new Error('Schema not loaded')
  }

  const result = schema.value.safeParse(form.value)
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

  const user = await registerUser(form.value).catch((err) => {
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
  console.dir(user)

  if (user) {
    router.push({ path: '/login', state: { userName: user.name } })
  }
}
</script>

<template>
  <div v-if="status === 'loading'">Loading...</div>
  <div v-else>
    <form @submit.prevent="register">
      <div class="form-group">
        <label for="name">Name: </label>
        <input id="name" v-model="form.name" type="text" />
        <div v-if="errors.name" class="field-error">
          {{ errors.name }}
        </div>
      </div>
      <div class="form-group">
        <label for="email">Email: </label>
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
        <button type="submit">Register</button>
      </div>
    </form>
  </div>
</template>

<style scoped></style>
