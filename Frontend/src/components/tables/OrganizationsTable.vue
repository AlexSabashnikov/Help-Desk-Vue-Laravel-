<!-- 
    Таблица организаций с использованием базового UITable
    Отображение списка организаций с пагинацией через Laravel Paginator
-->

<template>
  <UIIcons ref="uiIcons" />
  <div class="organizations-table-wrapper">
    <!-- Общий компонент таблицы -->
    <UITable
      :columns="columns"
      :data="organizations"
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
      <template #cell-organization="{ row }">
        <div class="organization-cell" :title="row.name">
          <div class="org-name">{{ truncateText(row.name, 35) }}</div>
        </div>
      </template>

      <template #cell-type_org="{ value }">
        <span class="org-type-badge" :class="getOrgTypeClass(value)">
          {{ getOrgTypeLabel(value) }}
        </span>
      </template>

      <template #cell-adress="{ row }">
        <div class="address-cell" :title="getMainOfficeAddress(row)">
          {{ truncateText(getMainOfficeAddress(row), 50) }}
        </div>
      </template>

      <template #cell-main_contact="{ row }">
        <div class="main-contact-cell" v-if="getMainContact(row)" :title="getMainContact(row).full_name">
          <div class="contact-name">{{ getMainContact(row).full_name }}</div>
        </div>
        <span v-else class="text-muted">Не указан</span>
      </template>

      <template #cell-phone="{ row }">
        <div class="phone-cell">
          <div class="main-phone">{{ getMainContact(row)?.phone || '—' }}</div>
        </div>
      </template>

      <template #cell-objects_contacts="{ row }">
        <div class="stats-cell">
          <div class="stat-item" :title="'Объекты'">
            <Icon :icon="uiIcons?.icons.countOffices" width="22" height="22" />
            <span>{{ row.objects?.length || 0 }}</span>
          </div>
          <div class="stat-item" :title="'Контакты'">
            <Icon :icon="uiIcons?.icons.users || 'mdi:account-group'" width="22" height="22" />
            <span>{{ getTotalContacts(row) }}</span>
          </div>
        </div>
      </template>

      <template #loading>
        <div class="custom-loading">
          <div class="spinner"></div>
          <span>Загрузка организаций...</span>
        </div>
      </template>

      <template #empty>
        <div class="custom-empty">
          <Icon 
            :icon="uiIcons?.icons.organizationsLoadEmpty"
            class="empty-icon"
            width="80"
            height="80"
          />
          <h3>Организации не найдены</h3>
          <p>Попробуйте изменить критерии поиска или фильтры</p>
        </div>
      </template>
    </UITable>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed, ref } from 'vue'
import UITable from '@/components/common/UI/UITable.vue'
import { Icon } from '@iconify/vue'
import UIIcons from '@/components/common/UI/UIIcons.vue'

const uiIcons = ref()

defineProps({
  organizations: {
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
  }
})

const emit = defineEmits(['rowClick', 'pageChange', 'sortChange', 'openProfile'])

// Колонки таблицы
const columns = [ 
  { key: 'organization', title: 'Организация', align: 'left' },
  { key: 'type_org', title: 'Тип', align: 'center' },
  { key: 'main_contact', title: 'Главное контактное лицо', align: 'left' },
  { key: 'phone', title: 'Телефон', align: 'left' }, 
  { key: 'adress', title: 'Адрес главного офиса', align: 'left' },
  { key: 'objects_contacts', title: '', align: 'center' },
]

// Grid шаблон
const gridTemplateColumns = computed(() => {
  return '8fr 4.5fr 6fr 4fr 8fr 3fr'
})

// Обработчик клика по строке
const handleRowClick = (row) => {
  emit('rowClick', row)
  emit('openProfile', row)
}

// Обработчик изменения страницы
const handlePageChange = (page) => {
  emit('pageChange', page)
}

// Обработчик сортировки
const handleSortChange = (sortOptions) => {
  emit('sortChange', sortOptions)
}

