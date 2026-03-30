/**
 * Утилиты для работы с заявками
 */

// Константы для статусов
export const STATUS_LABELS = {
  new: 'Новая',
  inProgress: 'В работе',
  completed: 'Выполнена',
  stopped: 'Работа остановлена',
  onSite: 'Выехал на объект',
  assigned: 'Назначена',
  waitingPayment: 'Ждет оплаты',
  rejected: 'Отказ заказчика'
}

// Константы для приоритетов
export const PRIORITY_LABELS = {
  crit: 'Критический',
  high: 'Высокий',
  medium: 'Средний',
  low: 'Низкий'
}

// Цвета для статусов
export const STATUS_COLORS = {
  new: { background: '#d0e2ff', color: '#0b2692', border: '#0b2692' },
  assigned: { background: '#d0f2ff', color: '#1caae2', border: '#1caae2' },
  onSite: { background:  '#ccffeb', color: '#1ec381', border: '#1ec381' },
  inProgress: { background: '#fffbbf', color: '#938900', border: '#938900' },
  stopped: { background: '#f2d0ff', color: '#8d00c5', border: '#8d00c5' },
  completed: { background: '#d2ffcc', color: '#16bd00', border: '#16bd00' },
  rejected: { background: '#ffcbcb', color: '#bd0000', border: '#bd0000' },
  waitingPayment: { background: '#ffd3ea', color: '#b91e6e', border: '#b91e6e' }
}

export const PRIORITY_COLORS = {
  crit: { background: '#ffcbcb', color: '#bd0000', border: '#bd0000' },
  high: { background: '#ffddcb', color: '#ea580c', border: '#ea580c' },
  medium: { background: '#fef3c7', color: '#d97706', border: '#d97706' },
  low: { background: '#d2ffcc', color: '#16bd00', border: '#16bd00' }
}

/**
 * Форматирует дату в строку вида "DD.MM.YYYY HH:MM"
 * @param {Date|string|number} dateInput - Входная дата
 * @returns {string} Отформатированная дата
 */
export const formatDate = (dateInput) => {
  if (!dateInput) return 'Не указан'

  try {
    // Если это уже отформатированная строка
    if (typeof dateInput === 'string' && dateInput.includes('.') && dateInput.includes(':')) {
      return dateInput
    }

    let date
    if (dateInput instanceof Date) {
      date = dateInput
    } else if (typeof dateInput === 'string') {
      const cleanDateStr = dateInput.trim().replace('Z', '')
      date = new Date(cleanDateStr)
      if (isNaN(date.getTime())) {
        date = new Date(dateInput)
      }
    } else if (typeof dateInput === 'number') {
      date = new Date(dateInput)
    } else {
      console.warn('Неизвестный формат даты:', dateInput)
      return 'Неизвестный формат'
    }

    if (isNaN(date.getTime())) {
      console.warn('Некорректная дата:', dateInput)
      return 'Некорректная дата'
    }

    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')

    return `${day}.${month}.${year} ${hours}:${minutes}`
  } catch (error) {
    console.error('Ошибка форматирования даты:', error, 'Входные данные:', dateInput)
    return 'Ошибка даты'
  }
}

/**
 * Проверяет, просрочен ли дедлайн
 * @param {Date|string} deadline - Дата дедлайна
 * @returns {boolean} true если просрочен
 */
export const isDeadlineOverdue = (deadline) => {
  if (!deadline || deadline === 'Не указан') return false

  try {
    let deadlineDate
    if (deadline instanceof Date) {
      deadlineDate = deadline
    } else if (typeof deadline === 'string') {
      const cleanDateStr = deadline.trim().replace('Z', '')
      deadlineDate = new Date(cleanDateStr)
      if (isNaN(deadlineDate.getTime())) {
        deadlineDate = new Date(deadline)
      }
    } else {
      return false
    }

    const now = new Date()
    return !isNaN(deadlineDate.getTime()) && deadlineDate < now
  } catch (error) {
    console.error('Ошибка проверки дедлайна:', error)
    return false
  }
}

/**
 * Проверяет валидность даты
 * @param {Date|string} date - Дата
 * @returns {boolean} true если просрочен
 */
export const isInvalidDate = (date) => {
  if (!date || date === 'Не указана') return false

  try {
    let deadlineDate
    if (date instanceof Date) {
      deadlineDate = date
    } else if (typeof date === 'string') {
      const cleanDateStr = date.trim().replace('Z', '')
      deadlineDate = new Date(cleanDateStr)
      if (isNaN(deadlineDate.getTime())) {
        deadlineDate = new Date(date)
      }
    } else {
      return false
    }

    const now = new Date()
    return !isNaN(deadlineDate.getTime()) && deadlineDate < now
  } catch (error) {
    console.error('Ошибка проверки дедлайна:', error)
    return false
  }
}

