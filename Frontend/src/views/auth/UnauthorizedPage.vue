<!--
  Страница отсутствия доступа (403)
  Отображается, если пользователь авторизован,
  но не имеет прав на запрошенный ресурс
-->

<template>
  <div class="unauthorized-page">
    <div class="unauthorized-card">
      <h1 class="status-code">403</h1>
      <h2 class="title">Доступ запрещён</h2>

      <p class="description">
        У вас нет прав для просмотра этой страницы.
        Если вы считаете, что это ошибка — обратитесь к администратору.
      </p>

      <div class="actions">
        <UIButton variant="primary" @click="goHome">
          На главную
        </UIButton>

        <UIButton variant="secondary" @click="requestAccess">
          Запросить доступ
        </UIButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import UIButton from '@/components/common/UI/UIButton.vue'
import { useAuthStore } from '@/stores/auth.store'

const authStore = useAuthStore()

// Заглушки — реальная логика будет через router + backend
const goHome = () => {
  console.log('Переход на главную страницу в зависимости от роли')
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      const user = JSON.parse(userStr)
      let userRole = user.role
      console.log("userRole ", userRole)
      authStore.redirectByRole(userRole)
    } catch (e) {
      console.error('Error parsing user for role check:', e)
    }
  }
}

const requestAccess = () => {
  console.log('Запрос доступа (заглушка)')
}
</script>

<style scoped>
.unauthorized-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
}

.unauthorized-card {
  background: #ffffff;
  padding: 40px;
  border-radius: 12px;
  max-width: 480px;
  width: 100%;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.582);
}

.status-code {
  font-size: 72px;
  font-weight: 700;
  color: #ef4444;
  margin-bottom: 10px;
}

.title {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 12px;
}

.description {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 28px;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}
</style>
