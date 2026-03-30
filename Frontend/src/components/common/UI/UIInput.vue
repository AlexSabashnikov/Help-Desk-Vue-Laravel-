<!-- 
    Поле ввода с валидацией
    Единый стиль для всего приложения
-->

<template>
  <div class="ui-input-wrapper" :class="[customClass, { 'required-field': required }]">
    <UIIcons ref="uiIcons" />
    <div v-if="showHeader" class="ui-input-header">
      <span class="ui-input-label">
        {{ label }}
        <span v-if="required" class="required-asterisk">*</span>
        <!-- Отображение ошибки валидации -->
        <span v-if="showError" class="input-error">{{ errorMessage }}</span>
      </span>
      <span v-if="showCharCount && type === 'text'" class="ui-input-char-count" :class="{ 'char-count-warning': currentLength >= maxLength }">
        {{ currentLength }}/{{ maxLength }}
      </span>
    </div>
    <div class="input-container" :class="{ 'has-error': showError }">
      <!-- Для checkbox используем отдельную структуру -->
      <label v-if="type === 'checkbox'" class="checkbox-label">
        <input
          ref="inputRef"
          type="checkbox"
          :checked="modelValue"
          @change="handleCheckboxChange"
          :disabled="disabled"
          class="checkbox-input"
        />
        <span class="checkbox-box" :class="{ 'checkbox-box--checked': modelValue }">
          <Icon 
            v-if="modelValue"
            :icon="uiIcons?.icons.checkBoxArrow" 
            class="checkbox-icon"
            :width="checkboxIconSize"
            :height="checkboxIconSize"
          />
          <Icon 
            v-else
            :icon="uiIcons?.icons.checkBoxArrow" 
            class="checkbox-icon-off"
            :width="checkboxIconSize"
            :height="checkboxIconSize"
          />
        </span>
      </label>

      <!-- Для всех остальных типов полей -->
      <template v-else>
    <input
      ref="inputRef"
      :value="modelValue"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      :type="inputType"
      :min="min"
      :max="max"
      :step="step"
      :placeholder="placeholder"
      :maxlength="maxLength"
      :required="required"
      :disabled="disabled"
      :style="textStyles"
      :show-password-toggle="showPasswordToggle"
      class="ui-input"
      :class="{ 
        'datetime-input': type === 'datetime-local',
        'with-password-toggle': showPasswordToggle  }"
    />
    <!-- Кнопка показа пароля -->
    <button
      v-if="showPasswordToggle && type === 'password'"
      type="button"
      class="password-toggle-btn"
      @click="togglePasswordVisibility"
      :title="showPassword ? 'Скрыть пароль' : 'Показать пароль'"
      :disabled="disabled"
    >
      <Icon
        v-if="showPassword"
        :icon="uiIcons?.icons.eyeOff" 
        width="18" 
        height="18" 
      />
      <Icon
        v-else
        :icon="uiIcons?.icons.eye" 
        width="18" 
        height="18" 
      />
    </button>
    </template>
  </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import UIIcons from '@/components/common/UI/UIIcons.vue'

const uiIcons = ref()

const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'text',
    validator: (value) => ['text', 'date', 'number', 'datetime-local', 'email', 'checkbox', 'password', 'tel'].includes(value)
  },
  maxLength: {
    type: Number,
    default: null
  },
  minLength: {
    type: Number,
    default: null
  },
  showCharCount: {
    type: Boolean,
    default: false
  },
  showHeader: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  min: {
    type: [Number, String],
    default: null
  },
  max: {
    type: [Number, String],
    default: null
  },
  step: {
    type: [Number, String],
    default: null
  },
  textColor: {
    type: String,
    default: null
  },
  customClass: String,
  required: {
    type: Boolean,
    default: false
  },
  showPasswordToggle: {
    type: Boolean,
    default: true
  },
  checkboxLabel: {
    type: String,
    default: ''
  },
  checkboxIconSize: {
    type: Number,
    default: 16
  },
  // Кастомные правила валидации
  rules: {
    type: Array,
    default: () => []
  },
  // Показывать ошибку сразу или после потери фокуса
  validateOnBlur: {
    type: Boolean,
    default: true
  },
  // Кастомное сообщение для required
  requiredMessage: {
    type: String,
    default: 'Обязательное поле'
  }
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'valid', 'error'])

