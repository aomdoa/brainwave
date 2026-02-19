/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import axios from 'axios'
import config from './utils/config'
import { router } from './router'

export interface User {
  id: number
  name: string
  email: string
  createdAt?: string
}

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
    const status = error.response?.status
    if (status === 401 || status === 403) {
      localStorage.removeItem('token')
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

export async function login(email: string, password: string): Promise<User> {
  const response = await api.post('/login', { email, password })
  const data = response.data as { token: string }
  if (!data.token) {
    throw new Error('Login failed: missing token in response')
  }
  localStorage.setItem('token', data.token)
  return me()
}

export async function me(): Promise<User> {
  const response = await api.get('/me')
  return response.data.user as User
}

export default api
