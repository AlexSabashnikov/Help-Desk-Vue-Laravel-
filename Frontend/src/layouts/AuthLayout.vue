<!-- 
    Макет страниц авторизации
    Форма входа
    Перенаправление авторизованных пользователей на главную (Список заявок)
-->

<template>
  <div class="auth-layout">
    <main class="auth-main">
      <slot />
    </main>
  </div>
</template>

<script setup>
</script>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f7fafc;
}

/* Контент выравнивается по верхнему краю, не по центру */
.auth-main {
  margin-top: 60px; /* учитывать фиксированную шапку */
  display: flex;
  justify-content: center; /* горизонтально центрируем карточку */
  align-items: flex-start;  
  padding: 20px;
  box-sizing: border-box;
}
</style>