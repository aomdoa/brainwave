/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import axios, { AxiosError, type AxiosResponse } from 'axios'
import config from './utils/config'
import { router } from './router'
import type {
  SearchClientSchema,
  SearchLinks,
  SearchPage,
  TagClient,
  ThoughtClient,
  ThoughtClientCreate,
  ThoughtClientUpdate,
  ThoughtConfig,
  ThoughtHistoryClient,
  ThoughtSearchParams,
  ThoughtSearchResults,
  ThoughtSimplifiedRelation,
  ThoughtStatus,
  UserClientCreate,
  UserConfig,
} from '@brainwave/shared'
import type { User } from './store/user.store'

const api = axios.create({ baseURL: config.VITE_API_URL })

// If we're authenticated add the token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// If we got a 401 or 403 response, remove the token and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const token = localStorage.getItem('token')
    if (token != null) {
      const status = error.response?.status
      if (status === 401 || status === 403 || status === 404) {
        localStorage.removeItem('token')
        return router.push('/login')
      }
    }
    return Promise.reject(error)
  }
)

// Build the search
export function buildSearchQuery(params: SearchClientSchema): URLSearchParams {
  const query = new URLSearchParams()
  if (params.page !== undefined) {
    query.set('page', String(params.page))
  }

  if (params.size !== undefined) {
    query.set('size', String(params.size))
  }

  if (params.orderBy) {
    query.set('orderBy', `${params.orderBy.field}:${params.orderBy.direction ?? 'desc'}`)
  }

  if (params.search) {
    query.set('search', params.search)
  }

  if (params.filter && params.filter?.length > 0) {
    const filter = params.filter
    query.set(
      'filter',
      filter
        .map((f, i) => `${f.field} ${f.operator} ${f.value}${i < filter.length - 1 ? ` ${f.operator ?? 'and'} ` : ''}`)
        .join('')
    )
  }

  return query
}

// Perform the login request, store the token, and return the user info
export async function login(email: string, password: string): Promise<User> {
  try {
    const response = await api.post<{ token: string }>('/user/login', { email, password })
    return updateToken(response.data.token)
  } catch (err) {
    const error = err as AxiosError
    if (error.status === 403) {
      throw new Error('need confirmation')
    } else {
      throw new Error('invalid')
    }
  }
}

export async function updateToken(token: string): Promise<User> {
  localStorage.setItem('token', token)
  return me()
}

// Get our user info
export async function me(): Promise<User> {
  const response = await api.get('/user/me')
  return response.data as User
}

// Get the authentication config
export async function getAuthConfig(): Promise<UserConfig> {
  const response = await api.get('/user/config')
  return response.data as UserConfig
}

// Register the new user
export async function registerUser(registration: UserClientCreate): Promise<User> {
  const response = await api.post('/user/register', registration)
  if (response.statusText !== 'OK') {
    throw new Error(`Failed to register user: ${response.data}`)
  }
  return response.data as User
}

// Fetch our thoughts
export async function getThoughts(
  searchParams: ThoughtSearchParams
): Promise<{ thoughts: ThoughtClient[]; page: SearchPage; links: SearchLinks }> {
  const query = buildSearchQuery(searchParams as SearchClientSchema)
  if (searchParams.tagId != null && searchParams.tagId.length > 0) {
    query.set('tagId', searchParams.tagId.join(','))
  }

  const response = await api.get<ThoughtSearchResults>(`/thoughts?${query}`)
  if (response.statusText !== 'OK') {
    throw new Error(`Failed to retrieve thoughts with '${query}': ${response.statusText}`)
  }
  return {
    thoughts: response.data.data,
    page: response.data.page,
    links: response.data.links,
  }
}

export async function getThoughtById(thoughtId: number): Promise<ThoughtClient> {
  const response = await api.get<ThoughtClient>(`thoughts/${thoughtId}`)
  if (response.statusText !== 'OK') {
    throw new Error(`Failed to retrieve thought ${thoughtId}: ${response.data}`)
  }
  return response.data
}