/**
 * Определяет, подходит ли заявка к сроку (20% оставшегося времени до дедлайна)
 * @param {Date|string} deadline - Дата дедлайна
 * @param {Date|string} createdAt - Дата создания
 * @returns {boolean} true если подходит к сроку
 */
export const isDeadlineApproaching = (deadline, createdAt) => {
  if (!deadline || deadline === 'Не указан') return false
  if (!createdAt) return false

  try {
    // Парсим даты
    let deadlineDate
    let createdAtDate
    
    // Парсим дедлайн
    if (deadline instanceof Date) {
      deadlineDate = deadline
    } else if (typeof deadline === 'string') {
      const cleanDateStr = deadline.trim().replace('Z', '')
      deadlineDate = new Date(cleanDateStr)
      if (isNaN(deadlineDate.getTime())) {
        deadlineDate = new Date(deadline)
      }
    } else {
      return false
    }
    
    // Парсим дату создания
    if (createdAt instanceof Date) {
      createdAtDate = createdAt
    } else if (typeof createdAt === 'string') {
      const cleanDateStr = createdAt.trim().replace('Z', '')
      createdAtDate = new Date(cleanDateStr)
      if (isNaN(createdAtDate.getTime())) {
        createdAtDate = new Date(createdAt)
      }
    } else {
      return false
    }
    
    // Проверяем валидность дат
    if (isNaN(deadlineDate.getTime()) || isNaN(createdAtDate.getTime())) {
      return false
    }
    
    // Если дедлайн уже наступил
    const now = new Date()
    if (deadlineDate <= now) {
      return false
    }
    
    // Вычисляем общее время на выполнение заявки
    const totalTimeMs = deadlineDate - createdAtDate
    
    // Если общее время некорректно (дедлайн раньше создания)
    if (totalTimeMs <= 0) {
      return false
    }
    
    // Вычисляем оставшееся время
    const remainingTimeMs = deadlineDate - now
    
    // Вычисляем процент оставшегося времени от общего
    const remainingPercentage = (remainingTimeMs / totalTimeMs) * 100
    
    // Считаем, что заявка подходит к сроку, если осталось 20% или меньше от общего времени
    return remainingPercentage <= 20 && remainingPercentage > 0
    
  } catch (error) {
    console.error('Ошибка проверки приближения дедлайна:', error)
    return false
  }
}

/**
 * Получает CSS класс для срока в зависимости от состояния
 * @param {Date|string} deadline - Дата дедлайна
 * @param {Date|string} createdAt - Дата создания (опционально для isDeadlineApproaching)
 * @returns {string} CSS класс
 */
export const getDeadlineClass = (deadline, createdAt = null) => {
  if (isDeadlineOverdue(deadline)) {
    return 'deadline-overdue'
  } else if (createdAt && isDeadlineApproaching(deadline, createdAt)) {
    return 'deadline-approaching'
  }
  return 'deadline-normal'
}

/**
 * Форматирует данные заявки для таблицы
 * @param {Array} tickets - Массив заявок
 * @returns {Array} Отформатированные заявки
 */
export const formatTicketsForTable = (tickets) => {
  return tickets.map((ticket) => {
    const formattedCreatedAt = formatDate(ticket.createdAt)
    const formattedDeadline = formatDate(ticket.deadline)
    const deadlineClass = getDeadlineClass(ticket.deadline, ticket.createdAt)

    return {
      ...ticket,
      originalDeadline: ticket.deadline,
      originalCreatedAt: ticket.createdAt,
      clientName: ticket.client?.name || 'Не указан',
      executorName: getTicketExecutorTableName(ticket.executor),
      createdAt: formattedCreatedAt,
      deadline: formattedDeadline,
      deadlineClass,
      statusDisplay: ticket.status
    }
  })
}

/**
 * Обрезает текст до указанной длины
 * @param {string} text - Исходный текст
 * @param {number} maxLength - Максимальная длина
 * @returns {string} Обрезанный текст
 */
