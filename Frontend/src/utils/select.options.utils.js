/**
 * Утилиты с данными для выпадающих списков
 */

import { useOrganizationsStore } from "@/stores/organizations.store"

// === ОПЦИИ ДЛЯ ЗАЯВОК ===

/**
 * Опции для типов заявок
 */
export const TICKET_TYPE_OPTIONS = [
  { value: 'onsite', label: 'Выездная заявка' },
  { value: 'remote', label: 'Удаленная заявка' },
  { value: 'phone', label: 'Телефонная заявка' },
  { value: 'web', label: 'WEB-заявка' }
]
/**
 * Опции для приоритетов заявок
 */
export const TICKET_PRIORITY_OPTIONS = [
  { value: 'crit', label: 'Критический' },
  { value: 'high', label: 'Высокий' },
  { value: 'medium', label: 'Средний' },
  { value: 'low', label: 'Низкий' }
]
/**
 * Опции для статусов заявок
 */
export const TICKET_STATUS_OPTIONS = [
  { value: 'new', label: 'Новая'},
  { value: 'assigned', label: 'Назначена'},
  { value: 'onSite', label: 'Выехал на объект'},
  { value: 'inProgress', label: 'В работе'},
  { value: 'waitingPayment', label: 'Ждет оплаты'},
  { value: 'completed', label: 'Выполнена'},
  { value: 'stopped', label: 'Работа остановлена'},
  { value: 'rejected', label: 'Отказ заказчика'},
]
/**
 * Опции для типов материалов
 */
export const MATERIAL_TYPE_OPTIONS = [
  { id: 1, name: 'Кабель' },
  { id: 2, name: 'Коннектор' },
  { id: 3, name: 'Инструмент' },
  { id: 4, name: 'Расходный материал' },
]

// === ОПЦИИ ДЛЯ ПОЛЬЗОВАТЕЛЕЙ ===

/**
 * Опции для исполнителей (в реальном приложении загружаются с сервера)
 */
export const EXECUTOR_OPTIONS = [
  { id: 1, name: 'Иванов Иван Иванович', position: 'Старший инженер' },
  { id: 2, name: 'Сабашников Александр Евгеньевич', position: 'Инженер' },
  { id: 3, name: 'Бакаринов Владислав Валентинович', position: 'Инженер' },
  { id: 4, name: 'Смирнов Алексей Иванович', position: 'Инженер' },
  { id: 5, name: 'Сидоров Андрей Викторович', position: 'Инженер' },
  { id: 6, name: 'Менделеев Дмитрий Иванович', position: 'Инженер' },
]
/**
 * Опции для клиентов/организаций (в реальном приложении загружаются с сервера)
 */
export const CLIENT_OPTIONS = [
  { id: 1, name: 'Сервис печати', contract: 'SLA-2023-001' },
  { id: 2, name: 'Пятерочка', contract: 'SLA-2023-002' },
  { id: 3, name: 'Магнит', contract: 'SLA-2023-003' },
  { id: 4, name: 'Лента Супермаркет', contract: 'SLA-2023-004' },
  { id: 5, name: 'Чижик', contract: 'SLA-2023-003' },
  { id: 6, name: 'Тесла', contract: 'SLA-2023-003' },
  { id: 7, name: 'Газпром', contract: 'SLA-2023-003' },
  { id: 8, name: 'SPAR', contract: 'SLA-2023-003' },
  { id: 9, name: 'Т-Банк', contract: 'SLA-2023-003' },
]
/**
 * Опции для офисов/локаций
 */
export const OFFICE_OPTIONS = [
  { id: 1, name: 'Главный офис', address: 'Москва, ул. Тверская, 10' },
  { id: 2, name: 'Офис №15', address: 'Москва, ул. Арбат, 25' },
  { id: 3, name: 'Офис №3', address: 'СПб, Невский пр., 50' },
]
/**
 * Опции для ролей
 */
export const USERS_ROLES_OPTIONS = [
  { value: 1, label: 'Администратор' },
  { value: 2, label: 'Диспетчер' },
  { value: 3, label: 'Инженер' },
  { value: 4, label: 'Клиент' }
]

// === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===

/**
 * Получает опции для типов заявок
 * @returns {Array} Массив опций
 */
export const getTicketTypeOptions = () => {
  const options = [...TICKET_TYPE_OPTIONS]
  return options
}

