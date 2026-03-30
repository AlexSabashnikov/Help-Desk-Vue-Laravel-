<!-- 
    Компонент пагинации с поддержкой Laravel Paginator
    Может использоваться отдельно или внутри таблиц
-->

<template>
  <div class="ui-pagination">
    <!-- Информация о записях -->
    <div class="pagination-info" v-if="showInfo">
      {{ from }} - {{ to }} из {{ total }}
    </div>

    <div class="pagination-controls">
      <!-- Кнопка "Назад" (Previous) -->
      <button
        class="pagination-btn prev-btn"
        :disabled="!prevPageUrl"
        @click="handlePageChange(getPageNumberFromUrl(prevPageUrl))"
        :title="prevButtonTitle"
      >
        {{ prevButtonText }}
      </button>

      <!-- Номера страниц из Laravel links -->
      <div class="page-numbers">
        <template v-for="(link, index) in processedLinks" :key="index">
          <!-- Разделитель для многоточия -->
          <span v-if="link.label === '...'" class="page-dots">...</span>
          
          <!-- Кнопка страницы -->
          <button
            v-else
            class="page-btn"
            :class="{ 
              active: link.active,
              disabled: !link.url
            }"
            :disabled="!link.url"
            @click="handlePageChange(getPageNumberFromUrl(link.url))"
            v-html="link.label"
          ></button>
        </template>
      </div>

      <!-- Кнопка "Вперед" (Next) -->
      <button
        class="pagination-btn next-btn"
        :disabled="!nextPageUrl"
        @click="handlePageChange(getPageNumberFromUrl(nextPageUrl))"
        :title="nextButtonTitle"
      >
        {{ nextButtonText }}
      </button>
    </div>

    <!-- Селектор количества элементов на странице -->
    <div class="page-size-selector" v-if="showPageSizeSelector">
      <span class="selector-label">{{ pageSizeLabel }}</span>
      <select 
        :value="pageSize" 
        @change="handlePageSizeChange"
        class="page-size-select"
        :aria-label="pageSizeLabel"
      >
        <option v-for="size in pageSizeOptions" :key="size" :value="size">
          {{ size }}
        </option>
      </select>
    </div>

    <!-- Прыжок на конкретную страницу -->
    <div class="page-jump" v-if="showPageJump">
      <span>Перейти:</span>
      <input
        type="number"
        v-model.number="jumpPage"
        @keyup.enter="handleJumpPage"
        :min="1"
        :max="lastPage"
        class="jump-input"
        aria-label="Номер страницы для перехода"
      />
      <button @click="handleJumpPage" class="jump-btn" title="Перейти">
        →
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  // Laravel pagination data
  currentPage: {
    type: Number,
    default: 1
  },
  lastPage: {
    type: Number,
    default: 1
  },
  perPage: {
    type: Number,
    default: 20
  },
  total: {
    type: Number,
    default: 0
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
  
  // URL для навигации (для удобства)
  prevPageUrl: {
    type: String,
    default: null
  },
  nextPageUrl: {
    type: String,
    default: null
  },
  
  // Настройки отображения
  maxVisiblePages: {
    type: Number,
    default: 5
  },
  compact: {
    type: Boolean,
    default: false
  },
  noBorder: {
    type: Boolean,
    default: false
  },
  showInfo: {
    type: Boolean,
    default: true
  },
  showPageSizeSelector: {
    type: Boolean,
    default: false
  },
  showPageJump: {
    type: Boolean,
    default: false
  },
  
  // Опции для селектора размера страницы
  pageSizeOptions: {
    type: Array,
    default: () => [10, 20, 50, 100]
  },
  
  // Тексты
  prevButtonText: {
    type: String,
    default: '←'
  },
  nextButtonText: {
    type: String,
    default: '→'
  },
  prevButtonTitle: {
    type: String,
    default: 'Предыдущая страница'
  },
  nextButtonTitle: {
    type: String,
    default: 'Следующая страница'
  },
  pageSizeLabel: {
    type: String,
    default: 'Показать:'
  },
})

const emit = defineEmits(['pageChange', 'pageSizeChange'])

// Локальные состояния
const jumpPage = ref(props.currentPage)

// Обрабатываем links для правильного отображения
const processedLinks = computed(() => {
  console.log(props.links)
  if (!props.links || props.links.length === 0) {
    return []
  }
  
  // Фильтруем ссылки, убираем предыдущую и следующую если они есть в массиве
  // и оставляем только ссылки на страницы и разделители
  return props.links.filter(link => {
    const label = link.label.toLowerCase()
    return !label.includes('previous') && !label.includes('next')
  })
})

// Извлечение номера страницы из URL
const getPageNumberFromUrl = (url) => {
  if (!url) return 1
  const match = url.match(/[?&]page=(\d+)/)
  return match ? parseInt(match[1]) : 1
}

// Обработчики событий
const handlePageChange = (page) => {
  if (page && page >= 1 && page <= props.lastPage && page !== props.currentPage) {
    emit('pageChange', page)
    jumpPage.value = page
  }
}

const handlePageSizeChange = (event) => {
  const newSize = parseInt(event.target.value)
  emit('pageSizeChange', newSize)
  // При изменении размера страницы сбрасываем на первую
  emit('pageChange', 1)
}

const handleJumpPage = () => {
  const page = Math.max(1, Math.min(jumpPage.value, props.lastPage))
  handlePageChange(page)
}

// Следим за изменением currentPage
watch(() => props.currentPage, (newPage) => {
  jumpPage.value = newPage
})

// Сбрасываем прыжок при изменении lastPage
watch(() => props.lastPage, () => {
  jumpPage.value = 1
})
</script>

<style scoped>
.ui-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 24px;
  background-color: #ffffff;
  border-top: 1px solid #e0e0e0;
  flex-wrap: wrap;
  gap: 16px;
}

.pagination-info {
  font-size: 14px;
  color: #6c757d;
  white-space: nowrap;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.pagination-btn {
  min-width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: #495057;
  transition: all 0.2s;
  user-select: none;
  padding: 0 12px;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #e9ecef;
  border-color: #adb5bd;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.prev-btn, .next-btn {
  min-width: 40px;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.page-btn {
  min-width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: #495057;
  transition: all 0.2s;
  user-select: none;
  padding: 0 8px;
}

.page-btn:hover:not(.active):not(:disabled) {
  background-color: #e9ecef;
  border-color: #adb5bd;
}

.page-btn.active {
  background-color: #3b82f6;
  border-color: #3b82f6;
  color: #ffffff;
  font-weight: 600;
  cursor: default;
}

.page-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.page-dots {
  padding: 0 8px;
  color: #6c757d;
  user-select: none;
  font-size: 14px;
}

.page-size-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6c757d;
  white-space: nowrap;
}

.selector-label {
  font-weight: 500;
}

.page-size-select {
  padding: 4px 8px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background-color: #ffffff;
  color: #495057;
  cursor: pointer;
  font-size: 14px;
  min-width: 60px;
}

.page-size-select:focus {
  outline: none;
  border-color: #3b82f6;
}

.page-jump {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6c757d;
  white-space: nowrap;
}

.jump-input {
  width: 60px;
  padding: 4px 8px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  text-align: center;
  font-size: 14px;
}

.jump-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.jump-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: #495057;
  transition: all 0.2s;
}

.jump-btn:hover {
  background-color: #e9ecef;
  border-color: #adb5bd;
}
</style>