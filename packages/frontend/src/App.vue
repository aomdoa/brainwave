<template>
  <div>
    <img src="/brainwave.png" class="logo" alt="Brainwave logo" />
    <span class="title">Brainwave</span>
  </div>
  <router-view />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
.title {
  font-size: 2em;
  font-weight: bold;
  color: #646cff;
}
</style>
