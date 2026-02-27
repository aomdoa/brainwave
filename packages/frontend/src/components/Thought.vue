<script setup lang="ts">
/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { thoughtClientCreateSchema } from '@brainwave/shared'
import { getThoughtById, getThoughtConfig } from '../api'
import DateTime from './DateTime.vue'

const route = useRoute()
const status = ref('loading')
const form = ref<{
  title: string
  body: string
  nextReminder: Date | null
}>({
  title: '',
  body: '',
  nextReminder: null,
})
const thoughtId = ref<number | null>(null)
const schema = ref<ReturnType<typeof thoughtClientCreateSchema> | null>(null)
const errors = ref<Record<string, string>>({})

const save = async () => {}

onMounted(async () => {
  try {
    const config = await getThoughtConfig()
    schema.value = thoughtClientCreateSchema(config)
    if (route.params.thoughtId) {
      thoughtId.value = Number(route.params.thoughtId)
      const thought = await getThoughtById(thoughtId.value)
      form.value.title = thought.title
      form.value.body = thought.body
      form.value.nextReminder = thought.nextReminder
    }
  } finally {
    status.value = 'loaded'
  }
})
</script>

<template>
  <div v-if="status === 'loading'">Loading...</div>
  <div v-else>
    <form @submit.prevent="save">
      <div class="form-group">
        <label for="title">Title: </label>
        <input id="title" v-model="form.title" type="text" placeholder="Quick reference title..." />
        <div v-if="errors.title" class="field-error">
          {{ errors.title }}
        </div>
      </div>
      <div class="form-group">
        <label for="body">Details: </label>
        <textarea
          id="thought-body"
          v-model="form.body"
          rows="8"
          placeholder="Write your thought here..."
          class="form-control"
        ></textarea>
        <div v-if="errors.body" class="field-error">
          {{ errors.body }}
        </div>
      </div>
      <div class="form-group">
        <DateTime id="nextReminder" label="Next Reminder" v-model="form.nextReminder" />
        <div v-if="errors.nextReminder" class="field-error">
          {{ errors.nextReminder }}
        </div>
      </div>
      <div v-if="errors.server" class="field-error">
        {{ errors.server }}
      </div>
      <div class="form-group actions">
        <button type="submit">{{ thoughtId ? 'Update' : 'Create' }}</button>
      </div>
    </form>
  </div>
</template>

<style scoped></style>
