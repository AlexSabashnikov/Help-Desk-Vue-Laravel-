<template>
  <div v-if="showLoginSuccess || showSessionExpired" class="session-notifications">
    <!-- Уведомление об успешном входе -->
    <Transition name="slide-fade">
      <div 
        v-if="showLoginSuccess" 
        class="notification notification-success"
      >
        <div class="notification-content">
          <div class="notification-title">Авторизация успешна!</div>
          <div class="notification-message">Вы успешно вошли в систему</div>
        </div>
      </div>
    </Transition>

    <!-- Уведомление об истечении сессии -->
    <Transition name="slide-fade">
      <div 
        v-if="showSessionExpired" 
        class="notification notification-warning"
      >
        <div class="notification-content">
          <div class="notification-title">Сессия истекла!</div>
          <div class="notification-message">Пожалуйста, войдите снова</div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount} from 'vue'

// Реактивные состояния
const showLoginSuccess = ref(false)
const showSessionExpired = ref(false)

// Таймеры
let loginSuccessTimer = null
let sessionExpiredTimer = null

// Методы
const showLoginSuccessNotification = () => {
    showLoginSuccess.value = true
    
    if (loginSuccessTimer) clearTimeout(loginSuccessTimer)
    loginSuccessTimer = setTimeout(() => {
      showLoginSuccess.value = false
    }, 5000)
}

const showSessionExpiredNotification = () => {
    showSessionExpired.value = true
    
    if (sessionExpiredTimer) clearTimeout(sessionExpiredTimer)
    sessionExpiredTimer = setTimeout(() => {
      showSessionExpired.value = false
    }, 5000)
}

// Слушаем глобальные события
onMounted(() => {
  window.addEventListener('auth-notification', handleAuthNotification)
  console.log('SessionNotifications mounted and listening for events')
})

const handleAuthNotification = (event) => {
  console.log('SessionNotifications received event:', event.detail.type)
  
  const { type } = event.detail
  
  if (type === 'loginSuccess') {
    showLoginSuccessNotification()
  } else if (type === 'sessionExpired') {
    showSessionExpiredNotification()
  }
}

// Очистка
onBeforeUnmount(() => {
  window.removeEventListener('auth-notification', handleAuthNotification)
  if (loginSuccessTimer) clearTimeout(loginSuccessTimer)
  if (sessionExpiredTimer) clearTimeout(sessionExpiredTimer)
})
</script>

<style scoped>
.session-notifications {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  max-width: 450px;
}

.notification {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  margin-bottom: 12px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.notification:hover {
  transform: translateY(-2px);
}

.notification-success {
  background-color: #d6ffcf;
  border-left: 4px solid #1ca008;
  color: #1ca008;
}

.notification-warning {
  background-color: #ffdcdc;
  border-left: 4px solid #b30000;
  color: #b30000;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 4px;
}

.notification-message {
  font-size: 14px;
  opacity: 0.9;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.slide-fade-enter-to,
.slide-fade-leave-from {
  transform: translateX(0);
  opacity: 1;
}
</style>