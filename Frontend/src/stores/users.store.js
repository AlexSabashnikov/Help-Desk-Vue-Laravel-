/**
 * Хранилище пользователей
 * Справочник инженеров, администраторов, контактных лиц
 * Используется для назначения исполнителей на заявки
 * Кэширование и обновление при изменении данных
 */

import { defineStore } from 'pinia'
import globalApiClient from '@/api/axios.config'
import { useCache } from '@/utils/cashe.utils'

export const useUsersStore = defineStore('users', {
  state: () => ({
    users: [],
    loading: false,
    currentUser: null,
    pagination: null,
    cacheInstance: null,
    lastParams: null
  }),

  actions: {
    // Инициализация кэша (вызывается при первом использовании)
    initCache() {
      if (!this.cacheInstance) {
        const { 
          getCacheKey, 
          isCacheValid, 
          getFromCache, 
          saveToCache,
          invalidateCacheKey,
          clearCache,
          cache
        } = useCache(5 * 60 * 1000) // 5 минут
        
        this.cacheInstance = {
          getCacheKey,
          isCacheValid,
          getFromCache,
          saveToCache,
          invalidateCacheKey,
          clearCache,
          cache
        }
      }
      return this.cacheInstance
    },

    // Получить профиль текущего пользователя - используем данные из localStorage
      async getProfile() {
        try {
          // Пытаемся получить данные текущего пользователя из localStorage
          const raw = localStorage.getItem('user')
          if (raw) {
            const userData = JSON.parse(raw)
            console.log('profileApi.getProfile: получены данные из localStorage', userData)
            return { user: userData }
          }
          throw new Error('Данные пользователя не найдены в localStorage')
        } catch (err) {
          console.error('profileApi.getProfile: ошибка получения профиля', err)
          throw err
        }
      },
    
    // Обновить профиль текущего пользователя
    async updateProfile(payload) {
      try {
        console.log(`📤 Отправка запроса на редактирование профиля`, payload)
        
        // Реальный запрос к серверу
        const response = await globalApiClient.post('/users/update', payload)
        console.log('📥 Ответ от сервера при редактировании профиля', response)

        const raw = localStorage.getItem('user')
        if (raw && !response.data.validator_fails) {
        const currentUser = JSON.parse(raw)
      
        // ИСПРАВЛЕНИЕ: Сохраняем ПОЛНУЮ структуру пользователя
        const updatedUser = { 
          ...currentUser,
          first_name: payload.first_name,
          last_name: payload.last_name,
          middle_name: payload.middle_name,
          email: payload.email,
          phone_number: payload.phone_number,
          // Обновляем телефон в массиве phone_numbers
          phone_numbers: [
            {
              ...currentUser.phone_numbers?.[0],
              phone_number: payload.phone_number
            }
          ],
          // Роль и организация остаются теми же (они не меняются через профиль)
          role: payload.role,
          organization: payload.organization,
          object: payload.object,
        }
      
        localStorage.setItem('user', JSON.stringify(updatedUser))
        console.log('profileApi.updateProfile: профиль обновлен в localStorage', updatedUser)
      
        // Возвращаем в том же формате, что и сервер
        return { 
          data: updatedUser,
          user: updatedUser 
        }
      }
      throw new Error('Данные пользователя не найдены в localStorage')
      } catch (err) {
        console.error('profileApi.updateProfile: ошибка обновления профиля', err)
        throw err
      }
    },

      // Обновить пользователя при редактировании
      async updateUserById(payload) { 
        try {
          console.log(`📤 Отправка запроса на редактирование пользователя ${payload.id} из таблицы:`, payload)
        
          // Реальный запрос к серверу
          const response = await globalApiClient.post('/users/update', payload)
          console.log('📥 Ответ от сервера при редактировании пользователя из таблицы:', response)
        
          return response.data
        } catch (err) {
          console.error('❌ Ошибка при редактировании пользователя из таблицы:', err)
          throw err
        }
      },

    // Смена пароля
    async changePassword(payload) {
      try {
        console.log('📤 Отправка запроса на смену пароля:', payload)
        
        // Реальный запрос к серверу
        const response = await globalApiClient.post('/users/update_password', payload)
        console.log('📥 Ответ от сервера при смене пароля:', response)
        
        return response.data
      } catch (err) {
        console.error('❌ Ошибка при смене пароля:', err)
        throw err
      }
    },

      async createUser(payload) { 
        try {
          console.log('📤 Отправка запроса на создание пользователя:', payload)
        
          // Реальный запрос к серверу
          const response = await globalApiClient.post('/users/store', payload)
          console.log('📥 Ответ от сервера при создании пользователя:', response)
        
          return response.data
        } catch (err) {
          console.error('❌ Ошибка при создании пользователя:', err)
          throw err
        }
      },

      async deleteUser(payload){
        console.log("Удаляем пользователя: ", payload)
        const res = { data: {validator_fails: ['Пользователь не удален']}}
        return res
      },

      async deleteUsers(payload){
        console.log("Удаляем пользователей: ", payload)
        const res = { data: {validator_fails: ['Пользователи не удалены']}}
        return res
      },
    
      // Получить пользователя по id - используем данные из загруженного списка
      async getUserById(id, usersList = null) {
        try {
          // Если передан список пользователей, ищем в нем
          if (usersList && Array.isArray(usersList)) {
            const foundUser = usersList.find(u => u.id === parseInt(id))
            if (foundUser) {
              console.log('profileApi.getUserById: пользователь найден в переданном списке', foundUser)
              return { user: foundUser }
            }
          }
          
          // Если список не передан или пользователь не найден, пробуем получить из localStorage
          const raw = localStorage.getItem('user')
          if (raw) {
            const localUser = JSON.parse(raw)
            if (parseInt(localUser.id) === parseInt(id)) {
              console.log('profileApi.getUserById: пользователь найден в localStorage', localUser)
              return { user: localUser }
            }
          }
          
          // Если ничего не найдено, возвращаем ошибку
          throw new Error(`Пользователь с id ${id} не найден`)
        } catch (err) {
          console.error(`profileApi.getUserById: ошибка получения пользователя ${id}`, err)
          throw err
        }
      },

    async fetchUsers(params = {}) {
      this.loading = true
      
      // Получаем методы кэша
      const cache = this.initCache()
      
      // Генерируем ключ для кэша
      const cacheKey = cache.getCacheKey('users', params)
      
      // Если параметры НЕ изменились и есть валидный кэш - используем его
      if (cache.isCacheValid(cacheKey)) {
        console.log('📦 Используем кэшированные данные для ключа: ', cacheKey)
        const cached = cache.getFromCache(cacheKey)
        
        // Восстанавливаем данные из кэша
        this.users = cached.data.data || []
        this.pagination = cached.pagination
        
        this.loading = false
        return cached.response
      }
      
      try {
        // Формируем тело запроса
        const requestBody = {
          user_search: params.search || '',
          roles: params.roles || (params.role ? [params.role] : []),
        }
      
        console.log('📤 Отправка запроса /users/load_users:', requestBody)
      
        const response = await globalApiClient.post('/users/load_users', requestBody)
      
        console.log('📥 Ответ от сервера:', response)
      
        if (response.data) {
          this.users = response.data.data || []
          this.pagination = {
            current_page: response.data.current_page,
            data: response.data.data,
            first_page_url: response.data.first_page_url,
            from: response.data.from,
            last_page: response.data.last_page,
            last_page_url: response.data.last_page_url,
            links: response.data.links,
            next_page_url: response.data.next_page_url,
            path: response.data.path,
            per_page: response.data.per_page,
            prev_page_url: response.data.prev_page_url,
            to: response.data.to,
            total: response.data.total
          }
  
          // Сохраняем новые данные
          cache.saveToCache(cacheKey, response.data, this.pagination, response)

          this.lastParams = { ...params }
        }
        return response
      } catch (error) {
        console.error('❌ Ошибка загрузки пользователей:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // метод для очистки кэша по префиксу
    clearCacheByPrefix(prefix) {
      const cache = this.initCache()
      if (cache.cache?.value) {
        const keysToDelete = []
        cache.cache.value.forEach((_, key) => {
          if (key.startsWith(prefix)) {
            keysToDelete.push(key)
          }
        })
        keysToDelete.forEach(key => cache.cache.value.delete(key))
        if (keysToDelete.length > 0) {
          console.log(`🗑️ Удалено ${keysToDelete.length} ключей с префиксом ${prefix}:`, keysToDelete)
        }
      }
    },
    
    invalidateCacheKey(params) {
      const cache = this.initCache()
      const cacheKey = cache.getCacheKey('users', params)
      cache.invalidateCacheKey(cacheKey)
    },
    
    clearCache() {
      const cache = this.initCache()
      cache.clearCache()
    }
  }
})