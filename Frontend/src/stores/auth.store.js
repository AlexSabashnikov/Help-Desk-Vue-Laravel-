/**
 * Хранилище аутентификации
 * Текущий пользователь, токен, роль, права доступа
 * Сохранение в localStorage (токен и основные данные)
 * Хранилище аутентификации с mock-режимом для разработки
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import globalApiClient from '@/api/axios.config'
import router from '@/router'
import { emitAuthEvent, clearAuthData as clearAuthDataUtil } from '@/utils/auth.utils'

export const useAuthStore = defineStore('auth', () => {
  // Состояние
  const user = ref(null)
  const isAuthenticated = computed(() => !!user.value)
  const userRole = computed(() => roleConversion(user.value.role.name) || null)

  // Методы
  const roleConversion = (role) => {
    switch (role) {
      case 'Администратор':
        return 'admin'
      case 'Диспетчер':
        return 'dispatcher'
      case 'Инженер':
        return 'engineer'
      case 'Клиент':
        return 'client'
      default:
        return null
    }
  }

  const login = async (credentials) => {
    try {

      //await globalApiClient.post('api/logout')

      console.log('Отправляю запрос на /login:', credentials)

      const response = await globalApiClient.post('/login', credentials)

      console.log('Ответ от сервера:', response.data)
      console.log('Cтруктура ответа:', JSON.stringify(response.data, null, 2))
      
      // Проверяем, есть ли ошибка валидации
      if (response.data?.validator_fails) {
        throw new Error(response.data.validator_fails)
      }

      const userData = response.data.user

      if (!userData?.login) {
        console.log(userData)
        throw new Error('Неверный ответ от сервера')
      }
      const role = roleConversion(userData.role.name)
      userData.role.name = role

      // Сохраняем данные пользователя
      user.value = userData

      // Сохраняем в localStorage данные пользователя
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('token', response.data.token)
      
      console.log('✅ Успешный вход, роль:', userData.role?.name || 'не указана')
      // Редирект по роли
      redirectByRole(userData.role?.name)
      // Вызываем уведомление
      emitAuthEvent('loginSuccess')

      return response.data
    } catch (error) {
      console.error('Ошибка входа:', error)
    
      // Если это уже наша кастомная ошибка (с validator_fails)
      if (error.message && error.message.includes('Учетная запись')) {
        throw error // Просто пробрасываем дальше
      }
    
      // Ошибка 422 - неверные учетные данные
      if (error.response?.status === 422) {
        const errorMessage = error.response?.data?.validator_fails || 
                         error.response?.data?.message ||
                         'Учетная запись не найдена'
        throw new Error(errorMessage)
      }
    
      // Другие ошибки
      throw new Error('Ошибка подключения к серверу')
    }
  }

  const redirectByRole = (roleName) => {
    switch (roleName) {
      case 'admin':
        router.push({ name: 'admin-tickets' })
        break
      case 'dispatcher':
        router.push({ name: 'dispatcher-tickets' })
        break
      case 'engineer':
        router.push({ name: 'engineer-tickets' })
        break
      case 'client':
        router.push({ name: 'client-tickets' })
        break
      default:
        router.push({ name: 'login' })
    }
  }

  // Выход пользователя
  const logout = async () => {
    try {
      await globalApiClient.post('/logout')
    } catch (error) {
      // Даже если ошибка, все равно очищаем данные
      console.log(error, ' Выход выполнен')
    } finally {
      //clearAuthData()
      router.push({ name: 'login' })
    }
  }

  const clearAuthData = async () => {
    // Вызываем уведомление
    console.log('authStore clearData')
    await logout()
    user.value = null
    clearAuthDataUtil(true)
  }

  const initialize = () => {
    // Восстанавливаем данные из localStorage
    const savedUser = localStorage.getItem('user')
    
    if (savedUser) {
      try {
        user.value = JSON.parse(savedUser)
      } catch (error) {
        console.error('Ошибка инициализации авторизации:', error)
        clearAuthData()
      }
    } 
  }

  return {
    // Состояние
    user,
    isAuthenticated,
    userRole,
    
    // Действия
    login,
    logout,
    clearAuthData,
    initialize,
    redirectByRole,
  }
})