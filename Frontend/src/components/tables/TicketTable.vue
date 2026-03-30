<!-- 
    Таблица заявок с расширенной функциональностью
    Использует базовый CommonTable.vue, добавляя специфичные колонки
    Колонки: Приоритет, №, Тема, Клиент, Статус, Исполнитель, Дата
    Интеграция с tickets.store для фильтрации и сортировки
-->

<template>
  <div class="ticket-table-wrapper">
    <!-- Общий компонент таблицы -->
    <UIIcons ref="uiIcons" />
    <UITable
      :columns="columns"
      :data="formattedTickets"
      :grid-template-columns="gridTemplateColumns"
      :loading="loading"
      :sortable="true"
      :pagination="true"
      :page-size="pagination.per_page"
      :current-page="pagination.current_page"
      :show-page-size-selector="false"
      :show-page-jump="false"
      :total-items="pagination.total"
      :last-page="pagination.last_page"
      :from="pagination.from"
      :to="pagination.to"
      :links="pagination.links"
      :prev-page-url="pagination.prev_page_url"
      :next-page-url="pagination.next_page_url"
      @rowClick="handleRowClick"
      @sortChange="handleSortChange"
      @pageChange="handlePageChange"
    >
      <!-- Кастомный слот для колонки "Приоритет" -->
      <template #cell-priority="{ value }">
        <div :class="`priority-indicator priority-${value}`" :title="getPriorityLabel(value)">
          <!-- Невидимый текст для сохранения высоты строки -->
          <span class="priority-text" aria-hidden="true">&nbsp;</span>
        </div>
      </template>

      <!-- Кастомный слот для колонки "Статус" -->
      <template #cell-status="{ value }">
        <span :class="`status-badge status-${value}`">
          {{ getStatusLabel(value) }}
        </span>
      </template>

      <!-- Кастомный слот для колонки "№ заявки" -->
      <template #cell-number="{ value }">
        <span class="ticket-number">
          {{ value }}
        </span>
      </template>

      <!-- Кастомный слот для колонки "Тема" -->
      <template #cell-subject="{ value }">
        <div class="ticket-subject" :title="value">
          {{ truncateText(value, 50) }}
        </div>
      </template>

      <template #cell-deadline="{ value, row }">
        <span
        :class="['deadline-cell', row.deadlineClass]"
        >
          {{ value }}
          <span v-if="row.deadlineClass === 'deadline-overdue'"></span>
          <span v-if="row.deadlineClass === 'deadline-approaching'"></span>
        </span>
      </template>

      <!-- Кастомный слот для колонки "Редактирование" -->
      <template #cell-edit="{ row }">
        <button class="edit-btn" @click.stop="handleEdit(row)" title="Редактировать заявку">
          <Icon 
            :icon="uiIcons?.icons.ticketEdit"
            width="20"
            height="20"
          />
        </button>
      </template>

      <!-- Слот для состояния загрузки -->
      <template #loading>
        <div class="custom-loading">
          <div class="spinner"></div>
          <span>Загрузка заявок...</span>
        </div>
      </template>

      <!-- Слот для пустого состояния -->
      <template #empty>
        <div class="custom-empty">
          <Icon 
            :icon="uiIcons?.icons.ticketsLoadEmpty"
            class="empty-icon"
            width="80"
            height="80"
          />
          <span>Заявки не найдены</span>
          <p>Попробуйте изменить параметры фильтрации</p>
        </div>
      </template>
    </UITable>

    <!-- Модальное окно карточки заявки -->
    <TicketCard
      v-if="selectedTicket"
      :visible="showModal"
      :ticket="selectedTicket"
      :mode="currentMode"
      @close="closeModal"
      @edit="handleEditTicket"
      @save="handleSaveTicket"
    />
  </div>
</template>

<script setup>
import { computed, defineProps, ref } from 'vue'
import UITable from '@/components/common/UI/UITable.vue'
import TicketCard from '@/views/admin/tickets/TicketCard.vue'
import { getUserRole } from '@/utils/auth.utils'
import {
  truncateText,
  getPriorityLabel,
  getStatusLabel,
  formatTicketsForTable
} from '@/utils/ticket.utils'
import { Icon } from '@iconify/vue'
import UIIcons from '@/components/common/UI/UIIcons.vue'

const uiIcons = ref()

const props = defineProps({
  tickets: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  pagination: {
    type: Object,
    default: () => ({
      current_page: 1,
      last_page: 1,
      per_page: 20,
      total: 0,
      links: [],
      from: 0,
      to: 0
    })
  },
})

const emit = defineEmits(['rowClick', 'pageChange', 'sortChange', 'edit', 'delete'])

// Локальное состояние для модального окна
const showModal = ref(false)
const selectedTicket = ref(null)
const userRole = getUserRole()

// Преобразуем данные для таблицы с использованием утилит
const formattedTickets = computed(() => {
  return formatTicketsForTable(props.tickets)
})

const columns = [
  { key: 'priority', title: '', align: 'left' },
  { key: 'number', title: '№ заявки', align: 'left' },
  { key: 'subject', title: 'Тема', align: 'left' },
  { key: 'clientName', title: 'Клиент', align: 'left' },
  { key: 'status', title: 'Статус', align: 'center' },
  { key: 'executorName', title: 'Исполнитель', align: 'left' },
  { key: 'createdAt', title: 'Время создания', align: 'left' },
  { key: 'deadline', title: 'Срок', align: 'left' },
  { key: 'edit', title: '',  align: 'left' },
]

