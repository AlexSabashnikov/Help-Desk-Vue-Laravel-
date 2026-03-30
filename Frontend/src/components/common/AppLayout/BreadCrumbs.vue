<!-- 
    Навигационная цепочка (хлебные крошки)
    Динамически генерируется на основе текущего маршрута
    Поддерживает все роли пользователей
-->

<template>
  <nav class="breadcrumbs" v-if="breadcrumbs.length > 0">
    <template v-for="(crumb, index) in breadcrumbs" :key="index">
      <RouterLink 
        v-if="index < breadcrumbs.length - 1 && crumb.path" 
        :to="crumb.path" 
        class="breadcrumb-item"
      >
        {{ crumb.name }}
      </RouterLink>
      <span v-else class="breadcrumb-item active">
        {{ crumb.name }}
      </span>
      <span v-if="index < breadcrumbs.length - 1" class="separator">/</span>
    </template>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// Маппинг путей к названиям для хлебных крошек
const routeNames = {
  // Admin routes
  '/admin/tickets': 'Заявки',
  '/admin/tickets/create': 'Создание заявки',
  '/admin/directories/companies': 'Организации',
  '/admin/directories/users': 'Пользователи',
  '/admin/analytics/general': 'Общая аналитика',
  '/admin/analytics/reports': 'Отчеты',
  
  // Dispatcher routes
  '/dispatcher/tickets': 'Заявки',
  '/dispatcher/tickets/create': 'Создание заявки',
  '/dispatcher/directories/companies': 'Организации',
  '/dispatcher/directories/users': 'Пользователи',
  '/dispatcher/analytics/general': 'Общая аналитика',
  '/dispatcher/analytics/reports': 'Отчеты',
  
  // Engineer routes
  '/engineer/tickets': 'Мои заявки',
  '/engineer/calendar': 'Календарь работ',
  '/engineer/analytics/general': 'Общая аналитика',
  '/engineer/analytics/reports': 'Отчеты',
  
  // Client routes
  '/client/tickets': 'Мои заявки',
  '/client/tickets/create': 'Создание заявки',
  '/client/analytics/general': 'Общая аналитика',
  '/client/analytics/reports': 'Отчеты',
}

// Функция для получения названий секций
const getSectionName = (path) => {
  const section = path.split('/')[2] // tickets, directories, analytics, calendar
  
  const sectionNames = {
    tickets: 'Заявки',
    directories: 'Справочники',
    analytics: 'Аналитика',
    calendar: 'Расписание'
  }
  
  return sectionNames[section] || ''
}

// Генерируем хлебные крошки на основе текущего пути
const breadcrumbs = computed(() => {
  const crumbs = []
  const path = route.path
  const parts = path.split('/').filter(p => p)
  
  if (parts.length >= 2) {
    const role = parts[0]
    const section = parts[1]
    
    // Добавляем название раздела
    if (section) {
      const sectionName = getSectionName(path)
      if (sectionName) {
        crumbs.push({
          name: sectionName,
          path: `/${role}/${section}`
        })
      }
    }
    
    // Добавляем название текущей страницы
    if (routeNames[path]) {
      crumbs.push({
        name: routeNames[path],
        path: path
      })
    } else if (parts.length >= 3) {
      // Для карточки заявки с ID
      if (parts[2] === 'tickets' && parts[3] && !isNaN(parts[3])) {
        crumbs.push({
          name: `Заявка №${parts[3]}`,
          path: path
        })
      }
    }
  }
  
  return crumbs
})
</script>

<style scoped>
.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.breadcrumb-item {
  color: #98a3ad;
  text-decoration: none;
  transition: color 0.2s;
}

.breadcrumb-item:hover:not(.active) {
  color: #16bd00;
}

.breadcrumb-item.active {
  color: #7799d5;
  font-weight: 500;
}

.separator {
  color: #adb5bd;
}
</style>