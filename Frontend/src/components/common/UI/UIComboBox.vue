<template>
  <div class="ui-combobox-wrapper" :class="[customClass, { 'required-field': required }]">
    <span class="ui-combobox-label">
      {{ label }}
      <span v-if="required" class="required-asterisk">*</span>
      <span v-if="showError" class="combobox-error">{{ errorMessage }}</span>
    </span>
    <div class="combobox-container" :class="{ 'has-error': showError }">
    <input
      ref="inputRef"
      :value="searchValue"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :maxlength="maxLength"
      class="ui-combobox-input"
    />
    </div>
    <!-- Выпадающий список с виртуальным скроллом -->
    <div 
      v-if="showDropdown && !isSearching" 
      class="combobox-dropdown"
      :style="{ maxHeight: dropdownMaxHeight }"
      ref="dropdownRef"
      @scroll="handleDropdownScroll"
    >
      <!-- Виртуальный скроллер для опций -->
      <RecycleScroller
        v-if="allOptions.length > 0"
        class="scroller"
        :items="allOptions"
        :item-size="36"
        key-field="id"
        v-slot="{ item }"
        :emit-update="true"
        @update="handleScrollerUpdate"
      >
        <div 
          class="combobox-option"
          @mousedown="selectOption(item)"
          :class="{ 'combobox-option-selected': isOptionSelected(item) }"
        >
          {{ getOptionLabel(item) }}
        </div>
      </RecycleScroller>
      
      <!-- Сообщение о загрузке следующей страницы -->
      <div v-if="loadingNextPage" class="combobox-loading-more">
        Загрузка...
      </div>
    </div>
    <!-- Если нет результатов поиска -->
    <div 
      v-if="showDropdown && allOptions.length === 0 && !isSearching" 
      class="combobox-dropdown combobox-no-results"
    >
      <div class="combobox-no-results-text">
        Ничего не найдено
      </div>
    </div>
    <!-- Индикатор загрузки при поиске -->
    <div 
      v-if="showDropdown && isSearching" 
      class="combobox-dropdown combobox-loading"
    >
      <div class="combobox-loading-text">
        Поиск...
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

const props = defineProps({
  modelValue: [String, Number, Object],
  options: {
    type: Array,
    default: () => []
  },
  maxLength: {  
    type: [Number, String],
    default: null
  },
  placeholder: {
    type: String,
    default: 'Выберите или введите...'
  },
  label: {
    type: String,
    default: ''
  },
  optionLabel: {
    type: String,
    default: 'label'
  },
  optionValue: {
    type: String,
    default: 'id'
  },
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  dropdownMaxHeight: {
    type: String,
    default: '190px'
  },
  customClass: String,
  // Кастомные правила валидации
  rules: {
    type: Array,
    default: () => []
  },
  // Кастомное сообщение для required
  requiredMessage: {
    type: String,
    default: 'Обязательное поле'
  },
  // Показывать ошибку сразу или после потери фокуса
  validateOnBlur: {
    type: Boolean,
    default: true
  },
  returnObject: {
    type: Boolean,
    default: true // true - возвращаем объект, false - возвращаем строку
  },
  // Задержка поиска в миллисекундах
  searchDebounce: {
    type: Number,
    default: 20
  },
  // Функция для загрузки опций с сервера
  loadOptions: {
    type: Function,
    default: null
  },
})

const emit = defineEmits(['update:modelValue', 'blur', 'valid', 'error'])

const inputRef = ref(null)
const searchValue = ref('')
const showDropdown = ref(false)
const isTouched = ref(false)
const internalError = ref('')
const isSearching = ref(false)
const searchTimeout = ref(null)
const localOptions = ref([])
const loadingNextPage = ref(false)
const pagination = ref({
  currentPage: 1,
  lastPage: 1,
  nextPageUrl: null,
  prevPageUrl: null,
  hasMorePages: false
})

const allOptions = computed(() => {
  // Если есть локально загруженные опции, используем их
  if (localOptions.value.length > 0) {
    return localOptions.value
  }
  // Иначе используем переданные через пропс
  return props.options
})

