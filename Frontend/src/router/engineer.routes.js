/**
 * Маршруты панели инженера
 * Доступны только пользователям с ролью 'engineer'
 * Разделы: Мои заявки, Календарь работ, Профиль
 */

const engineerRoutes = [
  
  {
    path: '/engineer/tickets',
    name: 'engineer-tickets',
    component: () => import('@/views/engineer/MyTickets.vue'),
    meta: {
      title: 'Мои заявки',
      requiresAuth: true,
      role: 'engineer',
    },
  },
  {
    path: '/engineer/tickets/:id',
    name: 'engineer-ticket-card',
    component: () => import('@/views/engineer/TicketCard.vue'),
    meta: {
      title: 'Карточка заявки',
      requiresAuth: true,
      role: 'engineer',
    },
  },
  {
    path: '/engineer/calendar',
    name: 'engineer-calendar',
    component: () => import('@/views/engineer/WorkCalendar.vue'),
    meta: {
      title: 'Календарь работ',
      requiresAuth: true,
      role: 'engineer',
    },
  },
  {
    path: '/engineer',
    redirect: '/engineer/tickets',
  },
]

export default engineerRoutes