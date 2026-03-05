<script setup lang="ts">
/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { buildInfo } from './build-info'
import PrimevuePreload from './components/PrimevuePreload.vue'
import { router } from './router'
import { logout, currentUser } from './store/user.store'

const logoutUser = () => {
  logout()
  return router.push('/login')
}
</script>
<template>
  <PrimevuePreload />
  <div class="header">
    <div>
      <img src="/brainwave.png" class="logo" alt="Brainwave logo" />
      <a href="/" class="title">Brainwave</a>
    </div>
    <div><a v-if="currentUser" v-on:click="logoutUser" class="logout">Logout</a></div>
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
