<template>
  <!-- Кнопка открытия фильтров -->
  <button class="filter-toggle-btn" @click="toggleFilters" type="button" aria-expanded="false">
    <span class="filter-icon">⚙️</span>
    <span>Фильтры</span>
  </button>

  <!-- Боковая панель фильтров (выезжает справа) -->
  <div class="filters-sidebar" :class="{ open: isOpen }" role="dialog" aria-modal="true" :aria-hidden="!isOpen">
    <div class="filters-header">
      <h3>Фильтры пользователей</h3>
      <button class="close-btn" @click="toggleFilters" aria-label="Закрыть">×</button>
    </div>

    <div class="filters-body">
      <!-- Роль -->
      <div class="filter-group">
        <label class="filter-label">Роль</label>
        <UISelect
          v-model="localFilters.role"
          :options="roleOptions"
          placeholder="Любая роль"
          class="filter-input"
        />
      </div>

      <!-- Организация -->
      <div class="filter-group">
        <label class="filter-label">Организация</label>
        <UISelect
          v-model="localFilters.organization"
          :options="organizationOptions"
          placeholder="Все организации"
          class="filter-input"
        />
      </div>

      <!-- Статус аккаунта -->
      <div class="filter-group">
        <label class="filter-label">Статус аккаунта</label>
        <UISelect
          v-model="localFilters.status"
          :options="statusOptions"
          placeholder="Любой статус"
          class="filter-input"
        />
      </div>

      <!-- Поиск по email/login -->
      <div class="filter-group">
        <label class="filter-label">Email / Логин</label>
        <UIInput v-model="localFilters.query" placeholder="Email, логин или ФИО" class="filter-input" />
      </div>

      <!-- Дата создания: диапазон -->
      <div class="filter-group">
        <label class="filter-label">Дата регистрации</label>
        <div class="date-range">
          <input type="date" v-model="localFilters.registeredFrom" class="date-input" />
          <input type="date" v-model="localFilters.registeredTo" class="date-input" />
        </div>
      </div>

      <!-- Заглушечные дополнительные поля (можно расширить) -->
      <div class="filter-group">
        <label class="filter-label">Дополнительно</label>
        <UISelect v-model="localFilters.roleExact" :options="[]"
          placeholder="(заглушка)" class="filter-input" />
      </div>
    </div>

    <div class="filter-actions">
      <UIButton variant="secondary" @click="resetFilters" class="reset-btn">Сбросить</UIButton>
      <UIButton @click="applyFilters" class="apply-btn">Применить</UIButton>
    </div>
  </div>

  <div v-if="isOpen" class="filters-overlay" @click="toggleFilters" aria-hidden="true"></div>
</template>

<script setup>
import { ref, watch, /*!computed,*/ onMounted, onUnmounted } from 'vue'
import UIInput from '@/components/common/UI/UIInput.vue'
import UISelect from '@/components/common/UI/UISelect.vue'
import UIButton from '@/components/common/UI/UIButton.vue'

/**
 * Props:
 *  - filters: Object (внешние фильтры, optional)
 *
 * Emits:
 *  - applyFilters(filtersObject)
 *  - resetFilters()
 */

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['applyFilters', 'resetFilters'])

const isOpen = ref(false)

// локальная копия фильтров
const localFilters = ref({
  role: '',
  organization: '',
  status: '',
  query: '',
  registeredFrom: '',
  registeredTo: '',
  // дополнительные поля-заглушки
  roleExact: '',
  ...props.filters,
})

// опции (заглушки) — заменить реальными данными позже
const roleOptions = [
  { value: 'admin', label: 'Администратор' },
  { value: 'dispatcher', label: 'Диспетчер' },
  { value: 'engineer', label: 'Инженер' },
  { value: 'client', label: 'Клиент' },
]

const organizationOptions = [
  { value: 'org_1', label: 'Пятёрочка №1837' },
  { value: 'org_2', label: 'Лента №182' },
  { value: 'org_3', label: 'СуперМаркет' },
]

const statusOptions = [
  { value: 'active', label: 'Активен' },
  { value: 'blocked', label: 'Заблокирован' },
  { value: 'pending', label: 'Ожидает подтверждения' },
]

// Синхронизация входящих props -> локальных фильтров
watch(
  () => props.filters,
  (v) => {
    localFilters.value = { ...localFilters.value, ...v }
  },
  { deep: true }
)

// Toggle
const toggleFilters = () => {
  isOpen.value = !isOpen.value
  if (!isOpen.value) {
    // при закрытии — ничего не делаем (состояние сохраняется)
  }
}

// Собираем и отправляем фильтры наружу (удаляем пустые)
const applyFilters = () => {
  const cleaned = Object.fromEntries(
    Object.entries(localFilters.value).filter(([, v]) => v !== '' && v !== null && v !== undefined)
  )
  emit('applyFilters', cleaned)
  toggleFilters()
}

// Сбрасываем только локально (и оповещаем наружу)
const resetFilters = () => {
  localFilters.value = {
    role: '',
    organization: '',
    status: '',
    query: '',
    registeredFrom: '',
    registeredTo: '',
    roleExact: '',
  }
  emit('resetFilters')
  toggleFilters()
}

// Закрытие по ESC
const handleKeydown = (e) => {
  if (e.key === 'Escape' && isOpen.value) {
    toggleFilters()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.filter-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 20px;
  background: #ffffff;
  border: 1px solid #c3c3c3;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-toggle-btn:hover {
  background: #dbe4ff;
  border-color: #0056e9;
}

.filter-toggle-btn:active {
  transform: translateY(1px);
}

.filters-sidebar {
  position: fixed;
  top: 0;
  right: -420px;
  width: 400px;
  height: 100vh;
  background: #fff;
  border-left: 1px solid #e5e7eb;
  z-index: 1400;
  transition: right 0.28s ease;
  display: flex;
  flex-direction: column;
}

.filters-sidebar.open { right: 0; }

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px;
  border-bottom: 1px solid #eee;
  background: #fafafa;
}

.filters-body {
  padding: 18px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.filter-group { display:flex; flex-direction:column; gap:6px; }
.filter-label { font-size:13px; font-weight:600; color:#374151; }

.date-range { display:flex; gap:8px; }
.date-input { padding:8px; border:1px solid #d1d5db; border-radius:6px; width:100%; }

.filter-actions { display:flex; gap:12px; padding:14px; border-top:1px solid #eee; justify-content:flex-end; background:#fafafa; }

.filters-overlay {
  position: fixed;
  inset: 0;
  z-index: 1390;
  background: rgba(0,0,0,0.12);
}
</style>