// Валидация поля
const validate = () => {
  const value = props.modelValue
  
  // Проверка required
  if (props.required) {
    if (value === null || value === undefined || value === '') {
      return props.requiredMessage
    }
    
    if (typeof value === 'string' && !value.trim()) {
      return props.requiredMessage
    }
  }
  
  // Кастомные правила
  for (const rule of props.rules) {
    if (typeof rule === 'function') {
      const result = rule(value)
      if (typeof result === 'string') {
        return result
      }
    } else if (rule && rule.validator && rule.message) {
      if (!rule.validator(value)) {
        return rule.message
      }
    }
  }
  
  return ''
}

// Обновляем ошибку при изменении значения
watch(() => props.modelValue, () => {
  if (isTouched.value) {
    internalError.value = validate()
    emit('valid', !internalError.value)
    emit('error', internalError.value)
  }
})

const showError = computed(() => {
  return (isTouched.value || !props.validateOnBlur) && internalError.value
})

const errorMessage = computed(() => internalError.value)

// Получение значения опции
const getOptionValue = (option) => {
  return typeof option === 'object' ? option[props.optionValue] : option
}

// Получение метки опции
const getOptionLabel = (option) => {
  return typeof option === 'object' ? option[props.optionLabel] : String(option)
}

// Проверка, выбрана ли опция
const isOptionSelected = (option) => {
  const optionValue = getOptionValue(option)
  const currentValue = props.modelValue
  
  if (typeof currentValue === 'object') {
    return currentValue && getOptionValue(currentValue) === optionValue
  }
  return currentValue === optionValue
}

const loadOptionsFromServer = async (searchTerm, url = null, append = false) => {
  if (!props.loadOptions) return
  
  if (!append) {
    isSearching.value = true
    // При новом поиске очищаем старые опции
    localOptions.value = []
  } else {
    loadingNextPage.value = true
  }
  
  try {
    // Передаём и searchTerm, и url (если есть)
    const responseData = await props.loadOptions(searchTerm, url)
    console.log("Load in combobox: ", responseData)
    
    // Сохраняем информацию о пагинации из ответа
    pagination.value = {
      currentPage: responseData.current_page,
      lastPage: responseData.last_page,
      nextPageUrl: responseData.next_page_url,
      prevPageUrl: responseData.prev_page_url,
      hasMorePages: responseData.current_page < responseData.last_page
    }
    
    // Извлекаем массив опций из responseData.data
    const items = responseData.data || []
    
    if (append) {
      // Добавляем новые элементы к существующим
      localOptions.value = [...localOptions.value, ...items]
    } else {
      // Заменяем все элементы
      localOptions.value = items
    }
    
    // Если есть выбранное значение
    if (!append && props.modelValue && localOptions.value.length > 0) {
      const matchingOption = localOptions.value.find(opt => 
        getOptionValue(opt) === (typeof props.modelValue === 'object' 
          ? getOptionValue(props.modelValue) 
          : props.modelValue)
      )
      if (matchingOption) {
        searchValue.value = getOptionLabel(matchingOption)
      }
    }
  } catch (error) {
    console.error('Ошибка загрузки опций:', error)
    if (!append) {
      localOptions.value = []
    }
  } finally {
    if (!append) {
      isSearching.value = false
    } else {
      loadingNextPage.value = false
    }
  }
}

const loadNextPageFromUrl = async () => {
  if (!pagination.value.nextPageUrl || loadingNextPage.value || isSearching.value) 
  {
    console.log(pagination.value.nextPageUrl, "  ", loadingNextPage.value, "  ", isSearching.value)
    return
  }
  
  // Вызываем loadOptionsFromServer с url и append = true
  await loadOptionsFromServer(null, pagination.value.nextPageUrl, true)
}

const debouncedSearch = (searchTerm) => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
  
  if (props.loadOptions) {
    searchTimeout.value = setTimeout(async () => {
      // При поиске всегда передаём searchTerm, без url, append = false
      await loadOptionsFromServer(searchTerm, null, false)
      searchTimeout.value = null
    }, props.searchDebounce)
  } else {
    emit('search', searchTerm)
  }
}

