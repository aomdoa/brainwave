<script setup lang="ts">
/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { ref, onMounted, reactive, watch } from 'vue'
import { refDebounced } from '@vueuse/core'
import { type ThoughtClient } from '@brainwave/shared'
import { getThoughts, me } from '../api'
import { router } from '../router'

const pageSize = 2
const user = ref<{ id: number; email: string; name?: string } | null>(null)
const search = ref('')
const thoughts = ref<ThoughtClient[]>([])
const pagination = reactive({
  currentPage: 1,
  currentPageSize: 0,
  orderBy: 'updatedAt',
  orderDesc: true,
})
const totalPages = ref(0)

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

const goToThought = (id: number) => {
  router.push(`/thoughts/${id}`)
}

const fetchThoughts = async () => {
  const { thoughts: fetchedThoughts, page } = await getThoughts({
    orderBy: {
      field: pagination.orderBy,
      direction: pagination.orderDesc ? 'desc' : 'asc',
    },
    search: search.value.length > 0 ? search.value : undefined,
    page: pagination.currentPage,
    size: pageSize,
  })
  pagination.currentPage = page.current
  pagination.currentPageSize = page.size
  totalPages.value = page.totalPages
  thoughts.value = fetchedThoughts
}

onMounted(async () => {
  await fetchThoughts()
  user.value = await me()
})
</script>

<template>
  <div v-if="user">
    <h1>Welcome, {{ user.name || user.email }}!</h1>
    <div class="controls">
      <input type="text" v-model="search" @keyup.enter="onSearch()" placeholder="Search thoughts..." />
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
          <th @click="sortBy('updatedAt')">
            Last Updated
            <span v-if="pagination.orderBy === 'updatedAt'">
              {{ pagination.orderDesc ? '▼' : '▲' }}
            </span>
          </th>
          <th @click="sortBy('nextReminder')">
            Next Reminder
            <span v-if="pagination.orderBy === 'nextReminder'">
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
          class="clickable-row"
        >
          <td>{{ thought.title }}</td>
          <td>{{ thought.updatedAt }}</td>
          <td>{{ thought.nextReminder }}</td>
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
  margin-bottom: 1rem;
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
</style>
