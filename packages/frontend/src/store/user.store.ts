/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { ref } from 'vue'
import { me, refreshToken, login as serviceLogin, updateToken } from '../api'
import { isSubscribed } from '../utils/features'
import type { UserClient } from '@brainwave/shared'

export interface User extends UserClient {
  isSubscribed: boolean
  refreshTokenAt: number
}

export const currentUser = ref<User | null>(null)

export async function login(email: string, password: string) {
  console.log('login')
  const user = await serviceLogin(email, password)
  user.isSubscribed = await isSubscribed()
  user.refreshTokenAt = localStorage.getItem('refreshTokenAt') ? Number(localStorage.getItem('refreshTokenAt')) : 0
  currentUser.value = user
}

export async function oauthLogin(token: string) {
  const user = await updateToken(token)
  user.isSubscribed = await isSubscribed()
  user.refreshTokenAt = localStorage.getItem('refreshTokenAt') ? Number(localStorage.getItem('refreshTokenAt')) : 0
  currentUser.value = user
}

export function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('refreshTokenAt')
  currentUser.value = null
}

export async function loadCurrentUser(force = false) {
  console.log('loadCurrentUser')
  if (!isAuthenticated()) return null

  if (!currentUser.value || force) {
    const data = await me()
    data.isSubscribed = await isSubscribed()
    data.refreshTokenAt = localStorage.getItem('refreshTokenAt') ? Number(localStorage.getItem('refreshTokenAt')) : 0
    currentUser.value = data
  }

  return currentUser.value
}

export function isAuthenticated(): boolean {
  const token = localStorage.getItem('token')
  if (token) {
    const refreshTime = localStorage.getItem('refreshTokenAt')
    if (refreshTime && Date.now() >= Number(refreshTime) * 1000) {
      void refreshToken()
    }
    return true
  } else {
    return false
  }
}