const inputRef = ref(null)
const isFocused = ref(false)
const isTouched = ref(false)
const internalError = ref('')
const showPassword = ref(false)

// Вычисляемый тип поля для пароля
const inputType = computed(() => {
  if (props.type === 'password' && showPassword.value) {
    return 'text'
  }
  return props.type
})

// Переключение видимости пароля
const togglePasswordVisibility = () => {
  if (!props.disabled) {
    showPassword.value = !showPassword.value
    // Сохраняем позицию курсора после смены типа
    nextTick(() => {
      if (inputRef.value) {
        const cursorPosition = inputRef.value.selectionStart
        inputRef.value.focus()
        inputRef.value.setSelectionRange(cursorPosition, cursorPosition)
      }
    })
  }
}

// Обработчик изменения checkbox
const handleCheckboxChange = (event) => {
  emit('update:modelValue', event.target.checked)
}

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
  
  // Проверка минимальной длины (если указана)
  if (props.minLength && value && String(value).length < props.minLength) {
    return `Минимальная длина ${props.minLength} символов`
  }
  
  // Проверка максимальной длины (если указана)
  if (props.maxLength && value && String(value).length > props.maxLength) {
    return `Максимальная длина ${props.maxLength} символов`
  }
  
  // Проверка email
  if (props.type === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value.toString())) {
      return 'Введите корректный email адрес'
    }
  }
  
  // Проверка телефона
  if (props.type === 'tel' && value) {
    const digitsOnly = value.toString().replace(/\D/g, '')
    
    // Проверка на минимальное количество цифр
    if (digitsOnly.length < 10) {
      return 'Телефон должен содержать минимум 10 цифр'
    }
    
    if (digitsOnly.length > 15) {
      return 'Телефон должен содержать не более 15 цифр'
    }
    
    // Проверка на допустимые символы
    const phoneRegex = /^[\d\s\-+()]+$/
    if (!phoneRegex.test(value.toString())) {
      return 'Телефон может содержать только цифры, пробелы, дефисы, плюс и скобки'
    }
  }
  
  // Кастомные правила
  for (const rule of props.rules) {
    if (typeof rule === 'function') {
      const result = rule(value)
      if (result && typeof result === 'object' && result.valid === false) {
        return result.message
      }
      if (typeof result === 'string' && result) {
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
}, { deep: true })

const showError = computed(() => {
  return (isTouched.value || !props.validateOnBlur) && internalError.value
})

const errorMessage = computed(() => internalError.value)

const currentLength = computed(() => {
  return props.modelValue ? String(props.modelValue).length : 0
})

const textStyles = computed(() => {
  const styles = {}
  if (props.textColor) {
    styles.color = props.textColor
  }
  return styles
})

const handleInput = (event) => {
  emit('update:modelValue', event.target.value)
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

// Метод для установки внешней ошибки (например, с сервера)
const setError = (message) => {
  isTouched.value = true
  internalError.value = message
  emit('error', message)
}

const handleFocus = (event) => {
  isFocused.value = true
  emit('focus', event)
}

const handleBlur = (event) => {
  isFocused.value = false
  isTouched.value = true
  internalError.value = validate()
  emit('blur', event)
  emit('valid', !internalError.value)
  emit('error', internalError.value)
}

// Метод для фокуса
const focus = () => {
  if (inputRef.value) {
    inputRef.value.focus()
  }
}

// Метод для очистки
const clear = () => {
  emit('update:modelValue', '')
  clearError()
}

// Экспортируем методы
defineExpose({
  focus,
  clear,
  validate: validateField,
  clearError,
  setError,
  isValid: computed(() => !internalError.value),
  errorMessage: computed(() => internalError.value)
})
</script>

<style scoped>
.ui-input-wrapper {
  position: relative;
  width: 100%;
}

.ui-input-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ui-input-label {
  font-size: 12px;
  color: #8c8c8c;
  font-weight: 500;
}

.required-asterisk {
  color: #b00020;
  margin-left: 2px;
}

.ui-input-char-count {
  font-size: 10px;
  color: #6c757d;
  font-weight: 400;
}

.ui-input-char-count.char-count-warning {
  color: #dc3545;
}

.input-container {
  position: relative;
  width: 100%;
}

.input-container.has-error .ui-input {
  border-color: #b00020;
  background-color: #fff5f5;
}

.ui-input {
  width: 100%;
  padding-top: 2px;
  padding-bottom: 2px;
  padding-left: 6px;
  padding-right: 3px;
  border: 1px solid #c5c5c5;
  border-radius: 6px;
  font-size: 14px;
  color: #141414;
  background-color: white;
  transition: all 0.2s ease;
  box-sizing: border-box;
  min-height: 28px;
  font-family: inherit;
}

.ui-input.with-password-toggle {
  padding-right: 35px; /* Место для кнопки показа пароля */
}

/* Кнопка показа пароля */
.password-toggle-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  color: #6c757d;
  transition: all 0.2s ease;
  z-index: 2;
}

.password-toggle-btn:hover:not(:disabled) {
  background-color: rgba(0, 0, 0, 0.05);
  color: #3b82f6;
}

.password-toggle-btn:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.password-toggle-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.password-toggle-icon {
  font-size: 18px;
  color: black;
  line-height: 1;
}

/* Стили для checkbox */
.checkbox-label {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  margin-top: 4px;
}

.checkbox-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
}

