<!-- 
    Выпадающий список с поиском
    Используется для выбора компаний, пользователей, статусов
-->

<template>
  <div class="ui-select-wrapper" :class="[customClass, { 'required-field': required }]" ref="wrapperRef">
  <UIIcons ref="uiIcons" />
    <span class="ui-select-label">
      {{ label }}
      <span v-if="required" class="required-asterisk">*</span>
      <span v-if="showError" class="select-error">{{ errorMessage }}</span>
    </span>
    <!-- Скрытый нативный select для браузерных функций -->
    <select
      :value="modelValue"
      @change="handleNativeChange"
      :class="['ui-select-native', customClass]"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      style="display: none"
    >
      <option v-if="placeholder && !modelValue" value="" disabled selected>
        {{ placeholder }}
      </option>
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
    
    <!-- Кастомный инпут для отображения -->
    <div 
      class="ui-select-custom"
      :style="contentStyles"
      :class="{ 
        'ui-select-open': showDropdown, 
        'has-placeholder': !modelValue,
        'ui-select-disabled': disabled,
        'has-error': showError 
      }"
      @click="toggleDropdown"
    >
      <span class="ui-select-value" :style="textStyles">
        {{ selectedLabel || placeholder || 'Выберите...' }}
      </span>
      <span class="ui-select-arrow" :style="textStyles">
        <Icon :icon="uiIcons?.icons.arrowDown" width="20" height="20" />
      </span>
    </div>
    
    <!-- Кастомный выпадающий список -->
    <div 
      v-if="showDropdown" 
      class="ui-select-dropdown"
      :style="{ maxHeight: dropdownMaxHeight }"
      ref="dropdownRef"
    >
      <div 
        v-for="option in options" 
        :key="option.value" 
        class="ui-select-option"
        @click="selectOption(option)"
        :class="{ 'ui-select-option-selected': isOptionSelected(option) }"
      >
        {{ option.label }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { Icon } from '@iconify/vue'
import UIIcons from '@/components/common/UI/UIIcons.vue'


const uiIcons = ref()

const props = defineProps({
  modelValue: [String, Number],
  options: {
    type: Array,
    default: () => []
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Введите текст...'
  },
  customClass: String,
  dropdownMaxHeight: {
    type: String,
    default: '190px'
  },
  backgroundColor: {
    type: String,
    default: null
  },
  textColor: {
    type: String,
    default: null
  },
  borderColor: {
    type: String,
    default: null
  },
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
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
  }
})

const emit = defineEmits(['update:modelValue', 'blur', 'valid', 'error'])

const wrapperRef = ref(null)
const dropdownRef = ref(null)
const showDropdown = ref(false)
const isTouched = ref(false) // По умолчанию false
const internalError = ref('')

