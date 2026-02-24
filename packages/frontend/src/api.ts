/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import axios from 'axios'
import config from './utils/config'
import { router } from './router'
import type { RegisterConfig, RegisterInput } from '@brainwave/shared'

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

// Perform the login request, store the token, and return the user info
export async function login(email: string, password: string): Promise<User> {
  const response = await api.post('/auth/login', { email, password })
  const data = response.data as { token: string }
  if (!data.token) {
    throw new Error('Login failed: missing token in response')
  }
  localStorage.setItem('token', data.token)
  return me()
}

// Get our user info
export async function me(): Promise<User> {
  const response = await api.get('/auth/me')
  return response.data as User
}

// Get the authentication config
export async function getAuthConfig(): Promise<RegisterConfig> {
  const response = await api.get('/auth/config')
  return response.data as RegisterConfig
}

// Register the new user
export async function registerUser(registration: RegisterInput): Promise<User> {
  const response = await api.post('/auth/register', registration)
  if (response.statusText !== 'OK') {
    throw new Error(`Failed to register user: ${response.statusText}`)
  }
  return response.data as User
}

export default api