export async function saveThought(thought: ThoughtClientCreate | ThoughtClientUpdate): Promise<ThoughtClient> {
  let response: AxiosResponse<ThoughtClient>
  const updateThought = thought as ThoughtClientUpdate
  if (updateThought.thoughtId != null) {
    response = await api.patch<ThoughtClient>(`thoughts/${updateThought.thoughtId}`, updateThought)
  } else {
    response = await api.post<ThoughtClient>('thoughts/', thought as ThoughtClientCreate)
  }
  if (response.statusText !== 'OK') {
    throw new Error(`Failed saving thought: ${response.data}`)
  }
  return response.data
}

export async function setThoughtStatus(thoughtId: number, status: ThoughtStatus): Promise<ThoughtClient> {
  const response = await api.patch<ThoughtClient>(`thoughts/${thoughtId}`, { status })
  if (response.statusText !== 'OK') {
    throw new Error(`Failed to update thought ${thoughtId} to status ${status}: ${response.data}`)
  }
  return response.data
}

export async function getThoughtConfig(): Promise<ThoughtConfig> {
  const response = await api.get<ThoughtConfig>('/thoughts/config')
  if (response.statusText !== 'OK') {
    throw new Error(`Failed to get the thought config: ${response.data}`)
  }
  return response.data
}

export async function getTags(): Promise<TagClient[]> {
  const response = await api.get<TagClient[]>('/tags')
  if (!response || response.statusText !== 'OK') {
    throw new Error(`Failed to get the tags: ${response.data}`)
  }
  return response.data
}

export async function saveTag(name: string): Promise<TagClient> {
  const response = await api.post<TagClient>('/tags', { name })
  if (response.statusText !== 'OK') {
    throw new Error(`Failed to create tag with anem ${name}: ${response.data}`)
  }
  return response.data
}

export async function saveThoughtTags(thoughtId: number, tagIds: number[]): Promise<ThoughtClient> {
  const response = await api.post<ThoughtClient>(`/thoughts/${thoughtId}/tags`, tagIds)
  if (response.statusText !== 'OK') {
    throw new Error(`Failed to allocated tags ${tagIds} to thought ${thoughtId}: ${response.data}`)
  }
  return response.data
}

export async function getThoughtRelations(thoughtId: number): Promise<ThoughtSimplifiedRelation[]> {
  const response = await api.get<ThoughtSimplifiedRelation[]>(`thoughts/${thoughtId}/relations`)
  if (response.statusText !== 'OK') {
    throw new Error(`Failed to get the relations for ${thoughtId}: ${response.data}`)
  }
  return response.data
}

export async function saveThoughtRelations(
  thoughtId: number,
  relatedThoughtIds: number[]
): Promise<ThoughtSimplifiedRelation[]> {
  const response = await api.post<ThoughtSimplifiedRelation[]>(`thoughts/${thoughtId}/relations`, relatedThoughtIds)
  if (response.statusText !== 'OK') {
    throw new Error(`Failed to set the relations for ${thoughtId}: ${response.data}`)
  }
  return response.data
}

export async function getThoughtHistory(thoughtId: number): Promise<ThoughtHistoryClient[]> {
  const response = await api.get<ThoughtHistoryClient[]>(`thoughts/${thoughtId}/history`)
  if (response.statusText !== 'OK') {
    throw new Error(`Failed to get thought history for ${thoughtId}: ${response.data}`)
  }
  return response.data
}

export async function subscribeEvents(sub: any): Promise<void> {
  const response = await api.post(`push/subscribe`, sub)
  if (response.statusText !== 'Created') {
    throw new Error(`Failed to subscribe to events: ${response.data}`)
  }
}

export async function confirmAccount(email: string, token: string): Promise<boolean> {
  const response = await api.get(`user/getConfirmation?email=${email}&token=${token}`)
  if (response.statusText !== 'OK') {
    throw new Error(`Unable to confirm account: ${response.data}`)
  }
  console.dir(response.data)
  return true
}

// Report error
export async function reportError(err: Error, instance: any, info: String) {
  if (err == null) return
  const error = {
    message: err.message,
    stack: err.stack,
    component: instance?.$options.name,
    info,
  }
  try {
    await api.post('/health/error', error)
  } catch (err) {
    // likely service is down
    const error = err as Error
    console.error(error.message)
  }
}
