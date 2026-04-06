<script setup lang="ts">
/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useConfirm } from 'primevue/useconfirm'
import dayjs from 'dayjs'
import {
  setThoughtStatus,
  getTags,
  getThoughtById,
  getThoughtConfig,
  getThoughtHistory,
  getThoughtRelations,
  getThoughts,
  saveTag,
  saveThought,
  saveThoughtRelations,
  saveThoughtTags,
} from '../api'
import DateTime from './DateTime.vue'
import { router } from '../router'
import {
  thoughtCreateSchema,
  type TagClient,
  type ThoughtClient,
  type ThoughtHistoryClient,
  type ThoughtStatus,
} from '@brainwave/shared'

const route = useRoute()

// refs
let tags: TagClient[] = []
let newTagId = -1

const status = ref('loading')
const thought = ref<ThoughtClient>({
  title: '',
  body: '',
  status: 'ACTIVE',
  nextReminder: null,
  thoughtId: -1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  lastFollowUp: null,
  tags: [],
})
const thoughtRelations = ref<ThoughtClient[]>([])
const thoughtSuggestions = ref<ThoughtClient[]>([])
const thoughtHistory = ref<ThoughtHistoryClient[]>([])
const showHistory = ref(false)
const schema = ref<ReturnType<typeof thoughtCreateSchema> | null>(null)
const errors = ref<Record<string, string>>({})
const confirm = useConfirm()

// functions
const thoughtId = ref(Number(route.params.thoughtId))

watch(
  () => route.params.thoughtId,
  (newId) => {
    thoughtId.value = Number(newId)
    fetchThought(Number(newId)) // re-fetch the thought
  }
)

const goBack = router.back

const save = async () => {
  // validate the entries
  errors.value = {}
  if (schema.value === null) {
    throw new Error('Schema not loaded')
  }

  const reminder = thought.value.nextReminder != null ? dayjs(thought.value.nextReminder).toISOString() : null
  const formData = { ...thought.value, nextReminder: reminder }
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

  // perform the save tags
  status.value = 'saving'
  const tagsToProcess = thought.value.tags ?? []
  const tagIds = await Promise.all(
    tagsToProcess.map(async (tag) => {
      if (tag.tagId > 0) return tag.tagId
      const newTag = await saveTag(tag.name)
      return newTag.tagId
    })
  )

  // create/update core thought
  let params = { thoughtId: thought.value.thoughtId > 0 ? thought.value.thoughtId : undefined, ...result.data }
  const coreThought = await saveThought(params)

  // update the tags
  const updatedThought = await saveThoughtTags(coreThought.thoughtId, tagIds)
  for (const tag of updatedThought.tags ?? []) {
    if (!tags.find((t) => t.tagId === tag.tagId)) {
      tags.push(tag)
    }
  }
  tags = sortTags(tags)

  // update the linked
  await saveThoughtRelations(
    updatedThought.thoughtId,
    thoughtRelations.value.map((r) => r.thoughtId)
  )

  thought.value = updatedThought
  thoughtHistory.value = await getThoughtHistory(thought.value.thoughtId)
  status.value = 'loaded'
}

const switchStatus = async () => {
  if (thought.value.thoughtId == null) return
  const newStatus = thought.value.status === 'ACTIVE' ? 'CLOSED' : 'ACTIVE'
  if (newStatus === 'CLOSED') {
    confirm.require({
      message: 'Archive this thought?',
      header: undefined,
      icon: undefined,
      accept: () => {
        doSwitchStatus(newStatus)
      },
    })
  } else {
    doSwitchStatus(newStatus)
  }
}

const doSwitchStatus = async (newStatus: ThoughtStatus) => {
  status.value = 'saving'
  const updatedThought = await setThoughtStatus(thought.value.thoughtId, newStatus)
  if (newStatus === 'CLOSED') {
    router.back()
  } else {
    thought.value = updatedThought
    thoughtHistory.value = await getThoughtHistory(thought.value.thoughtId)
    status.value = 'loaded'
  }
}

const onEnterNewTag = (event: KeyboardEvent) => {
  const input = event.target as HTMLInputElement
  if (input.value.length === 0) return
  if (tags.find((t) => t.name === input.value)) return
  addNewTag(input.value)
  input.value = ''
}

const addNewTag = async (name: string) => {
  const tag = { tagId: newTagId, name } as TagClient
  newTagId--
  tags.push(tag)
  if (thought.value.tags == null) thought.value.tags = []
  thought.value.tags.push(tag)
  sortTags(thought.value.tags)
  sortTags(tags)
}

const sortTags = (tags: TagClient[]): TagClient[] => {
  return tags.sort((a, b) => a.name.localeCompare(b.name))
}

async function searchThoughts(event: any) {
  const query = event.query?.trim()

  console.log(`query is ${JSON.stringify(query)}`)
  const { thoughts } = await getThoughts({
    search: query,
    filter: [
      {
        field: 'status',
        operator: 'eq',
        value: 'ACTIVE',
        logical: 'and',
      },
    ],
    page: 1,
    size: 50,
    orderBy: {
      field: 'updatedAt',
      direction: 'desc',
    },
  })
  thoughtSuggestions.value = thoughts.filter((t) => t.thoughtId !== thought.value.thoughtId)
}

const nextReminder = computed({
  get: () => {
    return thought.value.nextReminder ? new Date(thought.value.nextReminder) : null
  },
  set: (newValue) => {
    if (newValue) {
      // it is a string... I'm right you're wrong
      thought.value.nextReminder = newValue as unknown as string
    } else {
      thought.value.nextReminder = null
    }
  },
})

