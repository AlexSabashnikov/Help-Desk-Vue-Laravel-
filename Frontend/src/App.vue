<template>
  <SessionNotifications />

  <div v-if="isAppReady">
  <!-- Используем разные лейауты в зависимости от маршрута -->
    <AuthLayout v-if="isAuthRoute">
      <RouterView />
    </AuthLayout>
    
    <MainLayout v-else>
      <RouterView />
    </MainLayout>
  </div>

  <!-- Слот для состояния загрузки -->
  <div v-if="!isAppReady" class="custom-loading">
    <div class="spinner"></div>
    <span>Загрузка...</span>
  </div>
</template>

<script setup>
import { computed, watch, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SessionNotifications from '@/components/notifications/SessionNotifications.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import AuthLayout from './layouts/AuthLayout.vue'

const route = useRoute() // Чтение маршрутов
const router = useRouter() // Управление маршрутизацией
const isAppReady = ref(false) // Флаг готовности приложения

const isAuthRoute = computed(() => {
  const authPaths = [
    '/auth/login',
    '/auth/forgot',
    '/unauthorized'
  ]

  return authPaths.includes(route.path)
})

router.isReady().then(() => {
  // Когда приложение готово загрузиться AuthLayout или MainLayout
  isAppReady.value = true
  console.log('✅ Router ready, current route:', route.path)
})

// Для отладки
watch(isAuthRoute, (newValue) => {
  console.log('🔍 App.vue: isAuthRoute changed to', newValue)
  console.log('📊 Current route:', {
    name: route.name,
    path: route.path,
    meta: route.meta,
    fullPath: route.fullPath
  })
}, { immediate: true })

onMounted(() => {
  console.log('App mounted')
  console.log('Initial route check:', {
    name: route.name,
    path: route.path,
    meta: route.meta,
    isAuthRoute: isAuthRoute.value
  })
})
</script>

<style>
/* Импорт глобальных стилей */
@import '@/assets/styles/main.css';
</style>