// Обновите handleDropdownScroll для использования nextPageUrl
const handleDropdownScroll = async (event) => {
  if (!pagination.value.nextPageUrl || loadingNextPage.value || isSearching.value) 
  {
    console.log(pagination.value.nextPageUrl, "  ", loadingNextPage.value, "  ", isSearching.value)
    return
  }
  
  const { scrollTop, scrollHeight, clientHeight } = event.target
  const scrollBottom = scrollHeight - scrollTop - clientHeight
  console.log("ScrollBottom: ", scrollBottom)
  // Загружаем следующую страницу, когда осталось меньше 50px до конца
  if (scrollBottom < 50) {
    // Здесь нужно сделать запрос по URL следующей страницы
    // Но текущий loadOptions принимает только searchTerm
    // Нужно расширить его функциональность
    await loadNextPageFromUrl()
  }
}

const handleFocus = () => {
  if (props.disabled) 
    return
  
  showDropdown.value = true
  isSearching.value = true
  
  // Запускаем debounced поиск с пустым термином при первом открытии
  debouncedSearch('', true)
  
  emit('focus')
}

// Обработчик ввода
const handleInput = (event) => {
  console.log("Input change ", event.target.value)
  const inputValue = event.target.value
  searchValue.value = inputValue
  showDropdown.value = true
  
  // Запускаем debounced поиск
  debouncedSearch(inputValue)
  
  // Это позволит родительскому компоненту отслеживать изменения поля ввода
  emit('update:modelValue', inputValue)
}

// Обработчик выбора опции
const selectOption = (option) => {
  const optionLabel = getOptionLabel(option)
  
  searchValue.value = optionLabel
  
  if (props.returnObject) {
    emit('update:modelValue', option) // возвращаем объект
  } else {
    emit('update:modelValue', optionLabel) // возвращаем строку
  }
  
  showDropdown.value = false

  emit('update:modelValue', option)
  isTouched.value = true
  internalError.value = validate()
  emit('valid', !internalError.value)
  emit('error', internalError.value)
  
  // Фокус на инпуте после выбора
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.focus()
    }
  })

  // Очищаем таймаут поиска при выборе опции
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
    searchTimeout.value = null
    isSearching.value = false
  }
}

// Обработчик потери фокуса
const handleBlur = () => {
  setTimeout(() => {
    showDropdown.value = false
    isTouched.value = true
    
    // Проверяем, соответствует ли введенный текст какой-либо опции
    if (searchValue.value && allOptions.value.length > 0) {
      const matchingOption = allOptions.value.find(option => 
        getOptionLabel(option).toLowerCase() === searchValue.value.toLowerCase()
      )
      
      if (!matchingOption) {
        // Если не соответствует, сбрасываем значение
        searchValue.value = ''
        emit('update:modelValue', null)
      }
    }
    
    internalError.value = validate()
    emit('blur')
    emit('valid', !internalError.value)
    emit('error', internalError.value)
  }, 50)

  // Очищаем таймаут поиска при потере фокуса
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
    searchTimeout.value = null
    isSearching.value = false
  }
}

// Метод для принудительной валидации
const validateField = () => {
  isTouched.value = true
  internalError.value = validate()
  emit('valid', !internalError.value)
  emit('error', internalError.value)
  return !internalError.value
}

// Метод для сброса ошибки
const clearError = () => {
  internalError.value = ''
  isTouched.value = false
  emit('error', '')
}

// Метод для установки внешней ошибки
const setError = (message) => {
  isTouched.value = true
  internalError.value = message
  emit('error', message)
}

// Синхронизация modelValue с searchValue
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    if (typeof newValue === 'object') {
      searchValue.value = getOptionLabel(newValue)
    } else {
      searchValue.value = String(newValue)
    }
  } else {
    searchValue.value = ''
  }
}, { immediate: true })

