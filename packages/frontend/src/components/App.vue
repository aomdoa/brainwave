<script setup lang="ts">
/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { buildInfo } from '../build-info'
import PrimevuePreload from './PrimevuePreload.vue'
import { router } from '../router'
import { logout } from '../store/user.store'
import { requestNotificationPermission, setupPwa } from '../utils/features'
import { currentUser } from '../store/user.store'
import { computed, watchEffect } from 'vue'

const loggedIn = computed(() => !!currentUser.value)
const subscribed = computed(() => currentUser.value?.isSubscribed)

const logoutUser = () => {
  logout()
  return router.push('/login')
}

const subscribe = () => {
  requestNotificationPermission()
}

watchEffect(() => {
  if (loggedIn.value && subscribed.value) {
    setupPwa()
  }
})
</script>
<template>
  <PrimevuePreload />
  <div class="header">
    <div>
      <img src="/brainwave.png" class="logo" alt="Brainwave logo" />
      <a href="/" class="title">Brainwave</a>
    </div>
    <div v-if="loggedIn">
      <a v-if="!subscribed" v-on:click="subscribe" class="subscribe">Subscribe</a>
      <router-link to="/user" class="user">Me</router-link>
      <a v-on:click="logoutUser" class="logout">Logout</a>
    </div>
  </div>
  <div class="main">
    <router-view />
  </div>
  <div class="footer">
    <p class="copyright">&copy; 2026 David Shurgold. All rights reserved.</p>
    <p class="buildInfo">{{ buildInfo.version }} - {{ buildInfo.buildTime }} - {{ buildInfo.gitSha }}</p>
  </div>
</template>

<style scoped>
.user,
.subscribe {
  padding-right: 2rem;
}

.subscribe,
.user,
.logout {
  cursor: pointer;
  font-size: smaller;
}

.header {
  margin-top: 1rem;
  display: flex;
  justify-content: space-between;
}

.header > div:first-child {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.main {
  flex: 0.95;
}

.footer {
  text-align: center;
}

.copyright {
  font-size: 0.875rem;
  margin: 0;
}

.buildInfo {
  font-size: 0.5rem;
  color: #888;
  margin: 0;
}

.logo {
  height: 4rem;
}

.title {
  font-size: 2rem;
  font-weight: bold;
  color: #646cff;
}
</style>
