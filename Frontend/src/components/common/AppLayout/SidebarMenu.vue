<!-- 
    Боковое меню навигации
    Автоматически меняется в зависимости от роли пользователя
    Навигация по разделам: Заявки, Справочники, Аналитика
    Состояние раскрытия/сворачивания сохраняется в localStorage
-->

<template>
  
  <aside class="sidebar-menu" :class="{ open: !isCollapsed }">
    <UIIcons ref="uiIcons" />
    <!-- Шапка сайдбара -->
    <div class="sidebar-header">
      <h1 class="logo">Help Desk</h1>

      <!-- Кнопка сворачивания/разворачивания в шапке -->
      <button class="collapse-btn" @click="toggleSidebar">

        <Icon 
          :icon="uiIcons?.icons.menuSidebar"
          class="arrow-icon"
          :class="{ rotated: !isCollapsed }"
          width="36"
          height="36"
        />
      </button>
    </div>

    <!-- Навигационная часть (открывается/закрывается) -->
    <nav class="sidebar-nav" :class="{ open: !isCollapsed }">
      <!-- Меню для администратора -->
      <ul v-if="userRole === 'admin'" class="nav-list">
        <!-- Заявки -->
        <li class="nav-item">
          <div class="nav-section" @click="toggleSection('tickets')">
            <span class="nav-text">
              <Icon :icon="uiIcons?.icons.tickets" width="22" height="22" class="nav-icon" />
              Заявки
            </span>
            <Icon 
              :icon="uiIcons?.icons.arrowUp"
              class="arrow-icon-small"
              :class="{ rotated: !isOpen.tickets }"
              width="28"
              height="28"
            />
          </div>
          <ul v-if="isOpen.tickets" class="submenu">
            <li>
              <RouterLink to="/admin/tickets" class="nav-link">
                <Icon :icon="uiIcons?.icons.allTickets" width="20" height="20" class="nav-icon-small" />
                Все заявки
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/admin/tickets/create" class="nav-link">
                <Icon :icon="uiIcons?.icons.createTicket" width="20" height="20" class="nav-icon-small" />
                Создать заявку
              </RouterLink>
            </li>
          </ul>
        </li>

        <!-- Справочники -->
        <li class="nav-item">
          <div class="nav-section" @click="toggleSection('directories')">
            <span class="nav-text">
              <Icon :icon="uiIcons?.icons.directories" width="20" height="20" class="nav-icon" />
              Справочники
            </span>
            <Icon 
              :icon="uiIcons?.icons.arrowUp"
              :class="{ rotated: !isOpen.directories }"
              class="arrow-icon-small"
              width="28"
              height="28"
            />
          </div>
          <ul v-if="isOpen.directories" class="submenu">
            <li>
              <RouterLink to="/admin/directories/companies" class="nav-link">
                <Icon :icon="uiIcons?.icons.companies" width="20" height="20" class="nav-icon-small" />
                Организации
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/admin/directories/users" class="nav-link">
                <Icon :icon="uiIcons?.icons.users" width="20" height="20" class="nav-icon-small" />
                Пользователи
              </RouterLink>
            </li>
          </ul>
        </li>

        <!-- Аналитика -->
        <li class="nav-item">
          <div class="nav-section" @click="toggleSection('analytics')">
            <span class="nav-text">
              <Icon :icon="uiIcons?.icons.analytics" width="22" height="22" class="nav-icon" />
              Аналитика
            </span>
            <Icon 
              :icon="uiIcons?.icons.arrowUp"
              :class="{ rotated: !isOpen.analytics }"
              class="arrow-icon-small"
              width="28"
              height="28"
            />
          </div>
          <ul v-if="isOpen.analytics" class="submenu">
            <li>
              <RouterLink to="/admin/analytics/general" class="nav-link">
                <Icon :icon="uiIcons?.icons.generalAnalytics" width="20" height="20" class="nav-icon-small" />
                Общая аналитика
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/admin/analytics/reports" class="nav-link">
                <Icon :icon="uiIcons?.icons.reports" width="20" height="20" class="nav-icon-small" />
                Отчеты
              </RouterLink>
            </li>
          </ul>
        </li>
      </ul>

      <!-- Меню для диспетчера -->
      <ul v-if="userRole === 'dispatcher'" class="nav-list">
        <!-- Заявки -->
        <li class="nav-item">
          <div class="nav-section" @click="toggleSection('tickets')">
            <span class="nav-text">
              <Icon :icon="uiIcons?.icons.tickets" width="22" height="22" class="nav-icon" />
              Заявки
            </span>
            <Icon 
              :icon="uiIcons?.icons.arrowUp"
              class="arrow-icon-small"
              :class="{ rotated: !isOpen.tickets }"
              width="28"
              height="28"
            />
          </div>
          <ul v-if="isOpen.tickets" class="submenu">
            <li>
              <RouterLink to="/dispatcher/tickets" class="nav-link">
                <Icon :icon="uiIcons?.icons.allTickets" width="20" height="20" class="nav-icon-small" />
                Все заявки
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/dispatcher/tickets/create" class="nav-link">
                <Icon :icon="uiIcons?.icons.createTicket" width="20" height="20" class="nav-icon-small" />
                Создать заявку
              </RouterLink>
            </li>
          </ul>
        </li>

        <!-- Справочники -->
        <li class="nav-item">
          <div class="nav-section" @click="toggleSection('directories')">
            <span class="nav-text">
              <Icon :icon="uiIcons?.icons.directories" width="22" height="22" class="nav-icon" />
              Справочники
            </span>
            <Icon 
              :icon="uiIcons?.icons.arrowUp"
              :class="{ rotated: !isOpen.directories }"
              class="arrow-icon-small"
              width="28"
              height="28"
            />
          </div>
          <ul v-if="isOpen.directories" class="submenu">
            <li>
              <RouterLink to="/dispatcher/directories/companies" class="nav-link">
                <Icon :icon="uiIcons?.icons.companies" width="20" height="20" class="nav-icon-small" />
                Организации
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/dispatcher/directories/users" class="nav-link">
                <Icon :icon="uiIcons?.icons.users" width="20" height="20" class="nav-icon-small" />
                Пользователи
              </RouterLink>
            </li>
          </ul>
        </li>

        <!-- Аналитика -->
        <li class="nav-item">
          <div class="nav-section" @click="toggleSection('analytics')">
            <span class="nav-text">
              <Icon :icon="uiIcons?.icons.analytics" width="22" height="22" class="nav-icon" />
              Аналитика
            </span>
            <Icon 
              :icon="uiIcons?.icons.arrowUp"
              :class="{ rotated: !isOpen.analytics }"
              class="arrow-icon-small"
              width="28"
              height="28"
            />
          </div>
          <ul v-if="isOpen.analytics" class="submenu">
            <li>
              <RouterLink to="/dispatcher/analytics/general" class="nav-link">
                <Icon :icon="uiIcons?.icons.generalAnalytics" width="20" height="20" class="nav-icon-small" />
                Общая аналитика
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/dispatcher/analytics/reports" class="nav-link">
                <Icon :icon="uiIcons?.icons.reports" width="20" height="20" class="nav-icon-small" />
                Отчеты
              </RouterLink>
            </li>
          </ul>
        </li>
      </ul>

      <!-- Меню для клиента -->
      <ul v-if="userRole === 'client'" class="nav-list">
        <!-- Заявки -->
        <li class="nav-item">
          <div class="nav-section" @click="toggleSection('tickets')">
            <span class="nav-text">
              <Icon :icon="uiIcons?.icons.tickets" width="22" height="22" class="nav-icon" />
              Заявки
            </span>
            <Icon 
              :icon="uiIcons?.icons.arrowUp"
              :class="{ rotated: !isOpen.tickets }"
              class="arrow-icon-small"
              width="28"
              height="28"
            />
          </div>
          <ul v-if="isOpen.tickets" class="submenu">
            <li>
              <RouterLink to="/client/tickets" class="nav-link">
                <Icon :icon="uiIcons?.icons.allTickets" width="20" height="20" class="nav-icon-small" />
                Мои заявки
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/client/tickets/create" class="nav-link">
                <Icon :icon="uiIcons?.icons.createTicket" width="20" height="20" class="nav-icon-small" />
                Создать заявку
              </RouterLink>
            </li>
          </ul>
        </li>

        <!-- Аналитика -->
        <li class="nav-item">
          <div class="nav-section" @click="toggleSection('analytics')">
            <span class="nav-text">
              <Icon :icon="uiIcons?.icons.analytics" width="18" height="18" class="nav-icon" />
              Аналитика
            </span>
            <Icon 
              :icon="uiIcons?.icons.arrowUp"
              :class="{ rotated: !isOpen.analytics }"
              class="arrow-icon-small"
              width="28"
              height="28"
            />
          </div>
          <ul v-if="isOpen.analytics" class="submenu">
            <li>
              <RouterLink to="/client/analytics/general" class="nav-link">
                <Icon :icon="uiIcons?.icons.generalAnalytics" width="20" height="20" class="nav-icon-small" />
                Общая аналитика
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/client/analytics/reports" class="nav-link">
                <Icon :icon="uiIcons?.icons.reports" width="20" height="20" class="nav-icon-small" />
                Отчеты
              </RouterLink>
            </li>
          </ul>
        </li>
      </ul>

      <!-- Меню для инженера -->
      <ul v-if="userRole === 'engineer'" class="nav-list">
        <!-- Заявки -->
        <li class="nav-item">
          <div class="nav-section" @click="toggleSection('tickets')">
            <span class="nav-text">
              <Icon :icon="uiIcons?.icons.tickets" width="22" height="22" class="nav-icon" />
              Заявки
            </span>
            <Icon 
              :icon="uiIcons?.icons.arrowUp"
              :class="{ rotated: !isOpen.tickets }"
              class="arrow-icon-small"
              width="28"
              height="28"
            />
          </div>
          <ul v-if="isOpen.tickets" class="submenu">
            <li>
              <RouterLink to="/engineer/tickets" class="nav-link">
                <Icon :icon="uiIcons?.icons.allTickets" width="20" height="20" class="nav-icon-small" />
                Мои заявки
              </RouterLink>
            </li>
          </ul>
        </li>

        <!-- Календарь -->
        <li class="nav-item">
          <div class="nav-section" @click="toggleSection('calendar')">
            <span class="nav-text">
              <Icon :icon="uiIcons?.icons.calendar" width="22" height="22" class="nav-icon" />
              Расписание
            </span>
            <Icon 
              :icon="uiIcons?.icons.arrowUp"
              :class="{ rotated: !isOpen.calendar }"
              class="arrow-icon-small"
              width="28"
              height="28"
            />
          </div>
          <ul v-if="isOpen.calendar" class="submenu">
            <li>
              <RouterLink to="/engineer/calendar" class="nav-link">
                <Icon :icon="uiIcons?.icons.calendar" width="20" height="20" class="nav-icon-small" />
                Календарь работ
              </RouterLink>
            </li>
          </ul>
        </li>
      </ul>
    </nav>

    <!-- Затемнение фона при открытом сайдбаре -->
    <div v-if="!isCollapsed" class="sidebar-backdrop" @click="toggleSidebar"></div>
  </aside>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { getUserRole } from '@/utils/auth.utils'
