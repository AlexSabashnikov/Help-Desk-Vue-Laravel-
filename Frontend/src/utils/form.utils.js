/**
 * Утилиты для работы с формами заявок
 */

/**
 * Обработчик изменения поля формы с валидацией
 * @param {Function} emit - Функция emit компонента
 * @param {string} field - Имя поля
 * @param {any} value - Новое значение
 * @param {Object} validators - Объект с функциями валидации
 */
export const handleFieldChange = (emit, field, value, validators = {}) => {
  // Применяем валидацию, если есть
  if (validators[field]) {
    const validationResult = validators[field](value)
    if (!validationResult.isValid) {
      emit('validationError', { field, error: validationResult.error })
      return
    }
  }
  
  emit('fieldChange', field, value)
}

/**
 * Обработчик изменения материалов
 * @param {Function} emit - Функция emit компонента
 * @param {Array} updatedMaterials - Обновленные материалы
 */
export const handleMaterialChange = (emit, updatedMaterials) => {
  emit('materialChange', updatedMaterials)
}

/**
 * Валидатор для темы заявки
 * @param {string} value - Значение темы
 * @returns {Object} Результат валидации
 */
export const validateSubject = (value) => {
  if (!value || value.trim().length === 0) {
    return { isValid: false, error: 'Тема заявки обязательна для заполнения' }
  }
  
  if (value.length > 100) {
    return { isValid: false, error: 'Тема не должна превышать 100 символов' }
  }
  
  return { isValid: true }
}

/**
 * Валидатор для описания заявки
 * @param {string} value - Значение описания
 * @returns {Object} Результат валидации
 */
export const validateDescription = (value) => {
  if (!value || value.trim().length === 0) {
    return { isValid: false, error: 'Описание обязательно для заполнения' }
  }
  
  if (value.length > 1000) {
    return { isValid: false, error: 'Описание не должно превышать 1000 символов' }
  }
  
  return { isValid: true }
}

/**
 * Валидатор для дедлайна
 * @param {string|Date} deadline - Дата дедлайна
 * @param {string|Date} createdAt - Дата создания
 * @returns {Object} Результат валидации
 */
export const validateDeadline = (deadline, createdAt = null) => {
  if (!deadline) {
    return { isValid: false, error: 'Срок выполнения обязателен' }
  }
  
  const deadlineDate = new Date(deadline)
  if (isNaN(deadlineDate.getTime())) {
    return { isValid: false, error: 'Некорректная дата срока выполнения' }
  }
  
  if (createdAt) {
    const createdDate = new Date(createdAt)
    if (deadlineDate < createdDate) {
      return { isValid: false, error: 'Срок выполнения не может быть раньше даты создания' }
    }
  }
  
  return { isValid: true }
}

/**
 * Валидатор для стоимости работ
 * @param {number} value - Значение стоимости
 * @returns {Object} Результат валидации
 */
export const validateWorkCost = (value) => {
  if (value === null || value === undefined || value === '') {
    return { isValid: false, error: 'Стоимость работ обязательна' }
  }
  
  const numValue = Number(value)
  if (isNaN(numValue)) {
    return { isValid: false, error: 'Стоимость должна быть числом' }
  }
  
  if (numValue < 0) {
    return { isValid: false, error: 'Стоимость не может быть отрицательной' }
  }
  
  return { isValid: true }
}

/**
 * Создает объект с валидаторами для формы заявки
 * @param {Object} ticket - Данные заявки
 * @returns {Object} Объект с функциями валидации
 */
export const createTicketValidators = (ticket) => ({
  subject: (value) => validateSubject(value),
  description: (value) => validateDescription(value),
  deadline: (value) => validateDeadline(value, ticket.createdAt),
  workCost: (value) => validateWorkCost(value),
  // Добавьте другие валидаторы по необходимости
})

/**
 * Форматирует значение для поля ввода на основе типа
 * @param {any} value - Значение
 * @param {string} fieldType - Тип поля
 * @returns {any} Отформатированное значение
 */

// Импортируем нужные функции
import { formatDateTimeLocal } from './date.utils'

export const formatFieldValue = (value, fieldType) => {
  if (value === null || value === undefined) {
    return ''
  }
  
  switch (fieldType) {
    case 'datetime-local':
      return formatDateTimeLocal(value)
    
    case 'number':
      return Number(value) || 0
    
    case 'select':
    case 'combobox':
      return value || ''
    
    default:
      return String(value)
  }
}

/**
 * Подготавливает данные заявки для отправки на сервер
 * @param {Object} ticketData - Данные заявки из формы
 * @returns {Object} Очищенные и подготовленные данные
 */
export const prepareTicketForSubmit = (ticketData) => {
  const preparedData = { ...ticketData }
  
  // Преобразуем пустые строки в null для числовых полей
  if (preparedData.workCost === '') {
    preparedData.workCost = null
  }
  
  // Убираем лишние пробелы из строковых полей
  if (preparedData.subject) {
    preparedData.subject = preparedData.subject.trim()
  }
  
  if (preparedData.description) {
    preparedData.description = preparedData.description.trim()
  }
  
  // Преобразуем даты в ISO формат, если нужно
  // (в реальном приложении зависит от API сервера)
  
  return preparedData
}