<script setup lang="ts">
/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { ref, onMounted, reactive } from 'vue'
import { me } from '../api'
import { type ThoughtClient } from '@brainwave/shared'
import { router } from '../router'

const user = ref<{ id: number; email: string; name?: string } | null>(null)
const search = ref('')
const thoughts = ref<ThoughtClient[]>([])
const pagination = reactive({
  page: 1,
  size: 25,
  orderBy: 'lastUpdated',
  orderDesc: true,
})
const totalPages = ref(0)

const onSearch = () => {
  console.log('search')
}

const nextPage = () => {
  console.log('next page')
}

const prevPage = () => {
  console.log('prev page')
}

const sortBy = (name: string) => {
  console.log(`sortby ${name}`)
}

const goToThought = (id: number) => {
  router.push(`/thoughts/${id}`)
}

onMounted(async () => {
  user.value = await me()
})
</script>

<template>
  <div v-if="user">
    <h1>Welcome, {{ user.name || user.email }}!</h1>
    <div class="controls">
      <input type="text" v-model="search" @input="onSearch" placeholder="Search thoughts..." />
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
      <button :disabled="pagination.page === 1" @click="prevPage">Prev</button>
      <span>Page {{ pagination.page }} of {{ totalPages }}</span>
      <button :disabled="pagination.page === totalPages" @click="nextPage">Next</button>
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
