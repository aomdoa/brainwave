/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import LoginPage from '../components/Login.vue'
import DashboardPage from '../components/Dashboard.vue'
import RegisterPage from '../components/Register.vue'
import ErrorPage from '../components/Error.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginPage },
  { path: '/register', component: RegisterPage },
  { path: '/error', component: ErrorPage },
  {
    path: '/dashboard',
    component: DashboardPage,
    meta: { requiresAuth: true },
  },
]

export const router = createRouter({
  history: createWebHistory('/brainwave/'),
  routes,
})

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/dashboard')
  } else {
    next()
  }
})