import { Icon } from '@iconify/vue'
import UIIcons from '@/components/common/UI/UIIcons.vue'

const uiIcons = ref()
const userRole = getUserRole()

const isOpen = ref({})
const isCollapsed = ref(true)
const route = useRoute()

// Инициализируем состояние открытых секций в зависимости от роли
const initializeOpenSections = () => {
  // Получаем роль из localStorage напрямую
  if (userRole === 'admin') {
    isOpen.value = {
      tickets: false,
      directories: false,
      analytics: false,
    }
  } else if (userRole === 'dispatcher') {
    isOpen.value = {
      tickets: false,
      directories: false,
      analytics: false,
    }
  } else if (userRole === 'engineer') {
    isOpen.value = {
      tickets: false,
      calendar: false,
    }
  } else if (userRole === 'client') {
    isOpen.value = {
      tickets: false,
      analytics: false,
    }
  }
}

// Открытие/закрытие сайдбара
const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value

  // При открытии сайдбара
  if (!isCollapsed.value) {
    // Блокируем прокрутку body
    document.body.style.overflow = 'hidden'

    // Открываем активный раздел при открытии
    const currentPath = route.path
    const rolePrefix = `/${userRole}/`
    
    if (currentPath.includes(`${rolePrefix}tickets`)) {
      if (userRole === 'admin') {
        isOpen.value.tickets = true
      } else if (userRole === 'dispatcher') {
        isOpen.value.tickets = true }
      else if (userRole === 'engineer') {
        isOpen.value.tickets = true
      } else if (userRole === 'client') {
        isOpen.value.myTickets = true
      }
    } else if (currentPath.includes(`${rolePrefix}directories`)) {
      isOpen.value.directories = true
    } else if (currentPath.includes(`${rolePrefix}analytics`)) {
      isOpen.value.analytics = true
    }
  } else {
    // Восстанавливаем прокрутку при закрытии
    document.body.style.overflow = ''
    // Закрываем все подменю при закрытии сайдбара
    Object.keys(isOpen.value).forEach((key) => {
      isOpen.value[key] = false
    })
  }
}

