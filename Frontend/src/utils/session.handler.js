/**
 * Обработчик сессий для отслеживания AJAX запросов
 * Реагирует на 419 (CSRF) и 401 (токен) ошибки
 * Не обновляет токены автоматически, только реагирует на ошибки
 */

import axios from 'axios'
import router from '@/router'
import { clearAuthData } from '@/utils/auth.utils'

// Создаем централизованный экземпляр axios
const createAxiosInstance = () => {
  const instance = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    withCredentials: true,
    timeout: 30000,
  })
  
  return instance
}

// ОСОБЫЙ клиент для запроса CSRF токена
const createCsrfRefreshClient = () => {
  const instance = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    withCredentials: true,
    timeout: 30000,
  })
  
  // НЕ добавляем стандартные интерцепторы!
  // Только минимальный интерцептор для отслеживания
  instance.interceptors.request.use(
    (config) => {
      // НИКОГДА не добавляем CSRF токен для этого клиента
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )
  
  return instance
}

// Глобальный экземпляр для всего приложения
export const globalApiClient = createAxiosInstance()

const csrfRefreshClient = createCsrfRefreshClient()

class SessionHandler {
  constructor() {
    this.activeRequests = new Set()
    this.isRefreshingCsrf = false
    this.csrfQueue = []
    this.isInitialized = false
  }

  /**
   * Инициализирует обработчик сессий
   */
  async init() {
    if (this.isInitialized) {
      return
    }
    
    console.log('🔧 Initializing session handler...')
    
    // Перехватчики для всех axios запросов
    this.setupInterceptors(axios)

    this.setupInterceptors(globalApiClient)

    this.isInitialized = true
    console.log('✅ Session handler initialized')
  }

