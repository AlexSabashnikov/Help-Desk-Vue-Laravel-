<!--
  Страница восстановления пароля
  Пользователь вводит email для получения инструкции
  Версия: ForgotPasswordPage_v1
-->

<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1 class="auth-title">Восстановление пароля</h1>
      <p class="auth-description">
        Укажите адрес электронной почты, связанный с вашей учетной записью.
        Мы отправим инструкции по восстановлению пароля.
      </p>

      <form class="auth-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="user@example.com"
            required
          />
        </div>

        <button type="submit" class="submit-btn">
          Отправить инструкции
        </button>
      </form>

      <div class="auth-footer">
        <RouterLink to="/auth/login">
          Вернуться к входу
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const email = ref('')

const handleSubmit = () => {
  // Заглушка: логика будет реализована на backend
  console.log('Запрос восстановления пароля для:', email.value)
}
</script>

<style scoped>
.auth-page {
  min-height: calc(100vh - 200px); 
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  background: #ffffff;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.449);
}

.auth-title {
  font-size: 22px;
  margin-bottom: 10px;
  text-align: center;
}

.auth-description {
  font-size: 14px;
  color: #555;
  margin-bottom: 20px;
  text-align: center;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 13px;
  margin-bottom: 4px;
  color: #333;
}

.form-group input {
  padding: 8px 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 14px;
}

.form-group input:focus {
  outline: none;
  border-color: #4dabf7;
}

.submit-btn {
  background-color: #4dabf7;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  padding: 10px;
  font-size: 14px;
  cursor: pointer;
}

.submit-btn:hover {
  background-color: #339af0;
}

.auth-footer {
  margin-top: 20px;
  text-align: center;
}

.auth-footer a {
  font-size: 13px;
  color: #4dabf7;
  text-decoration: none;
}

.auth-footer a:hover {
  text-decoration: underline;
}
</style>
