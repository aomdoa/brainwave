/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { ref, reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { TagClient } from '@brainwave/shared'

export const useThoughtFilters = (tags: () => TagClient[]) => {
  const route = useRoute()
  const router = useRouter()

  const search = ref('')
  const selectedStatus = ref<{ name: string; value: string } | null>(null)
  const tag = ref<TagClient | null>(null)

  const pagination = reactive({
    currentPage: 1,
    orderBy: 'lastFollowUp',
    orderDesc: false,
  })

  const hydrateFromQuery = () => {
    search.value = (route.query.search as string) || ''

    const status = route.query.status as string
    if (status && selectedStatus.value) {
      selectedStatus.value.value = status
    }

    const tagId = route.query.tagId as string
    if (tagId) {
      tag.value = tags().find((t) => String(t.tagId) === tagId) || null
    }

    pagination.currentPage = route.query.page ? Number(route.query.page) : 1
    pagination.orderBy = (route.query.orderBy as string) || 'lastFollowUp'
    pagination.orderDesc = route.query.orderDesc === 'true'
  }

  const updateQuery = () => {
    router.replace({
      query: {
        search: search.value || undefined,
        status: selectedStatus.value?.value,
        tagId: tag.value?.tagId || undefined,
        page: pagination.currentPage !== 1 ? pagination.currentPage : undefined,
        orderBy: pagination.orderBy !== 'lastFollowUp' ? pagination.orderBy : undefined,
        orderDesc: pagination.orderDesc ? 'true' : undefined,
      },
    })
  }

  watch(
    () => route.query,
    () => {
      hydrateFromQuery()
    }
  )

  return {
    search,
    selectedStatus,
    tag,
    pagination,
    hydrateFromQuery,
    updateQuery,
  }
}
