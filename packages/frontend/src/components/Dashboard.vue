<script setup lang="ts">
/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { ref, onMounted, reactive, watch } from 'vue'
import { refDebounced, useBreakpoints } from '@vueuse/core'
import { type TagClient, type ThoughtClient } from '@brainwave/shared'
import { getTags, getThoughts } from '../api'
import { router } from '../router'
import dayjs from 'dayjs'
import { currentUser, loadCurrentUser } from '../store/user.store'

let tags: TagClient[] = []
const pageSize = 20
const search = ref('')
const statuses = ref([
  { name: 'Active', value: 'ACTIVE' },
  { name: 'Closed', value: 'CLOSED' },
])
const selectedStatus = ref(statuses.value[0])
const tag = ref<TagClient | null>(null)
const thoughts = ref<ThoughtClient[]>([])
const pagination = reactive({
  currentPage: 1,
  currentPageSize: 0,
  orderBy: 'lastFollowUp',
  orderDesc: false,
})
const totalPages = ref(0)

const breakpoints = useBreakpoints({
  mobile: 768,
})
const isMobile = breakpoints.smaller('mobile')

const debouncedSearch = refDebounced(search, 400)
watch(debouncedSearch, () => {
  onSearch()
})

const onSearch = () => {
  fetchThoughts()
}

const nextPage = () => {
  const newPage = pagination.currentPage + 1
  if (newPage <= totalPages.value) {
    pagination.currentPage = newPage
    fetchThoughts()
  }
}

const prevPage = () => {
  const newPage = pagination.currentPage - 1
  if (newPage > 0) {
    pagination.currentPage = newPage
    fetchThoughts()
  }
}

const sortBy = (name: string) => {
  pagination.currentPage = 1
  if (pagination.orderBy === name) {
    pagination.orderDesc = !pagination.orderDesc
  } else {
    pagination.orderBy = name
    pagination.orderDesc = true
  }
  fetchThoughts()
}

const create = () => {
  router.push('/thoughts/')
}

const goToThought = (id: number) => {
  router.push(`/thoughts/${id}`)
}

const selectionChange = () => {
  fetchThoughts()
}

const fetchThoughts = async () => {
  const { thoughts: fetchedThoughts, page } = await getThoughts({
    orderBy: {
      field: pagination.orderBy,
      direction: pagination.orderDesc ? 'desc' : 'asc',
    },
    filter: [
      {
        field: 'status',
        operator: 'eq',
        value: selectedStatus.value?.value ?? 'ACTIVE',
        logical: 'and',
      },
    ],
    search: search.value.length > 0 ? search.value : undefined,
    page: pagination.currentPage,
    size: pageSize,
    tagId: tag.value?.tagId ? [tag.value.tagId] : undefined,
  })
  pagination.currentPage = page.current
  pagination.currentPageSize = page.size
  totalPages.value = page.totalPages
  thoughts.value = fetchedThoughts
}

onMounted(async () => {
  await loadCurrentUser()
  tags = await getTags()
  await fetchThoughts()
})
</script>

<template>
  <div v-if="currentUser">
    <h1>Welcome, {{ currentUser.name || currentUser.email }}!</h1>
    <div class="controls">
      <input type="text" v-model="search" @keyup.enter="onSearch()" placeholder="Search thoughts..." />
      <Select
        v-if="!isMobile"
        @change="selectionChange"
        class="tag-select"
        v-model="tag"
        :options="tags"
        optionLabel="name"
        placeholder="Tag..."
        showClear
        :title="tag?.name"
      />
      <Select
        v-if="!isMobile"
        @change="selectionChange"
        class="status-select"
        v-model="selectedStatus"
        :options="statuses"
        optionLabel="name"
        :title="selectedStatus?.name"
      />

      <button @click="create">Add Thought</button>
    </div>

    <table class="thoughts-table">
      <thead>
        <tr>
          <th @click="sortBy('title')">
            Title
            <span v-if="pagination.orderBy === 'title'">
              {{ pagination.orderDesc ? '▼' : '▲' }}
            </span>
          </th>
          <th v-if="!isMobile" @click="sortBy('updatedAt')">
            Last Updated
            <span v-if="pagination.orderBy === 'updatedAt'">
              {{ pagination.orderDesc ? '▼' : '▲' }}
            </span>
          </th>
          <th v-if="!isMobile" @click="sortBy('lastFollowUp')">
            Last Checked
            <span v-if="pagination.orderBy === 'lastFollowUp'">
              {{ pagination.orderDesc ? '▼' : '▲' }}
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="thought in thoughts"
          :key="thought.thoughtId"
          @click="goToThought(thought.thoughtId)"
          :class="[
            'clickable-row',
            { todo: thought.nextReminder !== null && new Date(thought.nextReminder) < new Date() },
          ]"
        >
          <td>{{ thought.title }}</td>
          <td v-if="!isMobile" style="width: 18ch">{{ dayjs(thought.updatedAt).format('YYYY-MM-DD HH:mm') }}</td>
          <td v-if="!isMobile" style="width: 18ch">
            {{ thought.lastFollowUp ? dayjs(thought.lastFollowUp).format('YYYY-MM-DD HH:mm') : 'Never' }}
          </td>
        </tr>
      </tbody>
    </table>

    <div class="pagination">
      <button :disabled="pagination.currentPage === 1" @click="prevPage">Prev</button>
      <span>Page {{ pagination.currentPage }} of {{ totalPages }}</span>
      <button :disabled="pagination.currentPage === totalPages" @click="nextPage">Next</button>
    </div>
  </div>
  <div v-else>Loading...</div>
</template>

<style scoped>
.thoughts-table {
  width: 100%;
  border-collapse: collapse;
}
.thoughts-table th,
.thoughts-table td {
  padding: 8px;
  border: 1px solid #ddd;
}
.thoughts-table th {
  cursor: pointer;
  user-select: none;
}
.clickable-row {
  cursor: pointer;
}
.clickable-row:hover {
  background-color: #f0f0f0;
}
.controls {
  display: flex;
  margin-bottom: 1rem;
}
.controls input {
  width: 20rem;
}
.controls button {
  margin-left: auto;
}
.pagination {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
}
.pagination button {
  margin: 0 0.5rem;
}
.tag-select {
  margin-left: 1rem;
  width: 12rem;
}
.status-select {
  margin-left: 1rem;
  width: 8rem;
}
.controls .p-select-label {
  font-size: 0.8rem;
}
.todo {
  background-color: #fff3cd;
}

@media (prefers-color-scheme: dark) {
  .todo {
    background-color: #3c597e;
  }

  .clickable-row:hover {
    background-color: #51657e;
  }

  .p-select,
  .p-multiselect {
    background-color: #2c2c39;
  }
}
</style>
