/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { ref } from 'vue'
import { me, login as serviceLogin, updateToken } from '../api'
import { isSubscribed } from '../utils/features'

export interface User {
  id: number
  name: string
  email: string
  createdAt?: string
  isSubscribed: boolean
}

export const currentUser = ref<User | null>(null)

export async function login(email: string, password: string) {
  const user = await serviceLogin(email, password)
  user.isSubscribed = await isSubscribed()
  currentUser.value = user
}

export async function oauthLogin(token: string) {
  const user = await updateToken(token)
  user.isSubscribed = await isSubscribed()
  currentUser.value = user
}

export function logout() {
  localStorage.removeItem('token')
  currentUser.value = null
}

export function isAuthenticated(): boolean {
  const token = localStorage.getItem('token')
  if (token) {
    if (currentUser.value == null) {
      me().then(async (data) => {
        data.isSubscribed = await isSubscribed()
        currentUser.value = data
      })
    }
    return true
  }
  return false
}
