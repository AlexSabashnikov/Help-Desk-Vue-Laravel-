<!-- 
    Индикатор уведомлений
    Иконка колокольчика с счётчиком непрочитанных уведомлений
    Выпадающий список уведомлений: изменение заявки, комментарии, прикрепление к заявке исполнителя
    Интегрирован с notifications.store
-->

<template>
  <UIIcons ref="uiIcons" />
  <div class="notification-bell" @click="toggleNotifications">
    <div class="bell-icon">
      <Icon :icon="uiIcons?.icons.notificationsBell" class="bell" width="25" height="25"/>
      <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
    </div>

    <!-- Выпадающий список уведомлений -->
    <div v-if="showNotifications" class="notifications-dropdown">
      <div class="dropdown-header">
        <h3>Уведомления</h3>
        <button @click="markAllAsRead" class="mark-all-btn">Прочитать все</button>
      </div>

      <div class="notifications-list">
        <div v-for="notification in notifications" :key="notification.id" class="notification-item">
          <div class="notification-content">
            <strong>{{ notification.title }}</strong>
            <p>{{ notification.message }}</p>
            <small>{{ notification.time }}</small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import UIIcons from '@/components/common/UI/UIIcons.vue'


const uiIcons = ref()
const showNotifications = ref(false)
const unreadCount = ref(3)

// Заглушка для уведомлений
const notifications = ref([
  {
    id: 1,
    title: 'Новый комментарий',
    message: 'В заявке #1001 добавлен комментарий',
    time: '5 мин назад',
  },
  {
    id: 2,
    title: 'Изменение статуса',
    message: 'Заявка #1002 переведена в "В работе"',
    time: '10 мин назад',
  },
  {
    id: 3,
    title: 'Назначение на заявку',
    message: 'Вы назначены на заявку #1003',
    time: '1 час назад',
  },
])

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
}

const markAllAsRead = () => {
  unreadCount.value = 0
  showNotifications.value = false
}
</script>

<style scoped>
.notification-bell {
  position: relative;
  cursor: pointer;
}

.bell-icon {
  position: relative;
  padding: 8px;
}

.bell{
  color:#ffbb00;
}

.bell:hover {
  color:#ecaa02;
  transform: scale(1.08);
}

.badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #ef4444;
  color: white;
  font-size: 12px;
  font-weight: bold;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notifications-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 320px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  margin-top: 8px;
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.dropdown-header h3 {
  margin: 0;
  font-size: 16px;
}

.mark-all-btn {
  background: none;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  font-size: 14px;
}

.mark-all-btn:hover {
  text-decoration: underline;
}

.notifications-list {
  max-height: 400px;
  overflow-y: auto;
}

.notification-item {
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.2s;
}

.notification-item:hover {
  background: #f9fafb;
}

.notification-content strong {
  display: block;
  margin-bottom: 4px;
  color: #1f2937;
}

.notification-content p {
  margin: 4px 0;
  color: #6b7280;
  font-size: 14px;
}

.notification-content small {
  color: #9ca3af;
  font-size: 12px;
}
</style>
