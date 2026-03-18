/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import LoginPage from '../components/Login.vue'
import DashboardPage from '../components/Dashboard.vue'
import RegisterPage from '../components/Register.vue'
import ErrorPage from '../components/Error.vue'
import Thought from '../components/Thought.vue'
import Confirm from '../components/Confirm.vue'
import User from '../components/User.vue'
import { isAuthenticated } from '../store/user.store'

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginPage },
  { path: '/register', component: RegisterPage },
  { path: '/error', component: ErrorPage },
  { path: '/confirm', component: Confirm },
  {
    path: '/dashboard',
    component: DashboardPage,
    meta: { requiresAuth: true },
  },
  { path: '/thoughts/:thoughtId?', component: Thought, meta: { requiresAuth: true } },
  { path: '/user', component: User, meta: { requiresAuth: true } },
]

export const router = createRouter({
  history: createWebHistory('/'),
  routes,
})

router.beforeEach((to, _from, next) => {
  const isAuth = isAuthenticated()
  if (to.meta.requiresAuth && !isAuth) {
    next('/login')
  } else if (to.path === '/login' && isAuth) {
    next('/dashboard')
  } else {
    next()
  }
})
