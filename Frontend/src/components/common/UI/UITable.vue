<!-- 
    Базовая таблица с сортировкой и пагинацией
    Используется для отображения списков заявок, компаний, пользователей
-->

<template>
  <div class="ui-table" :class="{ 'with-pagination': showPagination }">
    <!-- Grid-based таблица -->
    <div class="grid-table">
      <!-- Header row -->
      <div 
        class="grid-header"
        :style="{ gridTemplateColumns: gridTemplateColumns }"
      >
        <div 
          v-for="column in columns" 
          :key="`header-${column.key}`" 
          class="grid-cell header-cell"
          :style="{ textAlign: column.align || 'left' }"
        >
          <div 
            class="column-header" 
            @click="() => handleSort(column.key)"
            :class="{ sortable: sortable }"
          >
            <span class="column-title">{{ column.title }}</span>
            <span v-if="sortable && sortBy === column.key" class="sort-icon">
              {{ sortDirection === 'asc' ? '▲' : '▼' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Data rows -->
      <div 
        v-for="(row, index) in data"
        :key="row.id || index"
        class="grid-row"
        :style="{ gridTemplateColumns: gridTemplateColumns }"
        :class="{ 
          clickable: rowClickable, 
          hoverable: hoverable,
        }"
        @click="() => $emit('rowClick', row)"
      >
        <div 
          v-for="column in columns" 
          :key="`${row.id || index}-${column.key}`"
          class="grid-cell data-cell"
          :style="{ textAlign: column.align || 'left' }"
        >
          <slot 
            :name="`cell-${column.key}`" 
            :value="row[column.key]" 
            :row="row" 
            :column="column"
          >
            {{ row[column.key] }}
          </slot>
        </div>
      </div>
    </div>

    <!-- Состояние загрузки -->
    <div v-if="loading" class="loading-state">
      <slot name="loading">Загрузка данных...</slot>
    </div>

    <!-- Пустое состояние -->
    <div v-if="!loading && (!data || data.length === 0)" class="empty-state">
      <slot name="empty">Данные отсутствуют</slot>
    </div>
  </div>

  <!-- Пагинация -->
  <UIPagination 
    v-if="showPagination"
    :current-page="currentPage"
    :last-page="lastPageComputed"
    :per-page="pageSize"
    :total="totalItems"
    :from="fromComputed"
    :to="toComputed"
    :links="linksComputed"
    :prev-page-url="prevPageUrlComputed"
    :next-page-url="nextPageUrlComputed"
    :show-info="showPaginationInfo"
    :show-page-size-selector="showPageSizeSelector"
    :show-page-jump="showPageJump"
    :compact="compactPagination"
    :no-border="paginationNoBorder"
    @pageChange="handlePageChange"
    class="table-pagination"
  />
</template>

<script setup>
import { ref, defineProps, defineEmits, watch, computed } from 'vue'
import UIPagination from '@/components/common/UI/UIPagination.vue'

const props = defineProps({
  columns: {
    type: Array,
    required: true,
    default: () => [],
  },
  data: {
    type: Array,
    default: () => [],
  },
  gridTemplateColumns: {
    type: String,
    default: 'repeat(6, 1fr)' // 6 колонок по умолчанию
  },
  loading: {
    type: Boolean,
    default: false,
  },
  sortable: {
    type: Boolean,
    default: false,
  },
  rowClickable: {
    type: Boolean,
    default: true,
  },
  hoverable: {
    type: Boolean,
    default: true,
  },
  // Пропсы для пагинации
  pagination: {
    type: Boolean,
    default: false,
  },
  pageSize: {
    type: Number,
    default: 20,
  },
  currentPage: {
    type: Number,
    default: 1,
  },
  showPaginationInfo: {
    type: Boolean,
    default: true,
  },
  showPageSizeSelector: {
    type: Boolean,
    default: false,
  },
  showPageJump: {
    type: Boolean,
    default: false,
  },
  compactPagination: {
    type: Boolean,
    default: false,
  },
  paginationNoBorder: {
    type: Boolean,
    default: false,
  },
  totalItems: { 
    type: Number,
    default: 0,
  },
  lastPage: {
    type: Number,
    default: 1
  },
  from: {
    type: Number,
    default: 0
  },
  to: {
    type: Number,
    default: 0
  },
  links: {
    type: Array,
    default: () => []
  },
  prevPageUrl: {
    type: String,
    default: null
  },
  nextPageUrl: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['rowClick', 'sortChange', 'pageChange'])

// Вычисляемое свойство для показа пагинации
const showPagination = computed(() => {
  return props.links.length > 3
})


const sortBy = ref('')
const sortDirection = ref('asc')
const localCurrentPage = ref(props.currentPage)

const handleSort = (columnKey) => {
  if (!props.sortable) return

  if (sortBy.value === columnKey) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = columnKey
    sortDirection.value = 'asc'
  }

  emit('sortChange', {
    sortBy: sortBy.value,
    sortDirection: sortDirection.value,
  })
}

const handlePageChange = (page) => {
  localCurrentPage.value = page
  emit('pageChange', page)
}

// Вычисляемые свойства для Laravel pagination с правильными значениями по умолчанию
const lastPageComputed = computed(() => {
  return props.lastPage || Math.ceil(props.totalItems / props.pageSize) || 1
})

const fromComputed = computed(() => {
  return props.from || ((props.currentPage - 1) * props.pageSize + 1)
})

const toComputed = computed(() => {
  return props.to || Math.min(props.currentPage * props.pageSize, props.totalItems)
})

const linksComputed = computed(() => {
  return props.links || []
})

const prevPageUrlComputed = computed(() => {
  return props.prevPageUrl || null
})

const nextPageUrlComputed = computed(() => {
  return props.nextPageUrl || null
})

watch(() => props.currentPage, (newPage) => {
  localCurrentPage.value = newPage
})

watch(() => props.data, () => {
  localCurrentPage.value = 1
}, { deep: true })
</script>

<style scoped>
.ui-table {
  overflow-x: auto;
  border-radius: 8px;
  background: white;
}

/* Когда есть пагинация - только верхние углы закруглены */
.ui-table.with-pagination {
  border-bottom: none;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.grid-table {
  display: flex;
  flex-direction: column;
}

.grid-header {
  display: grid;
  background-color: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
  max-height: 40px;
}

.grid-row {
  display: grid;
  border-bottom: 1px solid #e0e0e0;
  max-height: 40px;
}

.grid-cell {
  padding: 8px 16px;
  display: flex;
  align-items: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-height: 40px;
  box-sizing: border-box; 
}

.header-cell {
  font-weight: 600;
  font-size: 14px;
  color: #1d1d1d;
  user-select: none;
}

.data-cell {
  font-size: 14px;
  color: #212529;
}

.column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 100%;
}

.column-header.sortable {
  cursor: pointer;
}

.column-header.sortable:hover .column-title {
  color: #007bff;
}

.column-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sort-icon {
  font-size: 10px;
  color: #6c757d;
  margin-left: 4px;
  flex-shrink: 0;
}

.clickable {
  cursor: pointer;
}

.hoverable:hover {
  background-color: #ebedf4 !important;
}

.loading-state,
.empty-state {
  padding: 40px;
  text-align: center;
  color: #6c757d;
  background: white;
}

.empty-state {
  font-style: italic;
}
</style>