// Переключение секции
const toggleSection = (section) => {
  if (!isCollapsed.value) {
    isOpen.value[section] = !isOpen.value[section]
  }
}

// Закрытие по ESC
const handleKeydown = (e) => {
  if (e.key === 'Escape' && !isCollapsed.value) {
    toggleSidebar()
  }
}

// Добавляем обработчики
onMounted(() => {
  initializeOpenSections()
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  // Восстанавливаем прокрутку при размонтировании
  document.body.style.overflow = ''
})
</script>

<style scoped>
/* Основной контейнер сайдбара */
.sidebar-menu {
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1200;
}

/* Шапка сайдбара (всегда видимая и неизменная) */
.sidebar-header {
  position: fixed;
  left: 0;
  top: 0;
  width: 250px;
  padding: 0 20px;
  border-bottom: 3px solid #16bd00;
  border-right: 3px solid #16bd00;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 54px;
  background: #031432;
  z-index: 1002;
}

.logo {
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  white-space: nowrap;
}

.collapse-btn {
  width: 42px;
  height: 42px;
  background:#031432;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.collapse-btn:hover {
  background: #16bd0065;
  transform: scale(1.05);
}

.arrow-icon {
  color: #16bd00;
  transition: all 0.3s ease;
  rotate: 180deg;
}

