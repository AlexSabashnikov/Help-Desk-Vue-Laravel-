<!-- 
    Панель фильтров для заявок
    Фильтрация по полям заявки
    Сохранение наборов фильтров в localStorage
    Сброс фильтров, быстрые фильтры (Новые, Подходят к сроку, Просроченные)
-->

<template>
  <UIIcons ref="uiIcons" />
  <!-- Кнопка открытия фильтров -->
  <button class="filter-toggle-btn" @click="toggleFilters">
    <Icon :icon="uiIcons?.icons.filter" class="filter-icon" width="25" height="25" />
    <span>Фильтры</span>
  </button>

  <!-- Боковая панель фильтров (выезжает справа) -->
  <div class="filters-sidebar" :class="{ open: isOpen }">
    <!-- Заголовок панели -->
    <div class="filters-header">
      <h3>Фильтры</h3>
      <button class="close-btn" @click="toggleFilters" title="Закрыть">
        <Icon :icon="uiIcons?.icons.close" class="close-btn-icon" width="36" height="36" />
      </button>
    </div>

    <!-- Тело фильтров -->
    <div class="filters-body">
      <!-- Статус -->
      <div class="filter-group">
        <label class="filter-label">Статус</label>
        <UISelect
          v-model="localFilters.status"
          :options="statusOptions"
          placeholder="Все статусы"
          class="filter-input"
        />
      </div>

      <!-- Приоритет -->
      <div class="filter-group">
        <label class="filter-label">Приоритет</label>
        <UISelect
          v-model="localFilters.priority"
          :options="priorityOptions"
          placeholder="Все приоритеты"
          class="filter-input"
        />
      </div>

      <!-- Клиент -->
      <div class="filter-group">
        <label class="filter-label">Клиент</label>
        <UISelect
          v-model="localFilters.client"
          :options="clientOptions"
          placeholder="Все клиенты"
          class="filter-input"
        />
      </div>

      <!-- Исполнитель -->
      <div class="filter-group">
        <label class="filter-label">Исполнитель</label>
        <UISelect
          v-model="localFilters.executor"
          :options="executorOptions"
          placeholder="Все исполнители"
          class="filter-input"
        />
      </div>

      <!-- Период -->
      <div class="filter-group">
        <label class="filter-label">Период создания заявки</label>
        <div class="date-range">
          <div class="date-input-group">
            <label class="date-label">С:</label>
            <UIInput v-model="localFilters.dateFrom" type="date" class="date-input" />
          </div>
          <div class="date-input-group">
            <label class="date-label">По:</label>
            <UIInput v-model="localFilters.dateTo" type="date" class="date-input" />
          </div>
        </div>
      </div>

      <!-- Дополнительные фильтры -->
      <div class="filter-group">
        <label class="filter-label">Тип заявки</label>
        <UISelect
          v-model="localFilters.type"
          :options="typeOptions"
          placeholder="Все типы"
          class="filter-input"
        />
      </div>
    </div>

    <!-- Кнопки действий -->
    <div class="filter-actions">
      <UIButton variant="secondary" @click="resetFilters" class="reset-btn"> Сбросить </UIButton>
      <UIButton @click="applyFilters" class="apply-btn"> Применить </UIButton>
    </div>

    <!-- Затемнение фона при открытой панели -->
  </div>
  <div v-if="isOpen" class="filters-overlay" @click="toggleFilters"></div>
</template>

<script setup>
import { ref, watch } from 'vue'
import UIInput from '@/components/common/UI/UIInput.vue'
import UISelect from '@/components/common/UI/UISelect.vue'
import UIButton from '@/components/common/UI/UIButton.vue'
import { Icon } from '@iconify/vue'
import UIIcons from '@/components/common/UI/UIIcons.vue'


const uiIcons = ref()

const props = defineProps({
  filters: Object,
})

const emit = defineEmits(['applyFilters', 'resetFilters'])

const isOpen = ref(false)
const localFilters = ref({ ...props.filters })

