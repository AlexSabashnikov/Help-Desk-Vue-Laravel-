/**
 * Сервис аутентификации и авторизации
 * Отвечает за: вход/выход, проверку токенов, обновление сессии
 * Изолирует логику работы с API бэкенда для авторизации
 */

import apiClient from './axios.config'

// Auth API
export const authApi = {
  login: (credentials) => apiClient.post('/login', credentials),
  logout: () => apiClient.post('/logout'),
  refreshCsrf: () => apiClient.get('/csrf-token'),
}