.arrow-icon.rotated {
  transform: rotate(180deg);
}

/* Навигационная часть */
.sidebar-nav {
  position: fixed;
  left: 0;
  top: 54px;
  width: 250px;
  height: calc(100vh - 54px);
  background: #031432;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  z-index: 1001;
  overflow-y: auto;
}

.sidebar-nav.open {
  transform: translateX(0);
}

/* Навигационный список */
.nav-list {
  font-size: 16px;
  font-style: normal;
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  margin-bottom: 0;
}

.nav-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #152362;
  padding: 6px 20px;
  cursor: pointer;
  transition: background 0.2s;
  user-select: none;
  color: #ffffff;
}

.nav-text {
  flex: 1;
  display: flex;
  align-items: center; /* Центрируем содержимое по вертикали */
  gap: 10px; /* Расстояние между иконкой и текстом */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1; /* Убираем лишние отступы от line-height */
}

.arrow-icon-small {
  color: #16bd00;
  margin-left: 8px;
  flex-shrink: 0;
  display: inline-block;
  transition: transform 0.3s ease;
}

.arrow-icon-small.rotated {
  transform: rotate(180deg);
}


/* Подменю */
.submenu {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
  width: 100%;
}

.nav-item:has(.nav-section) .submenu {
  max-height: 200px;
}
.nav-item:has(.nav-link.router-link-active) .submenu {
  max-height: 200px;
}

.submenu li {
  border-left: 3px solid transparent;
  border-bottom: 2px solid #1d2c6f;
  transition: border-color 0.2s;
}

.nav-link {
  align-items: center; /* Центрируем содержимое по вертикали */
  gap: 10px; /* Расстояние между иконкой и текстом */
  display: flex;
  margin-left: 30px;
  padding: 5px 20px 5px 30px;
  color: #ffffff;
  text-decoration: none;
  transition: all 0.2s;
  width: 100%;
}

.nav-link:hover {
  color: #16bd00;
  background: rgba(22, 189, 0, 0.1);
}

.nav-link.router-link-active {
  color: #000000;
  background: #e4e4e4;
  padding: 5px 10px 5px 20px;
  border-left: 8px solid #16bd00;
}

/* Затемнение фона при открытом сайдбаре */
.sidebar-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.095);
  z-index: 999;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Анимации */
@keyframes slideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}
</style>
