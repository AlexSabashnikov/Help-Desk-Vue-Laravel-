/**
 * Главный роутер приложения Help Desk
 * Объединяет маршруты всех ролей: admin, engineer, client
 * Навигационная охрана - проверка авторизации и ролей
 */

import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import { getUserRole } from '@/utils/auth.utils'

// Импортируем маршруты из разных файлов
import authRoutes from './auth.routes.js'
import adminRoutes from './admin.routes.js'
import dispatcherRoutes from './dispatcher.routes.js'
import engineerRoutes from './engineer.routes.js'
import clientRoutes from './client.routes.js'

// Объединяем все маршруты
const routes = [

  // Главный редирект
  {
    path: '/',
    redirect: '/auth/login'
  },
  // Публичные маршруты (авторизация)
  ...authRoutes,
  
  // Защищенные маршруты по ролям
  ...dispatcherRoutes,
  ...adminRoutes,

  ...engineerRoutes,
  ...clientRoutes,
  
  
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/errors/NotFound.vue'),
    meta: { title: 'Страница не найдена' }
  }
]

// Создаем роутер
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

function reductionPath(){
  return localStorage.getItem('currentPath')
}


const pinia = createPinia()

// Глобальный навигационный guard
router.beforeEach(async (to, from, next) => {
  console.log(`🔄 Navigation: ${from.path} -> ${to.path}`)

  // Сохраняем to.path в localStorage
  const skipPaths = ['login', 'forgot-password', 'unauthorized', 'not-found']
  
  if (!skipPaths.includes(to.name)) {
    // Сохраняем только значимые пути
    localStorage.setItem('currentPath', to.fullPath)
  }
  
  // Устанавливаем заголовок страницы
  if (to.meta.title) {
    document.title = `${to.meta.title}`
  }

  // Получаем auth store
  const { useAuthStore } = await import('@/stores/auth.store')
  const authStore = useAuthStore(pinia)
  
  // Инициализируем store
  await authStore.initialize()
  
  // Определяем публичные маршруты (не требующие авторизации)
  const publicRoutes = ['login', 'forgot-password', 'unauthorized']
  // Проверяем состояние авторизации в localStorage напрямую
  const savedUser = localStorage.getItem('user')
  
  // Синхронизируем состояние store с localStorage
  if (!savedUser && authStore.isAuthenticated) {
    console.log('⚠️ LocalStorage пуст, но store считает пользователя авторизованным - синхронизируем')
    await authStore.clearAuthData()
  }

  // Если маршрут публичный
  if (publicRoutes.includes(to.name)) {
    // Если пользователь уже авторизован и пытается зайти на логин
    if (to.name === 'login' && authStore.isAuthenticated) {
      console.log("path: ", reductionPath())
      if(reductionPath()){
        return next(reductionPath())
      }
      console.log('✅ User already authenticated, redirecting based on role...')
      // Редирект по роли
      const userRole = getUserRole()
      console.log("Роль перед редиректом ", userRole)
      switch (userRole) {
        case 'admin':
          return next({ name: 'admin-tickets' })
        case 'dispatcher':
          return next({ name: 'dispatcher-tickets' })
        case 'engineer':
          return next({ name: 'engineer-tickets' })
        case 'client':
          return next({ name: 'client-tickets' })
        default:
          // Если роль не определена, сбрасываем авторизацию
          authStore.clearAuthData()
          return next()
      }
    }
    return next()
  }
  
  // Если маршрут требует авторизации
  if (to.meta.requiresAuth) {
    console.log('🔐 Маршрут требует авторизации, проверка...')
    
    // Проверяем оба источника: localStorage и store
    const hasLocalStorageUser = !!savedUser
    const hasStoreUser = authStore.isAuthenticated
    
    console.log('hasLocalStorageUser:', hasLocalStorageUser, 'hasStoreUser:', hasStoreUser)
    
    // Если нет пользователя в localStorage - сразу на логин
    if (!hasLocalStorageUser) {
      console.log('❌ Нет данных в localStorage, редирект на логин')
      if (hasStoreUser) {
        // Если store считает что пользователь есть, а localStorage пуст - очищаем
        authStore.user = null
      }
      return next({ name: 'login' })
    }
    
    // Если есть пользователь в localStorage, но store не инициализирован
    if (hasLocalStorageUser && !hasStoreUser) {
      console.log('⚠️ Восстанавливаем данные из localStorage в store')
      try {
        const userData = JSON.parse(savedUser)
        authStore.user = userData
      } catch (error) {
        console.error('❌ Error parsing user data:', error)
        await authStore.clearAuthData()
        return next({ name: 'login' })
      }
    }
    
    // Теперь оба источника должны быть синхронизированы
    console.log('✅ Аутентифицирован, проверка роли...')
    
    const requiredRole = to.meta.role
    let userRole = getUserRole()
    
    if (requiredRole) {
      console.log(userRole, "  ", requiredRole)
      if (userRole !== requiredRole) {
        console.log(`🚫 Пользователь не имеет прав, редирект на unauthorized`)
        return next({ name: 'unauthorized' })
      }
    }

    console.log('✅ Проверка роли прошла успешно')
  }
  next()
})

export default router