  // Настройка перехватчиков для axios
  setupInterceptors(axiosInstance) {
    // Перехватчик запросов
    axiosInstance.interceptors.request.use(
      (config) => {
        // Отслеживаем активные запросы
        const requestId = this.generateRequestId(config)
        this.activeRequests.add(requestId)
        
        // CSRF токен из meta тега
        const token = this.getCsrfTokenFromLocalStorage('token')
        if (token && this.requiresAuth(config)) {
          config.headers['Authorization'] = `Bearer ${token}`
          console.log('🔑 Добавлен Bearer токен в запрос')
        }

        // CSRF токен (для Laravel Sanctum)
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
        if (csrfToken && this.requiresCsrfToken(config)) {
          config.headers['X-CSRF-TOKEN'] = csrfToken
        }
        
        config._requestId = requestId
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Перехватчик ответов
    axiosInstance.interceptors.response.use(
      (response) => {
        // Удаляем завершенный запрос из отслеживания
        if (response.config._requestId) {
          this.activeRequests.delete(response.config._requestId)
        }
        this.updateCsrfTokenFromResponse(response)
        return response
      },
      async (error) => {
        // Удаляем запрос из отслеживания
        if (error.config?._requestId) {
          this.activeRequests.delete(error.config._requestId)
        }

        // Проверяем CSRF токен в ответе с ошибкой
        if (error.response?.data?.token) {
          this.updateCsrfTokenInMeta(error.response.data.token)
        }

        await this.handleResponseError(error)
        return Promise.reject(error)
      }
    )
  }

  // Получает CSRF токен из meta тега
  getCsrfTokenFromLocalStorage() {
    const token = localStorage.getItem('token')
    return token
  }

  // Обновляет CSRF токен в meta теге
  updateCsrfTokenInMeta(newToken) {
    const metaTag = document.querySelector('meta[name="csrf-token"]')
    if (metaTag) {
      metaTag.setAttribute('content', newToken)
      console.log('✅ CSRF токен обновлен в meta теге')
      return true
    }
  }

  updateCsrfTokenFromResponse(response) {
  if (response?.data?.token) {
    this.updateCsrfTokenInMeta(response.data.token)
    localStorage.removeItem('token')
    localStorage.setItem('token', response.data.token)
    console.log('✅ CSRF токен обновлен из ответа сервера')
    return true
  }
  return false
}

  // Проверяет и обновляет CSRF токен из ответа сервера
  checkAndUpdateCsrfFromResponse(response) {
    if (response.data && response.data.token) {
      this.updateCsrfTokenInMeta(response.data.token)
    }
  }

  //Проверяет, нужен ли CSRF токен для запроса
  requiresCsrfToken(config) {
    // CSRF токен нужен для POST, PUT, DELETE, PATCH
    const methodsRequiringCsrf = ['POST', 'PUT', 'DELETE', 'PATCH']
    return methodsRequiringCsrf.includes(config.method?.toUpperCase())
  }

  /**
   * Обрабатывает ошибки ответов
   */
  async handleResponseError(error) {
    const { response } = error
    
    // Ошибка 419 - CSRF токен истек
    if (response?.status === 419) {
      console.log('🔄 CSRF token expired (419), refreshing...')
      return await this.handleCsrfError(error)
    }
    
    // Ошибка 401 - не авторизован (токен истек)
    if (response?.status === 401) {
      console.log('🔒 Unauthorized (401), logging out...')
      return await this.handleAuthError()
    }
    
    // Ошибка 403 - доступ запрещен
    if (response?.status === 403) {
      console.warn('🚫 Доступ запрещен (403)')
      router.push({ name: 'unauthorized' })
    }
    
    // Сетевая ошибка (сервер не доступен)
    if (!response && error.code === 'ERR_NETWORK') {
      console.error('🌐 Network error:', error.message)
    }
  }

  // Обрабатывает ошибку CSRF (419)
  async handleCsrfError(error) {
    const originalConfig = error.config
    
    // Если уже обновляем CSRF, добавляем запрос в очередь
    if (this.isRefreshingCsrf) {
      return new Promise((resolve, reject) => {
        this.csrfQueue.push({ 
          resolve, 
          reject,
          config: originalConfig 
        })
      })
    }

    this.isRefreshingCsrf = true
    console.log('🔄 CSRF токен истек, запрашиваем новый с сервера...')
    console.log('Оригинальный URL запроса:', originalConfig.url)
    console.log('Текущий CSRF токен в meta:', this.getCsrfTokenFromMeta())
    
    try {
      // Запрашиваем новый CSRF токен с сервера через authApi
      console.log('📤 Отправляем запрос на /get_token БЕЗ CSRF заголовка...')
      const response = await csrfRefreshClient.get('/get_token')
      console.log("response.data: ", response.data)
      const newCsrfToken = response.data?.token
      
      if (!newCsrfToken) {
        throw new Error('CSRF токен не получен от сервера')
      }
      
      console.log('✅ Новый CSRF токен получен с сервера:', newCsrfToken)

      // Обновляем токен в meta теге
      this.updateCsrfTokenInMeta(newCsrfToken)
      
      // Обновляем заголовок в оригинальном запросе
      originalConfig.headers['X-CSRF-TOKEN'] = newCsrfToken
      
      this.isRefreshingCsrf = false
      
      // Выполняем запросы из очереди с новым токеном
      this.processCsrfQueue(newCsrfToken)
      
      const axiosInstance = this.getAxiosInstanceForConfig(originalConfig)
      // Повторяем оригинальный запрос с новым токеном
      return axiosInstance(originalConfig)
    } catch (refreshError) {
      this.isRefreshingCsrf = false
      console.error('❌ Ошибка получения CSRF токена с сервера:', refreshError.message)

      // Проверяем, не является ли это запросом логина
      const isLoginRequest = originalConfig.url && 
        originalConfig.url.includes('/login')
      
      if (!isLoginRequest) {
        await this.handleAuthError()
      }
      
      // Отклоняем все запросы в очереди
      this.rejectCsrfQueue(refreshError)
      
      return Promise.reject(refreshError)
    }
  }

  // Определяет какой экземпляр axios использовать для конфига
  getAxiosInstanceForConfig(config) {
    // Если запрос был через globalApiClient, используем его
    // Проверяем по baseURL или другим признакам
    if (config.baseURL === globalApiClient.defaults.baseURL) {
      console.log('base URL globalApiClient')
      return globalApiClient
    }
    
    // В противном случае используем глобальный axios
    return axios
  }

  // Обработка ошибки авторизации (401)
  async handleAuthError(error) {
    // Для всех случаев 401 - сессия истекла
    console.log('🔒 Сессия истекла (401), выполняем выход...')
    
    // Очищаем данные авторизации и /logout
    clearAuthData()
    
    // Редирект на страницу входа
    if (router.currentRoute.value.name !== 'login') {
      router.push({ name: 'login' })
    }
    
    return Promise.reject(error)
  }

  // Обработка очереди запросов после обновления CSRF
  processCsrfQueue(csrfToken) {
    this.csrfQueue.forEach(promise => {
      if (promise.config) {
        // Обновляем CSRF токен в конфиге
        promise.config.headers['X-CSRF-TOKEN'] = csrfToken
        // Выполняем запрос
        globalApiClient(promise.config).then(promise.resolve).catch(promise.reject)
      }
    })
    this.csrfQueue = []
  }

  // Отклоняет все запросы в очереди
  rejectCsrfQueue(error) {
    this.csrfQueue.forEach(promise => {
      promise.reject(error)
    })
    this.csrfQueue = []
  }

  // Генерирует уникальный ID для запроса
  generateRequestId(config) {
    return `${config.method}_${config.url}_${Date.now()}_${Math.random()}`
  }

  // Получает количество активных запросов
  getActiveRequestsCount() {
    return this.activeRequests.size
  }

  // Сбрасывает все флаги и очереди
  reset() {
    this.activeRequests.clear()
    this.isRefreshingCsrf = false
    this.csrfQueue = []
    this.isInitialized = false
  }
  requiresAuth(config) {
  // Для всех запросов, кроме публичных, нужна авторизация
  const publicEndpoints = ['/login', '/get_token', '/test']
  const url = config.url || ''
  
  return !publicEndpoints.some(endpoint => url.includes(endpoint))
}
}

// Создаем и экспортируем синглтон
export const sessionHandler = new SessionHandler()
export default sessionHandler