// Вспомогательные функции
const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// Получение главного офиса
const getMainOffice = (organization) => {
  if (!organization.objects || !organization.objects.length) return null
  return organization.objects.find(obj => obj.is_main === true) || organization.objects[0]
}

// Получение адреса главного офиса
const getMainOfficeAddress = (organization) => {
  const mainOffice = getMainOffice(organization)
  return mainOffice?.address || organization.legal_address || 'Адрес не указан'
}

// Получение главного контакта
const getMainContact = (organization) => {
  if (!organization.objects || !organization.objects.length) return null
  
  // Сначала ищем контакт с is_main: true во всех объектах
  for (const obj of organization.objects) {
    if (obj.contacts && obj.contacts.length) {
      const mainContact = obj.contacts.find(contact => contact.is_main === true)
      if (mainContact) return mainContact
    }
  }
  
  // Если не нашли, берем первый контакт из главного офиса
  const mainOffice = getMainOffice(organization)
  if (mainOffice && mainOffice.contacts && mainOffice.contacts.length) {
    return mainOffice.contacts[0]
  }
  
  return null
}

const getTotalContacts = (organization) => {
  if (!organization.objects) return 0
  return organization.objects.reduce((total, obj) => {
    return total + (obj.contacts?.length || 0)
  }, 0)
}

// Типы организаций (Заказчик/Подрядчик/Наша компания)
const getOrgTypeClass = (type) => {
  switch (Number(type)) {
    case 1:
      return 'org-customer'
    case 2:
      return 'org-contractor'
    case 3:
      return 'org-subcontractor'
    case 4:
      return 'org-our'
    default:
      return 'org-default'
  }
}

const getOrgTypeLabel = (type) => {
  switch (Number(type)) {
    case 1:
      return 'Заказчик'
    case 2:
      return 'Подрядчик'
    case 3:
      return 'Субподрядчик'
    case 4:
      return 'Основная организация'
    default:
      return '—'
  }
}
</script>

<style scoped>
.organizations-table-wrapper {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* Ячейка организации */
.organization-cell {
  display: flex;
  flex-direction: column;
}

.org-name {
  font-weight: 500;
  color: #1d1d1d;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.org-short-name {
  font-size: 11px;
  color: #777;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Бейджи типов контрагентов (ЮЛ/ФЛ) */
.agent-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 300;
  text-align: center;
  min-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.agent-legal {
  background-color: #ddf1ff;
  color: #1469bf;
}

.agent-physical {
  background-color: #cef7ce;
  color: #27752b;
}

.agent-default {
  background-color: #f5f5f5;
  color: #757575;
}

/* Бейджи типов организаций (Заказчик/Подрядчик/Наша компания) */
.org-type-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 300;
  text-align: center;
  min-width: 110px;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.org-customer {
  background-color: #16961a;
  color: white;
}

.org-contractor {
  background-color: #11af8a;
  color: white;
}

.org-subcontractor {
  background-color: #1a7ccc;
  color: white;
}

.org-our {
  background-color: #1914b0;
  color: white;
}

.org-default {
  background-color: #f5f5f5;
  color: #757575;
}


/* Ячейка адреса */
.address-cell {
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Ячейка главного контакта */
.main-contact-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.contact-name {
  font-weight: 500;
  color: #1d1d1d;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.contact-position {
  font-size: 11px;
  color: #777;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Ячейка телефона */
.phone-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.main-phone {
  font-weight: 500;
  color: #1d1d1d;
  white-space: nowrap;
}

/* Ячейка статистики */
.stats-cell {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #1774ee;
  font-size: 14px;
}

.stat-item .iconify {
  color: #178aee;
}

/* Состояния загрузки и пустого состояния */
.custom-loading,
.custom-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 60px;
  color: #666;
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

.custom-empty h3 {
  margin: 0;
  color: #333;
}

.custom-empty p {
  margin: 0;
  color: #777;
}

.empty-icon {
  opacity: 0.5;
}

.text-muted {
  color: #999;
  font-style: italic;
}
</style>