export const truncateText = (text, maxLength) => {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

/**
 * Получает метку приоритета
 * @param {string} priority - Код приоритета
 * @returns {string} Метка приоритета
 */
export const getPriorityLabel = (priority) => {
  return PRIORITY_LABELS[priority] || priority
}

/**
 * Получает метку статуса
 * @param {string} status - Код статуса
 * @returns {string} Метка статуса
 */
export const getStatusLabel = (status) => {
  return STATUS_LABELS[status] || status
}

/**
 * Получает цвета для статуса
 * @param {string} status - Код статуса
 * @returns {Object} Объект с цветами
 */
export const getStatusColors = (status) => {
  return STATUS_COLORS[status] || { background: '#f3f4f6', color: '#6b7280', border: '#d1d5db' }
}

/**
 * Получает цвета для приоритета
 * @param {string} priority - Код приоритета
 * @returns {Object} Объект с цветами
 */
export const getPriorityColors = (priority) => {
  return PRIORITY_COLORS[priority] || { background: null, color: null, border: null }
}

/**
 * Получает цвета для дедлайна в зависимости от его статуса
 * @param {string|Date} deadline - Дата дедлайна
 * @param {string|Date} createdAt - Дата создания заявки (опционально)
 * @returns {Object} Объект с цветом текста и флагами
 */
export const getDeadlineColors = (deadline, createdAt = null) => {
  if (isDeadlineOverdue(deadline)) {
    return { color: '#dc2626', isOverdue: true, isApproaching: false }
  }
  
  if (createdAt && isDeadlineApproaching(deadline, createdAt)) {
    return { color: '#d97706', isOverdue: false, isApproaching: true }
  }
  
  return { color: '#141414', isOverdue: false, isApproaching: false }
}

/**
 * Определяет, является ли пользователь администратором
 * @param {string} userRole - Роль пользователя
 * @returns {boolean}
 */
export const isAdminUser = (userRole) => {
  const adminRoles = ['admin', 'administrator', 'supervisor', 'manager']
  return adminRoles.includes(userRole?.toLowerCase())
}

/**
 * Определяет, является ли пользователь клиентом
 * @param {string} userRole - Роль пользователя
 * @returns {boolean}
 */
export const isClientUser = (userRole) => {
  const clientRoles = ['client', 'customer', 'user']
  return clientRoles.includes(userRole?.toLowerCase())
}

/**
 * Получает начальные данные для новой заявки
 * @param {string} userRole - Роль пользователя
 * @returns {Object} Начальные данные заявки
 */
export const getInitialTicketData = (userRole) => {
  const isClient = isClientUser(userRole)
  
  const baseData = {
    id: null,
    number: '',
    subject: '',
    description: '',
    priority: '',
    status: 'new',
    type: '',
    client: {},
    executor: {},
    contactPerson: '',
    phone: '',
    email: '',
    createdAt: '',
    deadline: '',
    workStart: '',
    workEnd: '',
    workCost: null,
    materials: [],
    requestMethod: '',
    address: '',
    distance: '',
    estimatedTravelTime: ''
  }
  
  // Если это клиент, устанавливаем некоторые поля по умолчанию
  if (isClient) {
    return {
      ...baseData,
      priority: 'medium',
      status: 'new'
    }
  }
  
  return baseData
}

/**
 * Получает начальные данные для новой заявки
 * @param {string} executorData
 */
const getTicketExecutorTableName = (executorData) => {
  if(executorData.last_name && executorData.first_name && executorData.middle_name){
    let executorName = executorData.last_name + " " + executorData.first_name.trim()[0] + "." + executorData.middle_name.trim()[0] + "."
    return executorName
  }
  return "Не назначен"
}

/**
 * Получает начальные данные для новой заявки
 * @param {string} executorData
 */
export const getTicketExecutorName = (executorData) => {
  if(executorData.last_name && executorData.first_name && executorData.middle_name){
    let executorName = executorData.last_name + " " + executorData.first_name + " " + executorData.middle_name + " "
    return executorName
  }
  return "Не назначен"
}

/**
 * Проверяет, является ли заявка новой (еще не сохранена)
 * @param {Object} ticket - Заявка
 * @returns {boolean}
 */
export const isNewTicket = (ticket) => {
  return !ticket.id && !ticket.number
}

/**
 * Определяет доступные действия для пользователя в зависимости от режима
 * @param {string} userRole - Роль пользователя
 * @param {string} mode - Режим работы (view/edit/create)
 * @returns {Object} Объект с доступными действиями
 */
export const getUserPermissions = (userRole, mode = 'view') => {
  const isAdmin = isAdminUser(userRole)
  const isClient = isClientUser(userRole)
  const isEditMode = mode === 'edit' || mode === 'create'
  
  return {
    // Общие разрешения
    canView: true,
    canCreate: isAdmin || isClient,
    canEdit: isEditMode,
    
    // Разрешения для полей
    canEditType: isEditMode && (isAdmin || isClient),
    canEditPriority: isEditMode && (isAdmin || isClient),
    canEditSubject: isEditMode,
    canEditDescription: isEditMode,
    canEditDeadline: isEditMode && isAdmin,
    canEditStatus: isEditMode && isAdmin,
    canEditExecutor: isEditMode && isAdmin,
    canEditWorkDates: isEditMode && isAdmin,
    canEditWorkCost: isEditMode && isAdmin,
    canEditMaterials: isEditMode && isAdmin,
    canEditClient: isEditMode && isAdmin,
    
    // Разрешения для просмотра
    canViewContract: true,
    canViewClientInfo: true,
    canViewExecutionInfo: true,
  }
}