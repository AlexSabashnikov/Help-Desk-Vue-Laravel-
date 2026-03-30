<!-- 
    Все заявки (администратор)
    Полная таблица всех заявок системы с фильтрацией и сортировкой
    Быстрые фильтры: Новые, Просроченные, Подходят к сроку
-->

<template>
  <UIIcons ref="uiIcons" />
  <!-- Основной контент страницы -->
  <div class="all-tickets-page">
    <!-- Панель с кнопками над таблицей -->
    <div class="table-controls">
      <div class="search-section">
        <UIInput
          v-model="searchQuery"
          placeholder="Поиск по заявкам..."
          @keyup.enter="handleSearch"
          class="search-input"
          :max-length="30"
          customClass="search-ui-input"
        />
        <button class="search-btn" @click="handleSearch">
          <Icon :icon="uiIcons?.icons.ticketSearch" width="24" height="24" />
        </button>
      </div>

      <!--Быстрые фильтры-->
      <div class="quick-filters">
      <UIButton 
        class="filter-btn"
        :class="{ 'filter-btn--new--active': selectedQuickFilter === 'new' }"
        @click="setQuickFilter('new')"
      >
        Новые: {{countOfNewTickets}}
      </UIButton>
  
      <UIButton 
        class="filter-btn"
        :class="{ 'filter-btn--overdue--active': selectedQuickFilter === 'overdue' }"
        @click="setQuickFilter('overdue')"
      >
        Просрочено: {{ countOfOverdueTickets }}
      </UIButton>
  
      <UIButton 
        class="filter-btn"
        :class="{ 'filter-btn--near-deadline--active': selectedQuickFilter === 'nearDeadline' }"
        @click="setQuickFilter('nearDeadline')"
      >
        Подходят к сроку: {{ countOfNearDeadlineTickets }}
      </UIButton>
    </div>
      
      <!-- Кнопка открытия фильтров -->
      <div class="filter-section">
        <TicketFilters
          :filters="activeFilters"
          @applyFilters="handleApplyFilters"
          @resetFilters="handleResetFilters"
        />
      </div>
    </div>

    <!-- Таблица заявок -->
    <div class="table-section">
      <TicketTable
        :tickets="tickets"
        :loading="loading"
        :pagination="pagination"
        @rowClick="handleRowClick"
        @pageChange="handlePageChange"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTicketsStore } from '@/stores/tickets.store'
import TicketFilters from '@/components/tickets/TicketFilters.vue'
import TicketTable from '@/components/tables/TicketTable.vue'
import UIButton from '@/components/common/UI/UIButton.vue'
import UIInput from '@/components/common/UI/UIInput.vue'
import { isDeadlineOverdue, isDeadlineApproaching, getDeadlineClass } from '@/utils/ticket.utils'
import { Icon } from '@iconify/vue'
import UIIcons from '@/components/common/UI/UIIcons.vue'


const uiIcons = ref()
const ticketsStore = useTicketsStore()
const searchQuery = ref('')

// Состояние
const tickets = ref([])
const loading = ref(false)
const pagination = ref({
  page: 1,
  limit: 15, // ЛИМИТ ПАГИНАЦИИ ТАБЛИЦЫ ЗАЯВОК
  total: 0,
})
const activeFilters = ref({})
const selectedQuickFilter = ref(null)

// Счетчики для всех заявок в системе
const countOfNewTickets = ref(0)
const countOfOverdueTickets = ref(0)
const countOfNearDeadlineTickets = ref(0)

// Загрузка заявок для таблицы (с фильтрацией и пагинацией)
const loadTickets = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      limit: pagination.value.limit,
      ...activeFilters.value,
    }
    const response = await ticketsStore.fetchTickets(params)
    tickets.value = response.data || []
    pagination.value.total = response.total || 0
  } catch (error) {
    console.error('Ошибка загрузки заявок:', error)
  } finally {
    loading.value = false
  }
}

// Загрузка ВСЕХ заявок для счетчиков
const loadAllTicketsForCounters = async () => {
  try {
    // Загружаем все заявки без пагинации
    const params = {
      limit: 1000, // Или достаточно большое число
      page: 1,
      // Не применяем текущие фильтры для счетчиков
      ...activeFilters.value
    }
    
    // Если нужны абсолютно все заявки, можно сделать отдельный запрос
    // или использовать другой метод store
    const response = await ticketsStore.fetchTickets(params)
    const allTickets = response.data || []
    
    // Используем единую логику из ticket.utils.js
    updateCounters(allTickets)
    
  } catch (error) {
    console.error('Ошибка загрузки счетчиков:', error)
  }
}

