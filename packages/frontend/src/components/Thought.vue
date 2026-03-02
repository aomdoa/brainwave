<script setup lang="ts">
/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'
import { thoughtClientCreateSchema, type ThoughtStatus } from '@brainwave/shared'
import { deleteThought, getThoughtById, getThoughtConfig, saveThought } from '../api'
import DateTime from './DateTime.vue'
import { router } from '../router'

const route = useRoute()
const status = ref('loading')
const form = ref<{
  title: string
  body: string
  status: ThoughtStatus
  nextReminder: Date | string | null
}>({
  title: '',
  body: '',
  status: 'ACTIVE',
  nextReminder: null,
})
const thoughtInfo = ref<{
  thoughtId: number | null
  createdAt: Date | string | null
  updatedAt: Date | string | null
  lastFollowUp: Date | string | null
}>({
  thoughtId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastFollowUp: null,
})

const schema = ref<ReturnType<typeof thoughtClientCreateSchema> | null>(null)
const errors = ref<Record<string, string>>({})

const goBack = router.back

const save = async () => {
  // validate the entries
  errors.value = {}
  if (schema.value === null) {
    throw new Error('Schema not loaded')
  }

  const reminder = form.value.nextReminder != null ? dayjs(form.value.nextReminder).toISOString() : null
  const formData = { ...form.value, nextReminder: reminder }
  const result = schema.value.safeParse(formData)
  if (!result.success) {
    const { fieldErrors } = result.error.flatten((i) => i.message)
    Object.assign(errors.value, {
      title: fieldErrors.title?.[0] ?? '',
      body: fieldErrors.body?.[0] ?? '',
      nextReminder: fieldErrors.nextReminder?.[0] ?? '',
    })
    return
  }

  // perform the save
  status.value = 'saving'
  let params = { thoughtId: null as number | null, ...result.data }
  if (thoughtInfo.value.thoughtId != null) {
    params.thoughtId = thoughtInfo.value.thoughtId
  }
  const updatedThought = await saveThought(params)
  form.value = updatedThought
  thoughtInfo.value = updatedThought
  status.value = 'loaded'
}

const remove = async () => {
  if (thoughtInfo.value.thoughtId == null) return
  if (window.confirm('Are you sure we want to delete the thought?')) {
    await deleteThought(thoughtInfo.value.thoughtId)
    router.back()
  }
}

onMounted(async () => {
  try {
    const config = await getThoughtConfig()
    schema.value = thoughtClientCreateSchema(config)
    if (route.params.thoughtId) {
      const thoughtId = Number(route.params.thoughtId)
      const thought = await getThoughtById(thoughtId)
      form.value = thought
      thoughtInfo.value = thought
    }
  } finally {
    status.value = 'loaded'
  }
})
</script>

<template>
  <div v-if="status === 'loading'">Loading...</div>
  <div v-else-if="status === 'saving'">Saving...</div>
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
      <div class="form-group form-display">
        <div class="form-column">
          <label>Created: </label>
          <span>{{ dayjs(thoughtInfo.createdAt).format('YYYY-MM-DD HH:mm') }}</span>
        </div>
        <div class="form-column">
          <label>Updated: </label>
          <span>{{ dayjs(thoughtInfo.updatedAt).format('YYYY-MM-DD HH:mm') }}</span>
        </div>
        <div class="form-column">
          <label>Last Followed Up: </label>
          <span>{{
            thoughtInfo.lastFollowUp ? dayjs(thoughtInfo.lastFollowUp).format('YYYY-MM-DD HH:mm') : 'N/A'
          }}</span>
        </div>
        <div class="form-column">
          <label>Status: </label><span>{{ form.status }}</span>
        </div>
      </div>
      <div class="form-group actions">
        <button type="button" @click="goBack">Back</button>
        <div style="margin-left: auto">
          <button v-if="thoughtInfo.thoughtId != null" type="button" @click="remove">Delete</button>
          <button style="margin-left: 1em" type="submit">{{ thoughtInfo.thoughtId ? 'Update' : 'Create' }}</button>
        </div>
      </div>
    </form>
  </div>
</template>

<style scoped></style>
