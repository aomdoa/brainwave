/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import axios from 'axios'
import config from './utils/config'

export interface User {
  id: number
  name: string
  email: string
  createdAt?: string
}

const api = axios.create({ baseURL: config.VITE_API_URL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

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
