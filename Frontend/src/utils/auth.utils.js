export const emitAuthEvent = (eventType) => {
  const event = new CustomEvent('auth-notification', {
    detail: { type: eventType }
  })
  window.dispatchEvent(event)
  console.log(`📢 Auth event emitted: ${eventType}`)
}

export const clearAuthData = (emitEvent) => {

  // Очищаем localStorage
  localStorage.removeItem('user')
  localStorage.removeItem('currentPath')
  console.log("EVENT: ", emitEvent)
  if (emitEvent) {
    emitAuthEvent('sessionExpired')
  }
  
  console.log('🧹 Данные авторизации очищены')
}

export const getUserRole = () => {
  let userRole = null
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      const user = JSON.parse(userStr)
      userRole = user.role.name
    } catch (e) {
      console.error('Error parsing user for role check:', e)
    }
  }
  return userRole
}

export const getUserId = () => {
  let userId = null
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      const user = JSON.parse(userStr)
      userId = user.id
    } catch (e) {
      console.error('Error parsing user for role check:', e)
    }
  }
  return userId
}

export const roleConversion = (role) => {
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

export const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return 'Администратор'
      case 'dispatcher':
        return 'Диспетчер'
      case 'engineer':
        return 'Инженер'
      case 'client':
        return 'Клиент'
      default:
        return null
    }
  }