/* Квадратная рамка чекбокса */
.checkbox-box {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border: 1px solid #aaaaaa;
  border-radius: 4px;
  background-color: white;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

/* Состояние при наведении */
.checkbox-label:hover .checkbox-box {
  border-color: #3b82f6;
}

/* Состояние при выборе */
.checkbox-box--checked {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

/* Иконка внутри чекбокса */
.checkbox-icon {
  display: block;
  color: rgb(255, 255, 255);
  transition: all 0.2s ease;
}

.checkbox-icon-off {
  display: block;
  color: rgba(255, 255, 255, 0);
  transition: all 0.2s ease;
}

/* Стили для стрелок в Chrome, Safari, Edge */
.ui-input[type="number"]::-webkit-outer-spin-button,
.ui-input[type="number"]::-webkit-inner-spin-button {
  position: absolute;
  right: 0;
  height: 75%;
  background-color: #f5f5f500;
  cursor: pointer;
}

.ui-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.ui-input::placeholder {
  color: #9a9a9a;
  font-style: italic;
}

.ui-input:disabled {
  background-color: #f9fafb;
  color: #9ca3af;
  cursor: not-allowed;
  border-color: #e5e7eb;
}

/* Специальные стили для datetime-local */
.ui-input.datetime-input {
  cursor: pointer;
  max-width: 170px;
}


.ui-input.datetime-input::-webkit-calendar-picker-indicator {
  width: 15px; 
  color: #9a9a9a;
  position: absolute;
  padding-left: 130px; /* Пододвигаем ближе к краю */
  cursor: pointer;
}

.ui-input.datetime-input:hover {
  opacity: 1;
  color: rgb(65, 106, 255);
}

/* Стиль для просроченных дедлайнов */
.ui-input.datetime-input.deadline-overdue {
  border-color: #dc3545 !important;
  background-color: #fff5f5 !important;
  color: #dc3545 !important;
}

/* Ошибка */
.input-error {
  font-size: 11px;
  color: #b00020;
  margin-top: 4px;
  padding-left: 4px;
}
</style>