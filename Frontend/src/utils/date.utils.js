/**
 * Преобразование даты в формат DD.MM.YYYY HH:mm
 */
export const formatDate = (dateString) => {
  if (!dateString) return ''
  
  try {
    let date;
    
    // Проверяем формат DD.MM.YYYY HH:mm
    const russianFormat = /(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2})/;
    const match = dateString.match(russianFormat);
    
    if (match) {
      // DD.MM.YYYY HH:mm -> YYYY-MM-DDTHH:mm
      const [, day, month, year, hours, minutes] = match;
      date = new Date(`${year}-${month}-${day}T${hours}:${minutes}`);
    } else {
      // Пытаемся создать Date объект другими способами
      date = new Date(dateString);
    }
    
    if (isNaN(date.getTime())) return ''
    
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    
    return `${day}.${month}.${year} ${hours}:${minutes}`
  } catch {
    return ''
  }
}

/**
 * Преобразование даты в формат datetime-local (YYYY-MM-DDTHH:mm)
 */
export const formatDateTimeLocal = (dateString) => {
  try {
    if (!dateString) {
      return ''
    }
    
    let date;
    
    // Проверяем формат DD.MM.YYYY HH:mm
    const russianFormat = /(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2})/;
    const match = dateString.match(russianFormat);
    
    if (match) {
      const [, day, month, year, hours, minutes] = match;
      date = new Date(`${year}-${month}-${day}T${hours}:${minutes}`);
    } else {
      date = new Date(dateString);
    }
    
    if (isNaN(date.getTime())) {
      return ''
    }
    
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  } catch (error) {
    console.error('Error formatting date:', error)
    return ''
  }
}

/**
 * Проверка на просроченный дедлайн
 */
export const isDeadlineOverdue = (dateString) => {
  if (!dateString) return false
  
  try {
    let date;
    
    const russianFormat = /(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2})/;
    const match = dateString.match(russianFormat);
    
    if (match) {
      const [, day, month, year, hours, minutes] = match;
      date = new Date(`${year}-${month}-${day}T${hours}:${minutes}`);
    } else {
      date = new Date(dateString);
    }
    
    const now = new Date()
    return !isNaN(date.getTime()) && date < now
  } catch {
    return false
  }
}

/**
 * Проверяет валидность даты
 */
export const isInvalidDate = (dateString) => {
  if (!dateString) return false
  
  try {
    let date;
    
    const russianFormat = /(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2})/;
    const match = dateString.match(russianFormat);
    
    if (match) {
      const [, day, month, year, hours, minutes] = match;
      date = new Date(`${year}-${month}-${day}T${hours}:${minutes}`);
    } else {
      date = new Date(dateString);
    }
    
    const now = new Date()
    return !isNaN(date.getTime()) && date < now
  } catch {
    return false
  }
}
