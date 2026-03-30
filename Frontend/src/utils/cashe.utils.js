/**
 * Утилита для работы с кэшированием данных
 * Предоставляет методы для кэширования запросов с TTL
 */

import { ref } from 'vue'

export function useCache(cacheTTL = 5 * 60 * 1000) {
  // Кэш для хранения результатов запросов
  const cache = ref(new Map())
  
  // Генерация ключа для кэша на основе параметров
  const getCacheKey = (prefix, params) => {
    const search = params.search || ''
    const types = params.types?.join(',') || params.roles?.join(',') || ''
    const page = params.page || 1
    return `${prefix}_${search}_${types}_${page}`
  }

  // Проверка валидности кэша
  const isCacheValid = (cacheKey) => {
    const cached = cache.value.get(cacheKey)
    if (!cached) return false
    
    const now = Date.now()
    return (now - cached.timestamp) < cacheTTL
  }

  // Получение данных из кэша
  const getFromCache = (cacheKey) => {
    return cache.value.get(cacheKey)
  }

  // Сохранение данных в кэш
  const saveToCache = (cacheKey, data, pagination, response) => {
    cache.value.set(cacheKey, {
      data,
      pagination: { ...pagination },
      timestamp: Date.now(),
      response
    })
    console.log(`💾 Данные сохранены в кэш с ключом: ${cacheKey}`)
  }

  // Удаление конкретного ключа из кэша
  const invalidateCacheKey = (cacheKey) => {
    cache.value.delete(cacheKey)
    console.log(`🗑️ Удален ключ из кэша: ${cacheKey}`)
  }

  // Очистка всего кэша
  const clearCache = () => {
    cache.value.clear()
    console.log('🧹 Кэш очищен')
  }

  // Получение размера кэша
  const getCacheSize = () => {
    return cache.value.size
  }

  // Получение всех ключей кэша
  const getCacheKeys = () => {
    return Array.from(cache.value.keys())
  }

  return {
    cache,
    getCacheKey,
    isCacheValid,
    getFromCache,
    saveToCache,
    invalidateCacheKey,
    clearCache,
    getCacheSize,
    getCacheKeys
  }
}