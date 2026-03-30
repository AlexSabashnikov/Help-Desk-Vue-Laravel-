/**
 * Сервис работы с заявками (тикетами)
 * CRUD операции: создание, чтение, обновление, удаление заявок
 * Фильтрация, сортировка, пагинация, изменение статусов
 * Работа с комментариями и историей изменений заявок
 */


/*import apiClient from './axios.config' // Импортируем настроенный axios

// Tickets API
export const ticketsApi = {
  getAll: (params) => apiClient.get('/tickets', { params }),
  getById: (id) => apiClient.get(`/tickets/${id}`),
  create: (data) => apiClient.post('/tickets', data),
  update: (id, data) => apiClient.put(`/tickets/${id}`, data),
  delete: (id) => apiClient.delete(`/tickets/${id}`),
}*/

export const ticketsApi = {
  async getTickets(params) {
    const { page = 1, limit = 3 } = params;
    const allTickets = [ {
          id: 1,
          number: '1001',
          subject: 'Проблемы сетевого подключения',
          priority: 'high',
          status: 'inProgress',
          type: 'onsite',
          client: { name: 'Сбер 15' },
          executor: {  
            id: 3, 
            first_name: "Владислав",
            last_name: 'Бакаринов',
            middle_name: "Валентинович",
            email: 'engineer@test.com',
            role_id: 3,
            phone: "79391634567",      
            organization: "Сервис Печати",        
            object: "Главный офис",                    
          },
          createdAt: '2025-12-22T15:21:00Z',
          deadline: '2026-02-23T17:11:00Z',
          contactPerson: 'Сабашников Александр Евгеньевич',
          phone: '+79535671806',
          email: 'Sabashnikov@yandex.ru',
          description: 'Невозможно подключиться к VPN, потому что провайдер Ростелеком',
          workStart: '2025-12-23T09:00:00Z',
          workEnd: '2025-12-23T12:00:00Z',
          workCost: 6000,
          requestMethod: 'WEB-портал',
          distance: '5,5 км',
          adress: 'г. Нижний Новгород, ул. Алексеевская, д.8',
          materials: [ { id: 1, name: "Роутер TP-Link Archer AX10", unitPrice: 4975, quantity: 1, total: 4975 },
            { id: 2, name: "Кабель UTP Cat.6 5м", unitPrice: 350, quantity: 2, total: 700 },
            { id: 3, name: "Коннектор RJ-45", unitPrice: 25, quantity: 8, total: 200 }
          ]
        },
        {
          id: 2,
          number: '1002',
          subject: 'Проблемы сетевого подключения',
          priority: 'crit',
          type: 'onsite',
          status: 'new',
          client: { name: 'ПАО "АК БАРС" Банк' },
          executor: { },
          address: 'ул. Алексеевская, 8',
          createdAt: '2025-12-22T15:21:00Z',
          deadline: '2026-01-29T15:21:00Z',
        },
        {
          id: 3,
          number: '1003',
          subject: 'Проблемы сетевого подключения',
          priority: 'low',
          status: 'assigned',
          client: { name: 'Пятерочка 1839' },
          executor: {  
            id: 3, 
            first_name: "Владислав",
            last_name: 'Бакаринов',
            middle_name: "Валентинович",
            email: 'engineer@test.com',
            role_id: 3,
            phone: "79391634567",      
            organization: "Сервис Печати",        
            object: "Главный офис",                    
          },
          address: 'ул. Ульянова, 8',
          createdAt: '2025-12-22T15:21:00Z',
          deadline: '2026-02-02T15:21:00Z',
        },
        {
          id: 4,
          number: '1004',
          subject: 'Проблемы сетевого подключения',
          priority: 'medium',
          status: 'stopped',
          client: { name: 'Лента 182' },
          executor: {  
            id: 4, 
            first_name: "Александр",
            last_name: 'Смирнов',
            middle_name: "Валентинович",
            email: 'engineer2@test.com',
            role_id: 3,
            phone: "79391674567",      
            organization: "Сервис Печати",        
            object: "Главный офис",                    
          },
          address: 'ул. Родионова, 178',
          createdAt: '2025-11-05T15:21:00Z',
          deadline: '2026-02-15T18:05:00Z',
        },
        {
          id: 5,
          number: '1005',
          subject: 'Проблемы сетевого подключения',
          priority: 'low',
          status: 'completed',
          client: { name: 'Пятерочка 1837' },
          executor: {  
            id: 5, 
            first_name: "Дмитрий",
            last_name: 'Менделеев',
            middle_name: "Иванович",
            email: 'engineer3@test.com',
            role_id: 3,
            phone: "79391634537",      
            organization: "Сервис Печати",        
            object: "Главный офис",                    
          },
          address: 'ул. Белинского, 5',
          createdAt: '2025-12-22T15:21:00Z',
          deadline: '2026-02-22T15:21:00Z',
        },
        {
          id: 6,
          number: '1006',
          subject: 'Проблемы сетевого подключения',
          priority: 'low',
          status: 'completed',
          client: { name: 'Пятерочка 1837' },
          executor: {  
            id: 5, 
            first_name: "Дмитрий",
            last_name: 'Менделеев',
            middle_name: "Иванович",
            email: 'engineer3@test.com',
            role_id: 3,
            phone: "79391634537",      
            organization: "Сервис Печати",        
            object: "Главный офис",                    
          },
          address: 'ул. Белинского, 5',
          createdAt: '2025-12-22T15:21:00Z',
          deadline: '2026-02-22T15:21:00Z',
        },
        {
          id: 7,
          number: '1007',
          subject: 'Проблемы сетевого подключения',
          priority: 'low',
          status: 'completed',
          client: { name: 'Пятерочка 1837' },
          executor: {  
            id: 5, 
            first_name: "Дмитрий",
            last_name: 'Менделеев',
            middle_name: "Иванович",
            email: 'engineer3@test.com',
            role_id: 3,
            phone: "79391634537",      
            organization: "Сервис Печати",        
            object: "Главный офис",                    
          },
          address: 'ул. Белинского, 5',
          createdAt: '2025-12-22T15:21:00Z',
          deadline: '2026-02-22T15:21:00Z',
        },
        {
          id: 8,
          number: '1008',
          subject: 'Проблемы сетевого подключения',
          priority: 'low',
          status: 'completed',
          client: { name: 'Пятерочка 1837' },
          executor: {  
            id: 5, 
            first_name: "Дмитрий",
            last_name: 'Менделеев',
            middle_name: "Иванович",
            email: 'engineer3@test.com',
            role_id: 3,
            phone: "79391634537",      
            organization: "Сервис Печати",        
            object: "Главный офис",                    
          },
          address: 'ул. Белинского, 5',
          createdAt: '2025-12-22T15:21:00Z',
          deadline: '2026-02-22T15:21:00Z',
        },
        {
          id: 9,
          number: '1009',
          subject: 'Проблемы сетевого подключения',
          priority: 'low',
          status: 'rejected',
          client: { name: 'Пятерочка 1837' },
          executor: {  
            id: 5, 
            first_name: "Дмитрий",
            last_name: 'Менделеев',
            middle_name: "Иванович",
            email: 'engineer3@test.com',
            role_id: 3,
            phone: "79391634537",      
            organization: "Сервис Печати",        
            object: "Главный офис",                    
          },
          address: 'ул. Белинского, 5',
          createdAt: '2025-12-22T15:21:00Z',
          deadline: '2026-02-22T15:21:00Z',
        },
        {
          id: 10,
          number: '1010',
          subject: 'Проблемы сетевого подключения',
          priority: 'low',
          status: 'completed',
          client: { name: 'Пятерочка 1837' },
          executor: {  
            id: 5, 
            first_name: "Дмитрий",
            last_name: 'Менделеев',
            middle_name: "Иванович",
            email: 'engineer3@test.com',
            role_id: 3,
            phone: "79391634537",      
            organization: "Сервис Печати",        
            object: "Главный офис",                    
          },
          address: 'ул. Белинского, 5',
          createdAt: '2025-12-22T15:21:00Z',
          deadline: '2026-02-22T15:21:00Z',
        },
        {
          id: 11,
          number: '1011',
          subject: 'Проблемы сетевого подключения',
          priority: 'low',
          status: 'completed',
          client: { name: 'Пятерочка 1837' },
          executor: {  
            id: 5, 
            first_name: "Дмитрий",
            last_name: 'Менделеев',
            middle_name: "Иванович",
            email: 'engineer3@test.com',
            role_id: 3,
            phone: "79391634537",      
            organization: "Сервис Печати",        
            object: "Главный офис",                    
          },
          address: 'ул. Белинского, 5',
          createdAt: '2025-12-22T15:21:00Z',
          deadline: '2026-02-22T15:21:00Z',
        },
      ]; 
  
    // Реальная пагинация
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedData = allTickets.slice(start, end);
  
    return {
      data: paginatedData,  
      total: allTickets.length,  
      page,
      limit,
    }
  }
}