/**
 * Получает опции для приоритетов
 * @returns {Array} Массив опций
 */
export const getTicketPriorityOptions = () => {
  const options = [...TICKET_PRIORITY_OPTIONS]
  return options
}

/**
 * Получает опции для статусов
 * @returns {Array} Массив опций
 */
export const getTicketStatusOptions = () => {
  const options = [...TICKET_STATUS_OPTIONS]
  return options
}

/**
 * Получает опции для исполнителей
 * @param {boolean} includeEmpty - Включать пустую опцию
 * @returns {Array} Массив опций
 */
export const getExecutorOptions = () => {
  const options = [...EXECUTOR_OPTIONS]
  return options
}

/**
 * Получает опции для организаций с поддержкой пагинации
 * @param {string} searchStr - Поисковая строка
 * @param {number} page - Номер страницы
 * @param {number} pageSize - Размер страницы
 * @returns {Promise<Object>} Объект с данными и информацией о пагинации
 */
export const getOrgOptions = async (searchStr, url = null) => {
  console.log(`Search string: ${searchStr}, URL: ${url}`)
  
  try {
    const organizationsStore = useOrganizationsStore()
    
    let response
    if (url) {
      // Если передан URL, делаем GET запрос по нему
      response = await organizationsStore.sendRequestPage(url)
    } else {
      // Иначе делаем POST с поиском
      response = await organizationsStore.sendRequestLoadOrganizations(searchStr)
    }
    
    return response.data
  } catch (error) {
    console.error('❌ Ошибка загрузки опций:', error)
    return {
      data: [],
      current_page: 1,
      last_page: 1,
      next_page_url: null,
      prev_page_url: null,
      links: []
    }
  }
}

// То же самое для объектов
export const getObjectOptions = async (searchStr, url = null) => {
  console.log(`Search string Obj: ${searchStr}, URL: ${url}`)
  
  try {
    const organizationsStore = useOrganizationsStore()

    let response
    if (url) {
      // Если передан URL, делаем GET запрос по нему
      response = await organizationsStore.sendRequestPage(url)
    } else {
      // Иначе делаем POST с поиском
      response = await organizationsStore.sendRequestLoadObjects(searchStr)
    }
    
    console.log('📥 Загруженные опции объектов:', response)

    return response.data
  } catch (error) {
    console.error('❌ Ошибка загрузки опций объектов:', error)
    return {
      data: [],
      current_page: 1,
      last_page: 1,
      next_page_url: null,
      prev_page_url: null,
      links: []
    }
  }
}

/**
 * Получает опции ролей
 * @returns {Array} Массив опций
 */
export const getRolesOptions = () => {
  const options = [...USERS_ROLES_OPTIONS ]
  return options
}

/**
 * Получает опции для типов материалов
 * @param {boolean} includeEmpty - Включать пустую опцию
 * @returns {Array} Массив опций
 */
export const getMaterialTypeOptions = (includeEmpty = true) => {
  const options = [...MATERIAL_TYPE_OPTIONS]
  if (includeEmpty) {
    options.unshift({ id: null, name: 'Выберите материал...' })
  }
  return options
}

/**
 * Ищет исполнителя по ID
 * @param {number} id - ID исполнителя
 * @returns {Object|null} Исполнитель или null
 */
export const findExecutorById = (id) => {
  return EXECUTOR_OPTIONS.find(executor => executor.id === id) || null
}

/**
 * Ищет клиента по ID
 * @param {number} id - ID клиента
 * @returns {Object|null} Клиент или null
 */
export const findClientById = (id) => {
  return CLIENT_OPTIONS.find(client => client.id === id) || null
}

/**
 * Ищет офис по ID
 * @param {number} id - ID офиса
 * @returns {Object|null} Офис или null
 */
export const findOfficeById = (id) => {
  return OFFICE_OPTIONS.find(office => office.id === id) || null
}

/**
 * Получает имя исполнителя по ID
 * @param {number} id - ID исполнителя
 * @returns {string} Имя исполнителя или пустая строка
 */
export const getExecutorNameById = (id) => {
  const executor = findExecutorById(id)
  return executor ? executor.name : ''
}

/**
 * Получает имя клиента по ID
 * @param {number} id - ID клиента
 * @returns {string} Имя клиента или пустая строка
 */
export const getClientNameById = (id) => {
  const client = findClientById(id)
  return client ? client.name : ''
}