// Grid шаблон
const gridTemplateColumns = computed(() => {
  return '1fr 4fr 10fr 7fr 6fr 7fr 5fr 5fr 2fr'
})

// Добавляем режим
const currentMode = ref('view') // 'view' или 'edit'

// Обработчик редактирования из кнопки в таблице
const handleEdit = (row) => {
  // Проверяем, имеет ли пользователь права администратора
  if (userRole === 'admin' || userRole === 'dispatcher') {
    selectedTicket.value = {
      ...row,
      type: row.type,
      contactPerson: row.contactPerson,
      phone: row.phone,
      email: row.email,
      description: row.description,
      workStart: row.workStart,
      workEnd: row.workEnd,
      workCost: row.workCost,
      requestMethod: row.requestMethod,
      distance: row.distance,
      materials: row.materials,
    }
    currentMode.value = 'edit' // Устанавливаем режим редактирования
    showModal.value = true
  } else {
    alert('У вас нет прав для редактирования заявок')
  }
}

// Обработчик клика по строке таблицы
const handleRowClick = (row) => {
  selectedTicket.value = {
    ...row,
    type: row.type,
    contactPerson: row.contactPerson,
    phone: row.phone,
    email: row.email,
    description: row.description,
    workStart: row.workStart,
    workEnd: row.workEnd,
    workCost: row.workCost,
    requestMethod: row.requestMethod,
    distance: row.distance,
    materials: row.materials,
  }
  currentMode.value = 'view' // Устанавливаем режим просмотра
  showModal.value = true
  emit('rowClick', row)
}

// Обработчик сохранения
const handleSaveTicket = (updatedTicket) => {
  // Здесь будет логика сохранения изменений
  console.log('Сохранение заявки:', updatedTicket)
  emit('save', updatedTicket)
  currentMode.value = 'view' // Возвращаемся в режим просмотра
}

// При закрытии модального окна сбрасываем режим
const closeModal = () => {
  showModal.value = false
  selectedTicket.value = null
  currentMode.value = 'view'
}

// Обработчик редактирования из модального окна
const handleEditTicket = (ticket) => {
  closeModal()
  emit('edit', ticket)
}

const handleSortChange = (sortOptions) => {
  emit('sortChange', sortOptions)
}

const handlePageChange = (page) => {
  emit('pageChange', page)
}
</script>

<style scoped>
.ticket-table-wrapper {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

:deep(.grid-cell:has(.priority-indicator)) {
  padding: 0px 10px !important; /* Убираем padding */
  max-height: none !important; /* Убираем ограничение высоты */
  height: 98%; /* Растягиваем на всю высоту */
}

:deep(.grid-row) {
  position: relative; /* Для корректного позиционирования */
}

.priority-indicator {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: stretch; /* Растягиваем по вертикали */
  justify-content: center;
  min-height: 39px; /* Соответствует высоте строки */
}

.priority-text {
  visibility: hidden;
  font-size: 0;
  line-height: 0;
}

.priority-crit {
  background: linear-gradient(to right, #e90000 0px, #e90000 8px, transparent 8px);
}

.priority-high {
  background: linear-gradient(to right, #e98c00 0px, #e98c00 8px, transparent 8px);
}

.priority-medium {
  background: linear-gradient(to right, #e9da00 0px, #e9da00 8px, transparent 8px);
}

.priority-low {
  background: linear-gradient(to right, #16bd00 0px, #16bd00 8px, transparent 8px);
}

/* Бейдж статуса */
.status-badge {
  display: inline-block;
  padding: 6px 8px;
  border-radius: 14px;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  min-width: 90px;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.2; /* Фиксированный line-height */
}

.status-new {
  background: #d0e2ff;
  color: rgb(11, 38, 146);
  border: 2px solid rgb(11, 38, 146);
}

.status-assigned {
  background: #d0f2ff;
  color: #1caae2;
  border: 2px solid #1caae2;
}

.status-inProgress {
  background: #fffbbf;
  color: #938900;
  border: 2px solid #d3c500;
}

.status-stopped {
  background: #f2d0ff;
  color: #8d00c5;
  border: 2px solid #8d00c5;
}

.status-completed {
  background: #d2ffcc;
  color: #16bd00;
  border: 2px solid #16bd00;
}

.status-rejected {
  background: #ffcbcb;
  color: #bd0000;
  border: 2px solid #bd0000;
}

/* Номер заявки */
.ticket-number {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #3b82f6;
  line-height: 1.2;
}

/* Тема заявки */
.ticket-subject {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.2;
}

/* Кнопка редактирования */
.edit-btn {
  width: 28px;
  height: 28px;
  background: #ffee6d;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s;
  line-height: 1;
}

.edit-btn:hover {
  background: #f1da2b;
  border-color: #9ca3af;
  transform: scale(1.05);
}

.edit-btn:active {
  transform: scale(0.95);
}

/* Стили для сроков */
.deadline-cell {
  line-height: 1.2;
}

.deadline-overdue {
  color: #dc2626;
  font-weight: 600;
}

.deadline-approaching {
  color: #d97706;
  font-weight: 600;
}

.custom-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 60px;
  color: #666;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.custom-empty h3 {
  margin-bottom: 10px;
  color: #333;
}

.custom-empty p {
  color: #777;
}
</style>
