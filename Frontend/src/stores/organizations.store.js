/**
 * Хранилище компаний-клиентов
 * Справочник компаний для выбора при создании заявок
 * Поиск и автодополнение в формах
 */

import { defineStore } from 'pinia'
//import { organizationsApi } from '@/api/companies.api'
import { useCache } from '@/utils/cashe.utils'
import globalApiClient from '@/api/axios.config'

export const useOrganizationsStore = defineStore('organizations', {
  state: () => ({
    organizations: [],
    loading: false,
    currentOrganization: null,
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
        } = useCache(5 * 60 * 1000)
        
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

    async sendRequestPage(url) {
      console.log('📤 Загружаем опции следующей страницы: ', url)
      const response = await globalApiClient.post(url)
      console.log('📥 Ответ от сервера:', response)
      return response
    },

    async sendRequestLoadOrganizations(searchStr) {
      const requestBody = {
        organization_search: searchStr
      }
      console.log('📤 Загружаем опции для комбобокс организаций: ', requestBody)
      const response = await globalApiClient.post('/organizations/load_organizations', requestBody)
      console.log('📥 Ответ от сервера:', response)
      return response  // Возвращаем полный response
    },

    // То же для объектов
    async sendRequestLoadObjects(searchStr) {
      const requestBody = {
        object_search: searchStr
      }
      console.log('📤 Загружаем опции для комбобокс объектов: ', requestBody)
      const response = await globalApiClient.post('/objects/load_objects', requestBody)
      console.log('📥 Ответ от сервера:', response)
      return response
    },

    async fetchOrganizations(params = {}) {
      this.loading = true
      
      // Получаем методы кэша
      const cache = this.initCache()

      // Генерируем ключ для кэша
      const cacheKey = cache.getCacheKey('orgs', params)
      
      // Если параметры НЕ изменились и есть валидный кэш - используем его
      if (cache.isCacheValid(cacheKey)) {
        console.log('📦 Используем кэшированные данные для ключа: ', cacheKey)
        const cached = cache.getFromCache(cacheKey)
        
        // Восстанавливаем данные из кэша
        this.organizations = cached.data.data || []
        this.pagination = cached.pagination
        
        this.loading = false
        return cached.response
      }
      
      try {
        // Формируем тело запроса
        const requestBody = {
          organization_search: params.search || '',
          type: params.types || (params.type ? [params.type] : []),
        }
      
        console.log('📤 Отправка запроса /organizations/load_organizations:', requestBody)
        const response = await globalApiClient.post('/organizations/load_organizations', requestBody)
        //const response = await organizationsApi.getOrganizations()
        console.log('📥 Ответ от сервера:', response)
      
        if (response.data) {
          this.organizations = response.data.data || []
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
          
          // Сохраняем новые данные в кэш
          cache.saveToCache(cacheKey, response.data, this.pagination, response)

          // Сохраняем текущие параметры
          this.lastParams = { ...params }
        }
        return response
      } catch (error) {
        console.error('❌ Ошибка загрузки организаций:', error)
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
      const cacheKey = cache.getCacheKey('orgs', params)
      cache.invalidateCacheKey(cacheKey)
    },
    
    clearCache() {
      const cache = this.initCache()
      cache.clearCache()
      this.lastParams = null
    }
  }
})