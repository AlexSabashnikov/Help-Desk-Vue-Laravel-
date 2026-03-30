/**
 * Хранилище заявок
 * Список заявок, текущие фильтры, сортировка, пагинация
 * Кэширование данных, оптимизация запросов к серверу
 */

import { defineStore } from 'pinia'
import { ticketsApi } from '@/api/tickets.api'

export const useTicketsStore = defineStore('tickets', {
  state: () => ({
    tickets: [],
    total: 0,
    loading: false,
  }),

  actions: {
    async fetchTickets(params = {}) {
      this.loading = true
      try {
        const response = await ticketsApi.getTickets(params)
        this.tickets = response.data
        return response
      } catch (error) {
        console.error('Ошибка загрузки заявок:', error)
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})