watch(() => props.options, (newOptions) => {
  if (newOptions && newOptions.length > 0) {
    // Если есть выбранное значение, обновляем отображение
    if (props.modelValue) {
      const matchingOption = newOptions.find(opt => 
        getOptionValue(opt) === (typeof props.modelValue === 'object' 
          ? getOptionValue(props.modelValue) 
          : props.modelValue)
      )
      if (matchingOption) {
        searchValue.value = getOptionLabel(matchingOption)
      }
    }
  }
}, { deep: true })

// Метод для фокуса на инпут
const focus = () => {
  if (inputRef.value) {
    inputRef.value.focus()
  }
}

// Метод для очистки
const clear = () => {
  searchValue.value = ''
  emit('update:modelValue', null)
  clearError()
  localOptions.value = []

  // Очищаем таймаут поиска
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
    searchTimeout.value = null
    isSearching.value = false
  }
}

const clearLocalOptions = () => {
  localOptions.value = []
}

const reloadOptions = async (searchTerm = '') => {
  if (props.loadOptions) {
    await loadOptionsFromServer(searchTerm)
  }
}

// Экспортируем методы
defineExpose({
  focus,
  clear,
  validate: validateField,
  clearError,
  setError,
  reloadOptions,
  clearLocalOptions,
  isValid: computed(() => !internalError.value)
})
</script>

<style scoped>
.ui-combobox-wrapper {
  position: relative;
  width: 100%;
  max-height: 100px;
}

.combobox-container {
  position: relative;
  width: 100%;
}

.combobox-container.has-error .ui-combobox-input {
  border-color: #b00020;
  background-color: #fff5f5;
}

.ui-combobox-input {
  width: 100%;
  padding: 4px 6px;
  border: 1px solid #c5c5c5;
  border-radius: 6px;
  font-size: 14px;
  color: #141414;
  background-color: white;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.ui-combobox-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.combobox-container.has-error .ui-combobox-input:focus {
  border-color: #b00020;
  box-shadow: 0 0 0 2px rgba(176, 0, 32, 0.1);
}


.ui-combobox-input::placeholder {
  color: #9a9a9a;
  font-style: italic;
}

.ui-combobox-label {
  font-size: 12px;
  color: #8c8c8c;
  font-weight: 500;
}

.required-asterisk {
  color: #b00020;
  margin-left: 2px;
}

/* Выпадающий список */
.combobox-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 9;
  margin-top: 2px;
  overflow-y: auto;
  scrollbar-width: thin;
}

/* Опции выпадающего списка */
.combobox-option {
  padding: 8px 12px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.combobox-option:hover {
  background-color: #e3ecff;
}

.combobox-option-selected {
  background-color: #eff6ff;
  color: #1d4ed8;
  font-weight: 500;
}

.combobox-option:not(:last-child) {
  border-bottom: 1px solid #f3f4f6;
}

/* Стили для отсутствия результатов */
.combobox-no-results {
  padding: 12px;
  color: #6b7280;
  font-size: 14px;
  text-align: center;
}

.combobox-no-results-text {
  font-style: italic;
}

/* Ошибка */
.combobox-error {
  font-size: 11px;
  color: #b00020;
  margin-top: 4px;
  padding-left: 4px;
}

.ui-combobox-input:disabled {
  background-color: #ebebeb;
  opacity: 0.7;
}

.ui-combobox-input:disabled:hover {
  border-color: #c5c5c5;
}

/* Индикатор загрузки */
.search-loading {
  position: absolute;
  right: 8px;
  top: 50%;
  width: 16px;
  height: 16px;
  border: 2px solid #e5e7eb;
  border-top-color: #f63b3b;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  pointer-events: none;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Стили для индикатора загрузки в выпадающем списке */
.combobox-loading {
  padding: 12px;
  color: #6b7280;
  font-size: 14px;
  text-align: center;
}

.combobox-loading-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.combobox-loading-text::after {
  content: '';
  width: 16px;
  height: 16px;
  border: 2px solid #e5e7eb;
  border-top-color: #2171f3;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
</style>