const statusOptions = [
  { value: 'new', label: 'Новые' },
  { value: 'in_progress', label: 'В работе' },
  { value: 'completed', label: 'Выполнена' },
  { value: 'stopped', label: 'Работа остановлена' },
  { value: 'on_site', label: 'Выехал на объект' },
  { value: 'assigned', label: 'Назначена' },
  { value: 'waiting_payment', label: 'Ждет оплаты' },
  { value: 'rejected', label: 'Отказ заказчика' },
]

const priorityOptions = [
  { value: 'crit', label: 'Критичный' },
  { value: 'high', label: 'Высокий' },
  { value: 'medium', label: 'Средний' },
  { value: 'low', label: 'Низкий' },
]

//Интегрировать со справочником клиентов
const clientOptions = [
  { value: 'id1', label: 'Пятерочка 1837' },
  { value: 'id2', label: 'Лента 182' },
]

//Интегрировать со справочником инженеров
const executorOptions = [
  { value: 'id1', label: 'Иванов И.И.' },
  { value: 'id2', label: 'Сабашников А.Е.' },
]

const typeOptions = [
  { value: 'technical', label: 'Выездная заявка' },
  { value: 'consultation', label: 'Консультация' },
]

const toggleFilters = () => {
  isOpen.value = !isOpen.value
}

const applyFilters = () => {
  const cleanedFilters = Object.fromEntries(
    Object.entries(localFilters.value).filter(([v]) => v !== '' && v !== null),
  )
  emit('applyFilters', cleanedFilters)
  toggleFilters()
}

const resetFilters = () => {
  localFilters.value = {
    status: '',
    priority: '',
    client: '',
    executor: '',
    dateFrom: '',
    dateTo: '',
    type: '',
  }
  emit('resetFilters')
  toggleFilters()
}

// Синхронизация с внешними фильтрами
watch(
  () => props.filters,
  (newFilters) => {
    localFilters.value = {
      status: '',
      priority: '',
      client: '',
      executor: '',
      dateFrom: '',
      dateTo: '',
      type: '',
      ...newFilters,
    }
  },
  { deep: true },
)

// Закрытие по ESC
const handleKeydown = (e) => {
  if (e.key === 'Escape' && isOpen.value) {
    toggleFilters()
  }
}

// Добавляем обработчик клавиши ESC
import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
/* Кнопка открытия фильтров */
.filter-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 2px 10px;
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

.filter-icon {
  color:#0056e9;
}

/* Боковая панель фильтров */
.filters-sidebar {
  position: fixed;
  top: 0;
  right: -400px;
  width: 380px;
  height: 100vh;
  background: #f8f8f8;
  border-left: 2px solid rgb(165, 165, 165);
  z-index: 1201;
  transition: right 0.3s ease;
  display: flex;
  flex-direction: column;
}

.filters-sidebar.open {
  right: 0;
}

/* Заголовок панели */
.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.filters-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.close-btn {
  background: rgba(255, 255, 255, 0.1);
  color: rgb(46, 46, 46);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border:none;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  margin-left: 6px;
}

.close-btn:hover {
  transform: scale(1.1);
}

.close-btn-icon:hover {
  color: rgb(255, 19, 19);
}

/* Тело фильтров */
.filters-body {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.filter-input {
  width: 100%;
}

/* Период (даты) */
.date-range {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.date-input-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.date-label {
  min-width: 30px;
  font-size: 14px;
  color: #6b7280;
}

.date-input {
  flex: 1;
}

/* Кнопки действий */
.filter-actions {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.reset-btn {
  flex: 1;
  background: #ffffff;
  color: #374151;
  border: 1px solid #d1d5db;
}

.reset-btn:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.apply-btn {
  flex: 1;
  background: #16bd00;
  color: #ffffff;
  border: 1px solid #16bd00;
}

.apply-btn:hover {
  background: #14a800;
  border-color: #14a800;
}

/* Затемнение фона */
.filters-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1200;
  animation: fadeIn 0.2s ease;
  background: #00000027;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