/*export const ticketsApi = {
  // Создание заявки
  async createTicket(ticketData) {
    try {
      const response = await apiClient.post('/api/tickets', ticketData)
      return response.data
    } catch (error) {
      console.error('API Error creating ticket:', error)
      throw error
    }
  },
  
  // Получение списка заявок
  async getTickets(params = {}) {
    try {
      const response = await apiClient.get('/api/tickets', { params })
      return response.data
    } catch (error) {
      console.error('API Error getting tickets:', error)
      throw error
    }
  },
  
  // Получение одной заявки
  async getTicket(id) {
    try {
      const response = await apiClient.get(`/api/tickets/${id}`)
      return response.data
    } catch (error) {
      console.error('API Error getting ticket:', error)
      throw error
    }
  },
  
  // Обновление заявки
  async updateTicket(id, ticketData) {
    try {
      const response = await apiClient.put(`/api/tickets/${id}`, ticketData)
      return response.data
    } catch (error) {
      console.error('API Error updating ticket:', error)
      throw error
    }
  },
  
  // Удаление заявки
  async deleteTicket(id) {
    try {
      const response = await apiClient.delete(`/api/tickets/${id}`)
      return response.data
    } catch (error) {
      console.error('API Error deleting ticket:', error)
      throw error
    }
  }
}*/
