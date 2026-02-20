<script setup lang="ts">
/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { buildInfo } from './build-info'
</script>
<template>
  <div class="header">
    <img src="/brainwave.png" class="logo" alt="Brainwave logo" />
    <a href="/" class="title">Brainwave</a>
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
.header {
  margin-top: 1rem;
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
