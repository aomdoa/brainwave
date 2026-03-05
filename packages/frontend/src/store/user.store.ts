/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { ref } from 'vue'
import { login as serviceLogin } from '../api'

export interface User {
  id: number
  name: string
  email: string
  createdAt?: string
}

export const currentUser = ref<User | null>(null)

export async function login(email: string, password: string) {
  const user = await serviceLogin(email, password)
  currentUser.value = user
}

export function logout() {
  localStorage.removeItem('token')
  currentUser.value = null
}

export function isAuthenticated(): boolean {
  const token = localStorage.getItem('token')
  return token == null ? false : true
}