const fetchThought = async (thoughtId: number) => {
  try {
    tags = sortTags(await getTags())
    const config = await getThoughtConfig()
    schema.value = thoughtCreateSchema(config)
    if (thoughtId > 0) {
      const thoughtData = await getThoughtById(thoughtId)
      thought.value = thoughtData
      thought.value.tags = sortTags(thought.value.tags ?? [])
      const relations = await getThoughtRelations(thoughtId)
      thoughtRelations.value = relations.map((r) => r.thought)
      thoughtHistory.value = await getThoughtHistory(thoughtId)
    }
  } finally {
    status.value = 'loaded'
  }
}
onMounted(async () => {
  const thoughtId = Number(route.params.thoughtId ?? 0)
  fetchThought(thoughtId)
})
</script>

<template>
  <div v-if="status === 'loading'">Loading...</div>
  <div v-else-if="status === 'saving'">Saving...</div>
  <div v-else>
    <form @submit.prevent="save">
      <div class="form-group">
        <label for="title">Title: </label>
        <input id="title" v-model="thought.title" type="text" placeholder="Quick reference title..." />
        <div v-if="errors.title" class="field-error">
          {{ errors.title }}
        </div>
      </div>
      <div class="form-group">
        <div style="display: flex; align-items: center">
          <label for="body">Details: </label>
          <Button
            v-if="thoughtHistory.length > 0"
            type="button"
            label="History"
            style="margin-left: auto; font-size: smaller"
            @click="showHistory = true"
          >
            History
          </Button>
        </div>
        <textarea
          id="thought-body"
          v-model="thought.body"
          rows="8"
          placeholder="Write your thought here..."
          class="form-control"
        ></textarea>
        <div v-if="errors.body" class="field-error">
          {{ errors.body }}
        </div>
      </div>
      <div class="form-group">
        <label for="tags">Tags: </label>

        <MultiSelect
          v-model="thought.tags"
          :options="tags"
          optionLabel="name"
          placeholder="Select tags"
          display="chip"
          filter
          filterPlaceholder="Search tags"
          :showClear="true"
          :showSelectAll="false"
          :checkbox="false"
        >
          <template #header>
            <div class="p-d-flex p-jc-between p-ai-center p-px-2">
              <span>Add new tag: </span>
              <input
                type="text"
                class="p-inputtext p-mr-2"
                placeholder="New tag"
                @keydown.enter.prevent="onEnterNewTag"
              />
            </div>
          </template>
        </MultiSelect>
      </div>
      <div class="form-group">
        <label for="relations">Related Thoughts:</label>

        <AutoComplete
          ref="thoughtAutoComplete"
          v-model="thoughtRelations"
          multiple
          optionLabel="title"
          dataKey="thoughtId"
          :suggestions="thoughtSuggestions"
          placeholder="Search thoughts"
          @complete="searchThoughts"
          :minLength="0"
          completeOnFocus
        >
          <template #chip="slotProps">
            <span class="p-chip-text p-d-flex p-ai-center">
              <!-- Clickable text -->
              <router-link :to="`/thoughts/${slotProps.value.thoughtId}`" class="chip-link p-mr-2">
                {{ slotProps.value.title }}
              </router-link>

              <!-- Manual Remove Button -->
              <button
                type="button"
                class="p-chip-remove p-button p-button-text p-button-sm"
                @click="slotProps.removeCallback"
              >
                ✕
              </button>
            </span>
          </template>
        </AutoComplete>
      </div>
      <div class="form-group">
        <label for="nextReminder">Next Reminder: </label>
        <DateTime id="nextReminder" v-model="nextReminder" />
        <div v-if="errors.nextReminder" class="field-error">
          {{ errors.nextReminder }}
        </div>
      </div>

      <div class="form-group form-display">
        <div class="form-column">
          <label>Created: </label>
          <span>{{ dayjs(thought.createdAt).format('YYYY-MM-DD HH:mm') }}</span>
        </div>
        <div class="form-column">
          <label>Updated: </label>
          <span>{{ dayjs(thought.updatedAt).format('YYYY-MM-DD HH:mm') }}</span>
        </div>
        <div class="form-column">
          <label>Last Followed Up: </label>
          <span>{{ thought.lastFollowUp ? dayjs(thought.lastFollowUp).format('YYYY-MM-DD HH:mm') : 'N/A' }}</span>
        </div>
        <div class="form-column">
          <label>Status: </label><span>{{ thought.status }}</span>
        </div>
      </div>
      <div v-if="errors.server" class="field-error">
        {{ errors.server }}
      </div>
      <div class="form-group actions">
        <button type="button" @click="goBack">Back</button>
        <div style="margin-left: auto">
          <button v-if="thought.thoughtId > 0" type="button" @click="switchStatus" variant="outlined">
            {{ thought.status === 'ACTIVE' ? 'Archive' : 'Unarchive' }}
          </button>
          <button style="margin-left: 1em" type="submit">{{ thought.thoughtId > 0 ? 'Update' : 'Create' }}</button>
        </div>
      </div>
    </form>
  </div>
  <Dialog v-model:visible="showHistory" modal maximizable header="Thought History" :style="{ width: '50vw' }">
    <div class="history-container">
      <div v-for="history in thoughtHistory" :key="history.thoughtBodyHistoryId" class="history-item">
        <div class="history-date">{{ dayjs(history.createdAt).format('YYYY-MM-DD HH:mm') }}</div>
        <pre class="history-body">{{ history.body }}</pre>
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
.chip-link {
  color: black;
  text-decoration: none;
  cursor: pointer;
}

.chip-link:hover {
  text-decoration: underline;
}

.history-item {
  border-top: 1px solid black;
  margin-top: 1rem;
}
</style>
