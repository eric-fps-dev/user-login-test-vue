<template>
  <router-view />
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { gotoCognitoLogin } from '@/utils/cognito'

function handleStorageEvent(e) {
  if (e.key === 'cognito-logout') {
    gotoCognitoLogin()
  }
}

onMounted(() => {
  window.addEventListener('storage', handleStorageEvent)
})

onUnmounted(() => {
  window.removeEventListener('storage', handleStorageEvent)
})

</script>

<style>
html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
}
</style>