// Функция обновления счетчиков с использованием утилит
const updateCounters = (allTickets) => {
  // Счетчик новых заявок
  countOfNewTickets.value = allTickets.filter(ticket => ticket.status === 'new').length
  
  // Счетчик просроченных заявок - используем isDeadlineOverdue из ticket.utils.js
  countOfOverdueTickets.value = allTickets.filter(ticket => 
    isDeadlineOverdue(ticket.deadline)
  ).length
  
  // Счетчик заявок, подходящих к сроку - используем isDeadlineApproaching из ticket.utils.js
  countOfNearDeadlineTickets.value = allTickets.filter(ticket => 
    ticket.deadline && 
    ticket.createdAt && 
    isDeadlineApproaching(ticket.deadline, ticket.createdAt)
  ).length
  
  console.log('Обновленные счетчики:', {
    новые: countOfNewTickets.value,
    просроченные: countOfOverdueTickets.value,
    подходятКСроку: countOfNearDeadlineTickets.value,
    всего: allTickets.length
  })
  
  // Для отладки: проверяем, какие заявки считаются просроченными
  const overdueTickets = allTickets.filter(ticket => isDeadlineOverdue(ticket.deadline))
  console.log('Просроченные заявки:', overdueTickets.map(t => ({
    id: t.id,
    deadline: t.deadline,
    deadlineClass: getDeadlineClass(t.deadline, t.createdAt)
  })))
}

const handleRowClick = (ticket) => {
  console.log('Клик по строке:', ticket)
}

const handleEdit = (ticket) => {
  console.log('Редактирование:', ticket)
}

const handleDelete = (ticketId) => {
  console.log('Удаление:', ticketId)
}

// Обработчик поиска
const handleSearch = () => {
  selectedQuickFilter.value = null // сбрасываем активный быстрый фильтр
  pagination.value.page = 1
  loadTickets()
  loadAllTicketsForCounters()
}

// Обработчики фильтров
const handleApplyFilters = (filters) => {
  activeFilters.value = { ...filters }
  selectedQuickFilter.value = null // сбрасываем активный быстрый фильтр
  pagination.value.page = 1
  loadTickets()
  loadAllTicketsForCounters()
}

const handleResetFilters = () => {
  activeFilters.value = {}
  selectedQuickFilter.value = null // сбрасываем активный быстрый фильтр
  pagination.value.page = 1
  loadTickets()
  loadAllTicketsForCounters()
}

const setQuickFilter = (type) => {
  // Если фильтр уже активен - сбрасываем его
  if (selectedQuickFilter.value === type) {
    selectedQuickFilter.value = null
    activeFilters.value = {} // сбрасываем фильтры
  } else {
    // Иначе устанавливаем новый фильтр
    selectedQuickFilter.value = type
    const quickFiltersMap = {
      new: { status: 'new' },
      overdue: { overdue: true },
      nearDeadline: { nearDeadline: true },
    }
    activeFilters.value = { ...quickFiltersMap[type] }
  }
  
  pagination.value.page = 1
  loadTickets()
  // Не обновляем счетчики при быстрых фильтрах, так как они уже отфильтрованы
}

const handlePageChange = (page) => {
  pagination.value.page = page
  loadTickets()
}

// Инициализация
onMounted(() => {
  loadTickets()
  loadAllTicketsForCounters()
})
</script>

<style scoped>

.table-controls {
  display: flex;
  align-items: center;
  gap: 20px;
  border-bottom: 3px solid rgb(210, 210, 210);
  width: 100%;
  padding-bottom: 10px;
}

.filter-section {
  display: flex;
  align-items: center;
}

.table-section {
  padding: 10px;
  margin: 0 20px 0 20px;
}

.quick-filters {
  display: flex;
  gap: 15px;
}

.filter-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 5px;
    font-weight: 300;
    font-size: 12px;
    border: 1px solid #144da8;
    background-color: #f1f9ff; 
    color: #144da8;
    cursor: pointer;
    transition: transform .06s ease, box-shadow .12s ease, filter .06s ease;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 36px;
    line-height: 1;
    white-space: nowrap;
  }    

  /* hover/active */
  .filter-btn:hover { 
    background: #dbe4ff;
    border-color: #0056e9;
    transform: scale(1.02);
  }

.filter-btn--new--active {
  background-color: rgb(29, 63, 199);
  color: white;
  transform: scale(1.02);
  border: none;
}

.filter-btn--overdue--active {
  background-color: #d62c19;
  color: white;
  transform: scale(1.02);
  border: none;
}

.filter-btn--near-deadline--active {
  background-color: #ee990f;
  color: white;
  transform: scale(1.02);
  border: none;
}

.filter-btn--new--active:hover {
  background-color: rgb(18, 45, 155);
  color: white;
  transform: scale(1.05);
  border: none;
}

.filter-btn--overdue--active:hover {
  background-color: #c0392b;
  color: white;
  transform: scale(1.05);
  border: none;
}

.filter-btn--near-deadline--active:hover {
  background-color: #e67e22;
  color: white;
  transform: scale(1.05);
  border: none;
}

.search-section {
  margin-left:20px;
  display: flex;
  align-items: center;
  flex: 1;
  max-width: 300px;
}


.search-ui-input :deep(.ui-input) {
  padding-top: 2px !important;
  padding-left: 10px !important;
  padding-bottom: 2px !important;
  border-radius: 20px 0 0 20px !important; 
  font-size: 14px !important;
  margin-bottom: 2px !important;
}

.search-btn {
  background: #319ef8;
  color: white;
  border: 1px solid #1296e8;
  border-radius: 0 20px 20px 0;
  padding: 1px 8px;
  cursor: pointer;
  font-size: 12px;
  margin-left: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-btn:hover {
  background: #299eff;
  border-color: #339af0;
  transform: scale(1.05);
}
</style>
