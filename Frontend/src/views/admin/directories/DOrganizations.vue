<!--
    Справочник компаний-клиентов
    Таблица компаний с поиском и фильтрацией
    Создание/редактирование компаний, управление контактными лицами
-->
<!-- src/views/admin/directories/DOrganizations.vue -->
<template>
  <!-- Основной контент страницы -->
  <UIIcons ref="uiIcons" />
  <div class="all-organizations-page">
    <!-- Панель с кнопками над таблицей -->
    <div class="table-controls">
      <div class="table-controls-left">
        <div class="search-section">
          <UIInput
            v-model="searchQuery"
            placeholder="Поиск по организациям..."
            type="text"
            :max-length="30"
            @keyup.enter="handleSearch"
            class="search-input"
            customClass="search-ui-input"
          />
          <button class="search-btn" @click="handleSearch">
            <Icon :icon="uiIcons?.icons.organizationSearch" width="25" height="25" />
          </button>
        </div>

        <div class="quick-filters">
          <UIButton
            class="filter-btn"
            :class="{ 'filter-btn--mainOrganization--active': selectedTypes.includes(organizationTypeMap.mainOrganization) }"
            @click="setQuickFilter('mainOrganization')"
          >
            Основная организация
          </UIButton>

          <UIButton
            class="filter-btn"
            :class="{ 'filter-btn--contractor--active': selectedTypes.includes(organizationTypeMap.contractor) }"
            @click="setQuickFilter('contractor')"
          >
            Подрядчики
          </UIButton>

          <UIButton
            class="filter-btn"
            :class="{ 'filter-btn--subcontractor--active': selectedTypes.includes(organizationTypeMap.subcontractor) }"
            @click="setQuickFilter('subcontractor')"
          >
            Субподрядчики
          </UIButton>

          <UIButton
            class="filter-btn"
            :class="{ 'filter-btn--customer--active': selectedTypes.includes(organizationTypeMap.customer) }"
            @click="setQuickFilter('customer')"
          >
            Заказчики
          </UIButton>
        </div>
      </div>

      <div class="table-controls-right">
        <UIButton
          class="create-organization-btn"
          @click="openCreateModal"
          v-if="canCreateOrganization"
        >
          <span class="btn-content">
            <Icon :icon="uiIcons?.icons.organizationCreate" width="22" height="22" />
            <span>Создать организацию</span>
          </span>
        </UIButton>
      </div>
    </div>

    <!-- Таблица организаций -->
    <div class="table-section">
      <OrganizationsTable
        :organizations="organizations"
        :loading="loading"
        :pagination="paginationData"
        @rowClick="handleRowClick"
        @pageChange="handlePageChange"
      />
    </div>

    <!-- Модалка профиля -->
    <OrganizationProfileModal
      v-model="modalVisible"
      :mode="modalMode"
      :organization="selectedOrganization"
      @saved="handleOrganizationSaved"
      @deleted="handleOrganizationDeleted"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getUserRole } from '@/utils/auth.utils'
import { useOrganizationsStore } from '@/stores/organizations.store'
import OrganizationsTable from '@/components/tables/OrganizationsTable.vue'
import UIInput from '@/components/common/UI/UIInput.vue'
import UIButton from '@/components/common/UI/UIButton.vue'
import OrganizationProfileModal from '@/components/modal/OrganizationProfileModal.vue'
import { Icon } from '@iconify/vue'
import UIIcons from '@/components/common/UI/UIIcons.vue'

const uiIcons = ref()
const organizationsStore = useOrganizationsStore()

const searchQuery = ref('')
const selectedTypes = ref([]) // хранит id: 1,2,3,4
const organizations = ref([])
const loading = ref(false)

// Модальное окно
const selectedOrganization = ref(null)
const modalVisible = ref(false)
const modalMode = ref('create')

// Map типов организаций (UI key -> id)
const organizationTypeMap = {
  mainOrganization: 1, // Основная организация
  contractor: 2,       // Подрядчик
  subcontractor: 3,    // Субподрядчик
  customer: 4,         // Заказчик
}

// Проверка прав на создание организации
const canCreateOrganization = computed(() => {
  return getUserRole() === 'admin'
})

const paginationData = ref({
  current_page: 1,
  last_page: 1,
  per_page: 20,
  total: 0,
  links: [],
  from: 0,
  to: 0,
})

// Загрузка организаций
const loadOrganizations = async () => {
  loading.value = true

  try {
    const params = {
      search: searchQuery.value,
      types: selectedTypes.value,
    }

    console.log('Загрузка организаций с параметрами:', params)

    const response = await organizationsStore.fetchOrganizations(params)
    console.log('Ответ от API:', response)

    if (response && response.data) {
      if (response.data.data) {
        organizations.value = response.data.data || []
        paginationData.value = {
          current_page: response.data.current_page || 1,
          last_page: response.data.last_page || 1,
          per_page: response.data.per_page || 20,
          total: response.data.total || 0,
          links: response.data.links || [],
          from: response.data.from || 0,
          to: response.data.to || 0,
        }
      } else if (Array.isArray(response.data)) {
        organizations.value = response.data
        paginationData.value = {
          current_page: 1,
          last_page: 1,
          per_page: organizations.value.length || 20,
          total: organizations.value.length || 0,
          links: [],
          from: 1,
          to: organizations.value.length || 0,
        }
      } else {
        organizations.value = []
        console.warn('Неожиданный формат ответа:', response.data)
      }

      console.log('Загружено организаций:', organizations.value.length)
    } else {
      console.warn('Пустой ответ от API')
      organizations.value = []
    }
  } catch (error) {
    console.error('Ошибка загрузки организаций:', error)
    organizations.value = []
  } finally {
    loading.value = false
  }
}