// Валидация поля
const validate = () => {
  const value = props.modelValue
  
  // Проверка required
  if (props.required) {
    if (value === null || value === undefined || value === '') {
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

// Обновляем ошибку при изменении значения, но только если поле уже тронуто
watch(() => props.modelValue, () => {
  if (isTouched.value) {
    internalError.value = validate()
    emit('valid', !internalError.value)
    emit('error', internalError.value)
  }
})

// Показываем ошибку только если поле тронуто и есть ошибка
const showError = computed(() => {
  return isTouched.value && internalError.value
})

const errorMessage = computed(() => internalError.value)

// Получаем выбранную метку
const selectedLabel = computed(() => {
  if (!props.modelValue && props.modelValue !== 0) return ''
  const option = props.options.find(opt => opt.value === props.modelValue)
  return option ? option.label : ''
})

const contentStyles = computed(() => {
  const styles = {}
  if (props.backgroundColor) {
    styles.backgroundColor = props.backgroundColor
  }
  if (props.borderColor) {
    styles.borderColor = props.borderColor
  }
  return styles
})

const textStyles = computed(() => {
  const styles = {}
  if (props.textColor) {
    styles.color = props.textColor
  }
  return styles
})

// Проверяем, выбрана ли опция
const isOptionSelected = (option) => {
  return props.modelValue === option.value
}

// Переключение выпадающего списка
const toggleDropdown = () => {
  if (!props.disabled) {
    showDropdown.value = !showDropdown.value
    // При открытии dropdown не помечаем поле как тронутое
  }
}

// Выбор опции
const selectOption = (option) => {
  emit('update:modelValue', option.value)
  showDropdown.value = false
  // Помечаем как тронутое только при выборе опции
  if (!isTouched.value) {
    isTouched.value = true
  }
  internalError.value = validate()
  emit('valid', !internalError.value)
  emit('error', internalError.value)
}

// Обработчик нативного select
const handleNativeChange = (event) => {
  emit('update:modelValue', event.target.value)
  // Помечаем как тронутое только при изменении
  if (!isTouched.value) {
    isTouched.value = true
  }
  internalError.value = validate()
  emit('valid', !internalError.value)
  emit('error', internalError.value)
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

// Закрытие при клике вне компонента
const handleClickOutside = (event) => {
  if (wrapperRef.value && !wrapperRef.value.contains(event.target)) {
    if (showDropdown.value) {
      showDropdown.value = false
      // Помечаем как тронутое только если был открыт dropdown и закрыт без выбора
      if (!isTouched.value) {
        isTouched.value = true
      }
      internalError.value = validate()
      emit('blur')
      emit('valid', !internalError.value)
      emit('error', internalError.value)
    }
  }
}

// Обработка клавиш
const handleKeyDown = (event) => {
  if (!showDropdown.value) return
  
  if (event.key === 'Escape') {
    showDropdown.value = false
    // Помечаем как тронутое при закрытии по Escape
    if (!isTouched.value) {
      isTouched.value = true
    }
    internalError.value = validate()
    emit('valid', !internalError.value)
    emit('error', internalError.value)
  }
}

// Закрытие по клику вне и обработка клавиш
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeyDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeyDown)
})

// Экспортируем методы
defineExpose({
  validate: validateField,
  clearError,
  setError,
  isValid: computed(() => !internalError.value)
})
</script>

<style scoped>
.ui-select-wrapper {
  position: relative;
  width: 100%;
}

.required-asterisk {
  color: #b00020;
  margin-left: 2px;
}

/* Кастомный инпут */
.ui-select-custom {
  width: 100%;
  padding: 2px 6px;
  border: 1px solid #c5c5c5;
  border-radius: 6px;
  font-size: 14px;
  color: #141414;
  background-color: white;
  transition: all 0.2s ease;
  box-sizing: border-box;
  max-height: 28px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  user-select: none;
}

.ui-select-custom.has-error {
  border-color: #b00020;
  background-color: #fff5f5;
}

.ui-select-custom:hover {
  border-color: #3b82f6;
}

.ui-select-custom.has-placeholder .ui-select-value {
  color: #9a9a9a; 
  font-style: italic;
}

.ui-select-custom.ui-select-open {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.ui-select-custom.has-error.ui-select-open {
  border-color: #b00020;
  box-shadow: 0 0 0 2px rgba(176, 0, 32, 0.1);
}

.ui-select-value {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.ui-select-label {
  font-size: 12px;
  color: #8c8c8c;
  font-weight: 400;
}

.ui-select-arrow {
  align-items: center;
  justify-content: center;
  display: flex;
  color: #9a9a9a;
  margin-left: 8px;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.ui-select-custom.ui-select-open .ui-select-arrow {
  transform: rotate(180deg);
}

/* Выпадающий список */
.ui-select-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 10;
  margin-top: 2px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgb(89, 89, 89) rgba(0, 0, 0, 0);
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Опции выпадающего списка */
.ui-select-option {
  padding: 8px 12px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.ui-select-option:hover {
  background-color: #f3f4f6;
}

.ui-select-option-selected {
  background-color: #eff6ff;
  color: #1d4ed8;
  font-weight: 500;
}

.ui-select-option:not(:last-child) {
  border-bottom: 1px solid #f3f4f6;
}

/* Ошибка */
.select-error {
  font-size: 11px;
  color: #b00020;
  padding-left: 4px;
  margin-top: 4px;
}

/* Нативный select (скрыт) */
.ui-select-native {
  display: none;
}

/* Стили для бейджей приоритета */
.priority-badge {
  font-weight: 600;
  text-align: center;
}

.priority-crit {
  background-color: #fee2e2 !important;
  color: #dc2626 !important;
  border-color: #fca5a5 !important;
}

.priority-high {
  background-color: #ffedd5 !important;
  color: #ea580c !important;
  border-color: #fdba74 !important;
}

.priority-medium {
  background-color: #fef3c7 !important;
  color: #d97706 !important;
  border-color: #fbbf24 !important;
}

.priority-low {
  background-color: #dcfce7 !important;
  color: #16a34a !important;
  border-color: #86efac !important;
}

/* Стиль для типа заявки */
.ticket-type {
  text-align: left;
  font-weight: 400;
}

/* Отключенное состояние */
.ui-select-disabled {
  background-color: #ebebeb;
  opacity: 0.7;
}

.ui-select-disabled:hover {
  border-color: #c5c5c5;
}
</style>