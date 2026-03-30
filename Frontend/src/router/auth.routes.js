/**
 * Маршруты авторизации
 * Доступны без аутентификации
 * Перенаправление на главную при успешной авторизации
 */

const authRoutes = [
  {
    path: '/auth/login',
    name: 'login',
    component: () => import('@/views/auth/LoginPage.vue'),
    meta: { title: 'Вход', public: true, layout: 'auth' },
  },
  {
    path: '/auth/forgot',
    name: 'forgot-password',
    component: () => import('@/views/auth/ForgotPassword.vue'),
    meta: { title: 'Восстановление пароля', public: true, layout: 'auth' },
  },
  {
    path: '/unauthorized',
    name: 'unauthorized',
    component: () => import('@/views/auth/UnauthorizedPage.vue'),
    meta: { title: 'Доступ запрещен', public: true, layout: 'auth' },
  }
]

export default authRoutes