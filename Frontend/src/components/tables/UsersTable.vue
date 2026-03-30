<!-- 
    Таблица пользователей с использованием базового UITable
    Отображение списка пользователей с сортировкой и пагинацией через Laravel Paginator
-->

<template>
  <UIIcons ref="uiIcons" />
  <div class="users-table-wrapper">
    <!-- Общий компонент таблицы -->
    <UITable
      :columns="columns"
      :data="users"
      :grid-template-columns="gridTemplateColumns"
      :loading="loading"
      :sortable="false"
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
      <!-- Шаблон для чекбокса выбора -->
      <template #cell-select="{ row }">
        <div class="checkbox-cell" @click.stop>
          <UIInput
            v-if="canSelectUser(row)"
            type="checkbox"
            :model-value="isSelected(row.id)"
            @update:model-value="(checked) => toggleSelection(row.id, checked)"
            :disabled="false"
          />
        </div>
      </template>

      <template #cell-full_name="{ row }">
        <div class="full-name-cell">
          <div class="full-name-text">
            {{ formatFullName(row.last_name, row.first_name, row.middle_name) }}
          </div>
        </div>
      </template>

      <template #cell-role="{ row }">
        <span class="role-badge" :class="getRoleClass(row.role_id)">
          {{ getRoleLabel(row.role_id) }}
        </span>
      </template>

      <template #cell-organization="{ value }">
        <div class="organization-cell" :title="value?.name">
          {{ truncateText(value?.name, 30) || 'Не указан' }}
        </div>
      </template>

      <template #cell-object="{ value }">
        <div class="object-cell" :title="value?.name">
          {{ truncateText(value?.name, 30) || 'Не указан' }}
        </div>
      </template>

      <template #loading>
        <div class="custom-loading">
          <div class="spinner"></div>
          <span>Загрузка пользователей...</span>
        </div>
      </template>

      <template #empty>
        <div class="custom-empty">
          <Icon 
            :icon="uiIcons?.icons.usersLoadEmpty"
            class="empty-icon"
            width="80"
            height="80"
          />
          <h3>Пользователи не найдены</h3>
          <p>Попробуйте изменить критерии поиска или фильтры</p>
        </div>
      </template>
    </UITable>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed, ref } from 'vue'
import UITable from '@/components/common/UI/UITable.vue'
import UIInput from '@/components/common/UI/UIInput.vue'
import { Icon } from '@iconify/vue'
import UIIcons from '@/components/common/UI/UIIcons.vue'
import { getUserId, getUserRole } from '@/utils/auth.utils'

const uiIcons = ref()

