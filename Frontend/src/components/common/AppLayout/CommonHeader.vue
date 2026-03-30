<!-- src/components/common/AppLayout/CommonHeader.vue -->
<template>
  <header class="app-header" role="banner">
    <div class="interface-and-crumbs" aria-hidden="true">
      <!-- Имя панели по роли -->
      <div class="name-of-interface">
        <span v-if="userRole === 'admin'">Панель администратора</span>
        <span v-else-if="userRole === 'dispatcher'">Панель диспетчера</span>
        <span v-else-if="userRole === 'engineer'">Панель инженера</span>
        <span v-else-if="userRole === 'client'">Клиентский портал</span>
        <span v-else>Панель</span>
      </div>

      <!-- Навигационная цепочка 
      <div class="breadcrumbs">
        <slot name="breadcrumbs"></slot>
      </div>-->
    </div>

    <!-- Правая часть: уведомления и профиль -->
    <div class="header-right">
      <slot name="actions"></slot>
    </div>
  </header>
</template>

<script setup>
import { getUserRole } from '@/utils/auth.utils'

const userRole = getUserRole()
</script>

<style scoped>
:root {
  --sidebar-header-height: 55px;
}

/* Основной контейнер шапки */
.app-header {
  position: fixed;
  top: 0;
  left: var(--sidebar-width, 250px);
  width: calc(100% - var(--sidebar-width, 250px));
  height: 54px;
  min-height: var(--sidebar-header-height);
  line-height: 1;
  display: flex;
  align-items: center; /* вертикальное центрирование */
  justify-content: space-between;
  padding: 0 20px; /* уменьшим padding, чтобы не увеличивать высоту визуально */
  box-sizing: border-box; 
  background: rgb(255,255,255);
  z-index: 1199;
  gap: 12px;
}

/* Название интерфейса: ограничиваем высоту и выравниваем по центру */
.name-of-interface {
  margin-bottom: 0px;
  padding-left: 5%;
  font-size: 18px;
  font-weight: 500;
  color: #E5E4E2;
  line-height: var(--sidebar-header-height);
  height: var(--sidebar-header-height);
  white-space: nowrap;
  text-overflow: ellipsis;
}

.breadcrumbs {
  margin: 0;
  padding: 0;
  font-size: 12px;
  color: #5a5a5a;
  line-height: 1;
  cursor: pointer;
}

/* Мелкая адаптация при сжатии экрана */
@media (max-width: 1200px) {
  .app-header {
    left: var(--sidebar-width-collapsed, 80px);
    width: calc(100% - var(--sidebar-width-collapsed, 80px));
    padding: 0 14px;
  }
  .name-of-interface { font-size: 16px; }
  .breadcrumbs { font-size: 12px; }
}

/* Мобильный режим — сайдбар скрыт, шапка занимает всю ширину */
@media (max-width: 768px) {
  .app-header {
    left: 0;
    width: 100%;
    padding: 0 12px;
  }
  .breadcrumbs { display: none; }
  .name-of-interface { font-size: 16px; line-height: var(--sidebar-header-height); }
}
</style>
