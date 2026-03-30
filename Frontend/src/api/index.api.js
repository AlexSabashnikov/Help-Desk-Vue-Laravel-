/**
 * Центральный файл для всех API запросов
 * Все AJAX запросы должны идти через этот файл
 */

export { ticketsApi } from './tickets.api'
export { authApi } from './auth.api'

/*
// Companies API
export const companiesApi = {
  getAll: (params) => apiClient.get('/companies', { params }),
  getById: (id) => apiClient.get(`/companies/${id}`),
  create: (data) => apiClient.post('/companies', data),
}

// Users API
export const usersApi = {
  getAll: (params) => apiClient.get('/users', { params }),
  getById: (id) => apiClient.get(`/users/${id}`),
}

// Analytics API
export const analyticsApi = {
  getDashboard: () => apiClient.get('/analytics/dashboard'),
  getReports: (params) => apiClient.get('/analytics/reports', { params }),
}*/