// Открыть модалку создания
const openCreateModal = () => {
  selectedOrganization.value = null
  modalMode.value = 'create'
  modalVisible.value = true
}

// После сохранения
const handleOrganizationSaved = () => {
  organizationsStore.clearCache()
  loadOrganizations()
}

// После удаления
const handleOrganizationDeleted = () => {
  organizationsStore.clearCache()
  loadOrganizations()
}

// Клик по строке таблицы
const handleRowClick = (organization) => {
  console.log('[DOrganizations] handleRowClick called — org:', organization && organization.id, organization)
  if (!organization) return

  selectedOrganization.value = organization
  modalMode.value = 'edit'
  modalVisible.value = true

  console.log('[DOrganizations] modalVisible set true, selectedOrganization.id =', selectedOrganization.value?.id)
}

// Изменение страницы
const handlePageChange = (page) => {
  console.log('📄 handlePageChange', page)
  paginationData.value.current_page = page
  loadOrganizations()
}

// Поиск
const handleSearch = () => {
  paginationData.value.current_page = 1
  loadOrganizations()
}

// Быстрые фильтры через map
const setQuickFilter = (typeKey) => {
  const typeId = organizationTypeMap[typeKey]

  if (!typeId) return

  if (selectedTypes.value.includes(typeId)) {
    selectedTypes.value = selectedTypes.value.filter((t) => t !== typeId)
  } else {
    selectedTypes.value = [...selectedTypes.value, typeId]
  }

  paginationData.value.current_page = 1
  loadOrganizations()
}

// Инициализация
onMounted(() => {
  console.log('DOrganizations mounted, загружаем организации...')
  loadOrganizations()
})
</script>

<style scoped>
.table-controls {
  display: flex;
  gap: 20px;
  border-bottom: 3px solid rgb(210, 210, 210);
  width: 100%;
  padding-bottom: 10px;
}

.table-controls-left {
  display: flex;
  align-items: center;
  width: 70%;
  gap: 20px;
  padding-left: 20px;
}

.table-controls-right {
  align-content: end;
  width: 30%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-right: 20px;
}

.table-section {
  padding: 10px;
  margin: 0 20px 0 20px;
}

.quick-filters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.search-section {
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
}

.search-btn {
  background: #319ef8;
  color: white;
  border: 1px solid #1296e8;
  border-radius: 0 20px 20px 0;
  padding: 1px 6px 0px 4px;
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

/* Фильтры */
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

.filter-btn:hover {
  background: #dbe4ff;
  border-color: #0056e9;
  transform: scale(1.02);
}

.filter-btn--mainOrganization--active {
  background-color: #1914b0;
  color: white;
  transform: scale(1.02);
  border: none;
}

.filter-btn--contractor--active {
  background-color: #11af8a;
  color: white;
  transform: scale(1.02);
  border: none;
}

.filter-btn--subcontractor--active {
  background-color: #1a7ccc;
  color: white;
  transform: scale(1.02);
  border: none;
}

.filter-btn--customer--active {
  background-color: #16961a;
  color: white;
  transform: scale(1.02);
  border: none;
}

.filter-btn--mainOrganization--active:hover {
  background-color: #16129b;
  color: white;
  transform: scale(1.05);
  border: none;
}

.filter-btn--contractor--active:hover {
  background-color: #109b7b;
  color: white;
  transform: scale(1.05);
  border: none;
}

.filter-btn--subcontractor--active:hover {
  background-color: #106ebb;
  color: white;
  transform: scale(1.05);
  border: none;
}

.filter-btn--customer--active:hover {
  background-color: #138717;
  color: white;
  transform: scale(1.05);
  border: none;
}

.filter-btn:focus {
  box-shadow: 0 0 0 2px rgba(56, 145, 255, 0.334);
  outline: none;
}

/* Кнопка создания */
.create-organization-btn {
  background: #3cc93a;
  color: white;
  border: none;
  padding: 5px 14px;
  border-radius: 20px;
  font-weight: 400 !important;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
}

.create-organization-btn:hover {
  background: #28a23e;
  transform: scale(1.02);
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 8px;
  line-height: 1;
}

.btn-content .iconify {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Адаптивность */
@media (max-width: 1200px) {
  .table-controls {
    flex-wrap: wrap;
    gap: 15px;
  }

  .quick-filters {
    order: 3;
    width: 100%;
    justify-content: center;
    margin-top: 10px;
  }

  .search-section {
    order: 1;
    max-width: 250px;
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .quick-filters {
    gap: 5px;
    gap: 6px;
  }

  .quick-filters button {
    font-size: 12px;
    padding: 4px 8px;
    padding: 6px 10px;
  }
}
</style>
