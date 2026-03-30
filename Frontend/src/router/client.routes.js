/**
 * Маршруты клиентского портала
 * Доступны только пользователям с ролью 'client'
 * Упрощённый интерфейс: Мои заявки, Создать заявку, Аналитика
 * Видит только заявки своего офиса или компании (если главное контактное лицо)
 */

const clientRoutes = [
  
  {
    path: '/client/tickets',
    name: 'client-tickets',
    component: () => import('@/views/client/tickets/MyTickets.vue'),
    meta: {
      title: 'Мои заявки',
      requiresAuth: true,
      role: 'client',
    },
  },
  {
    path: '/client/tickets/create',
    name: 'client-create-tickets',
    component: () => import('@/views/client/tickets/CreateTicket.vue'),
    meta: {
      title: 'Создание заявки',
      requiresAuth: true,
      role: 'client',
    },
  },
  {
    path: '/client/tickets/:id',
    name: 'client-ticket-card',
    component: () => import('@/views/client/tickets/TicketCard.vue'),
    meta: {
      title: 'Карточка заявки',
      requiresAuth: true,
      role: 'client',
    },
  },
  {
    path: '/client/analytics/general',
    name: 'client-analytics',
    component: () => import('@/views/client/analytics/GeneralAnalytics.vue'),
    meta: {
      title: 'Общая аналитика',
      requiresAuth: true,
      role: 'client',
    },
  },
  {
    path: '/client/analytics/reports',
    name: 'client-analytics-reports',
    component: () => import('@/views/client/analytics/ClientReports.vue'),
    meta: {
      title: 'Отчеты для клиента',
      requiresAuth: true,
      role: 'client',
    },
  },
  {
    path: '/client',
    redirect: '/client/tickets',
  },
]

export default clientRoutes