const props = defineProps({
  users: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
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
  showLaravelPagination: {
    type: Boolean,
    default: true
  },
  selectedUserIds: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['rowClick', 'pageChange', 'sortChange', 'openProfile', 'update:selectedUserIds'])

// Обработчик клика по строке таблицы
const handleRowClick = (row) => {
  emit('rowClick', row)
  emit('openProfile', row)
}

// Проверка выбран ли пользователь
const isSelected = (userId) => {
  return props.selectedUserIds.includes(userId)
}

// Переключение выбора пользователя
const toggleSelection = (userId, isChecked) => {
  let newSelection = [...props.selectedUserIds]
  
  if (isChecked) {
    if (!newSelection.includes(userId)) {
      newSelection.push(userId)
    }
  } else {
    newSelection = newSelection.filter(id => id !== userId)
  }
  
  emit('update:selectedUserIds', newSelection)
}

// Колонки таблицы - статичны и зависят только от прав пользователя
const columns = computed(() => {
  if (canSelectAnyUser.value) {
    return [
      { key: 'select', title: '', align: 'center' },
      { key: 'full_name', title: 'Пользователь', align: 'left' },
      { key: 'email', title: 'Email', align: 'left' },
      { key: 'role', title: 'Роль', align: 'center' },
      { key: 'organization', title: 'Организация', align: 'left' },
      { key: 'object', title: 'Объект', align: 'left' },
    ]
  } else {
    return [
      { key: 'full_name', title: 'Пользователь', align: 'left' },
      { key: 'email', title: 'Email', align: 'left' },
      { key: 'role', title: 'Роль', align: 'center' },
      { key: 'organization', title: 'Организация', align: 'left' },
      { key: 'object', title: 'Объект', align: 'left' },
    ]
  }
})

// Grid шаблон - также статичен и зависит от прав пользователя
const gridTemplateColumns = computed(() => {
  if (canSelectAnyUser.value) {
    return '0.9fr 8fr 6fr 5fr 6fr 10fr'
  } else {
    return '8fr 6fr 5fr 6fr 10fr'
  }
})

// Проверка, может ли текущий пользователь удалять других пользователей
const canSelectAnyUser = computed(() => {
  return getUserRole() === 'admin'
})

// Проверка, можно ли выбрать конкретного пользователя
const canSelectUser = (row) => {
  // Нельзя выбрать: 
  // 1. Если текущий пользователь не админ
  // 2. Пользователя с ID = 1 (главный админ)
  // 3. Самого себя
  console.log("ROW: ", row)
  if (!canSelectAnyUser.value) return false
  if (row.id === 1) return false
  if (row.id === getUserId()) return false
  return true
}

// Форматирование ФИО
const formatFullName = (lastName, firstName, middleName) => {
  const parts = []
  if (lastName) parts.push(lastName)
  if (firstName) parts.push(firstName)
  if (middleName) parts.push(middleName)
  
  return parts.length > 0 ? parts.join(' ') : 'Не указан'
}

// Обработчик изменения страницы
const handlePageChange = (page) => {
  emit('pageChange', page)
}

// Обработчик сортировки
const handleSortChange = (sortOptions) => {
  emit('sortChange', sortOptions)
}

// Утилиты для форматирования
const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// Классы для ролей
const getRoleClass = (roleId) => {
  switch (roleId) {
    case 1:
      return 'role-admin'
    case 2:
      return 'role-dispatcher'
    case 3:
      return 'role-engineer'
    case 4:
      return 'role-client'
    default:
      return 'role-default'
  }
}

// Метки для ролей
const getRoleLabel = (roleId) => {
  switch (roleId) {
    case 1:
      return 'Администратор'
    case 2:
      return 'Диспетчер'
    case 3:
      return 'Инженер'
    case 4:
      return 'Клиент'
    default:
      return '—'
  }
}
</script>

<style scoped>
.users-table-wrapper {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* Убираем лишние стили, так как grid задается через пропсы */
.role-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 300;
  text-align: center;
  min-width: 115px;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.role-admin {
  background-color: #dc3545;
  color: white;
}

.role-dispatcher {
  background-color: #0fa873;
  color: white;
}

.role-engineer {
  background-color: #195698;
  color: white;
}

.role-client {
  background-color: #16961a;
  color: white;
}

.role-default {
  background-color: #adb5bd;
  color: white;
}

/* Ячейки с обрезанным текстом */
.organization-cell,
.object-cell {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Кастомные состояния загрузки и пустого состояния */
.custom-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 60px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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

/* Laravel Pagination Styles */
.laravel-pagination-wrapper {
  margin-top: 20px;
  padding: 15px 20px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  background: #f8f9fa;
}

.pagination-nav {
  display: flex;
  justify-content: center;
}

.pagination-list {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
  gap: 2px;
}

.page-item {
  margin: 0;
}

.page-link {
  display: inline-block;
  padding: 8px 12px;
  margin: 0;
  color: #007bff;
  background-color: #fff;
  border: 1px solid #dee2e6;
  text-decoration: none;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  min-width: 40px;
  text-align: center;
}

.page-link:hover:not(.disabled):not(.current-page) {
  background-color: #e9ecef;
  border-color: #dee2e6;
  color: #0056b3;
}

.page-link.current-page {
  background-color: #007bff;
  border-color: #007bff;
  color: white;
  font-weight: 600;
  cursor: default;
}

.page-link.disabled {
  color: #6c757d;
  pointer-events: none;
  background-color: #fff;
  border-color: #dee2e6;
}

.prev-link, .next-link {
  min-width: 80px;
}

.pagination-info {
  font-size: 14px;
  color: #6c757d;
  text-align: center;
}
</style>