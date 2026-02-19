<template>
  <div class="header">
    <img src="/brainwave.png" class="logo" alt="Brainwave logo" />
    <span class="title">Brainwave</span>
  </div>
  <div class="main">
    <router-view />
  </div>
  <div class="footer">
    <p>&copy; 2026 David Shurgold. All rights reserved.</p>
  </div>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.main {
  flex: 1;
}

.footer {
  text-align: center;
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
