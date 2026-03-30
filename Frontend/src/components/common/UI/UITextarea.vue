<template>
  <div class="ui-textarea-wrapper" :class="[customClass, { 'required-field': required }]">
    <div v-if="showHeader" class="ui-textarea-header">
      <span class="ui-textarea-label">
        {{ label }}
        <span v-if="required" class="required-asterisk">*</span>
        <span v-if="showError" class="textarea-error">{{ errorMessage }}</span>
      </span>
      <span v-if="showCharCount" class="ui-textarea-char-count" :class="{ 'char-count-warning': currentLength >= maxLength }">
        {{ currentLength }}/{{ maxLength }}
      </span>
    </div>
    <textarea
      ref="textareaRef"
      :value="modelValue"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      :placeholder="placeholder"
      :maxlength="maxLength"
      :rows="rows"
      :disabled="disabled"
      :readonly="readonly"
      class="ui-textarea"
      :class="{ 'has-error': showError }"
      :style="{ minHeight: minHeight, maxHeight: maxHeight }"
    ></textarea>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Введите текст...'
  },
  maxLength: {
    type: Number,
    default: null
  },
  rows: {
    type: Number,
    default: 3
  },
  minHeight: {
    type: String,
    default: '80px'
  },
  maxHeight: {
    type: String,
    default: '200px'
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
  readonly: {
    type: Boolean,
    default: false
  },
  customClass: String,
  // Поле обязательно для заполнения
  required: {
    type: Boolean,
    default: false
  },
  rules: {
    type: Array,
    default: () => []
  },
  requiredMessage: {
    type: String,
    default: 'Обязательное поле'
  },
  validateOnBlur: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'valid', 'error'])

const textareaRef = ref(null)
const isFocused = ref(false)
const isTouched = ref(false)
const internalError = ref('')

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
  
  // Проверка минимальной длины
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

const currentLength = computed(() => {
  return props.modelValue ? props.modelValue.length : 0
})

const handleInput = (event) => {
  emit('update:modelValue', event.target.value)
  autoResize()
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

// Метод для фокуса
const focus = () => {
  if (textareaRef.value) {
    textareaRef.value.focus()
  }
}

// Метод для очистки
const clear = () => {
  emit('update:modelValue', '')
  clearError()
}

// Автоматическое изменение высоты
const autoResize = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    const newHeight = Math.min(textareaRef.value.scrollHeight, parseInt(props.maxHeight))
    textareaRef.value.style.height = newHeight + 'px'
  }
}

// Экспортируем методы
defineExpose({
  focus,
  clear,
  autoResize,
  validate: validateField,
  clearError,
  setError,
  isValid: computed(() => !internalError.value)
})
</script>

<style scoped>
.ui-textarea-wrapper {
  position: relative;
  width: 100%;
}

.ui-textarea-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2px;
}

.ui-textarea-label {
  font-size: 12px;
  color: #8c8c8c;
  font-weight: 500;
}

.required-asterisk {
  color: #b00020;
  margin-left: 2px;
}

.ui-textarea-char-count {
  font-size: 10px;
  color: #6c757d;
  font-weight: 400;
}

.ui-textarea-char-count.char-count-warning {
  color: #dc3545;
}

.ui-textarea {
  width: 100%;
  padding: 4px 6px;
  border: 1px solid #c5c5c5;
  border-radius: 6px;
  font-size: 14px;
  color: #141414;
  background-color: white;
  transition: all 0.2s ease;
  box-sizing: border-box;
  font-family: inherit;
  resize: none;
  min-height: v-bind(minHeight);
  max-height: v-bind(maxHeight);
  overflow-y: auto;
  scrollbar-width: thin;
}

.ui-textarea.has-error {
  border-color: #b00020;
  background-color: #fff5f5;
}

.ui-textarea.has-readonly {
  border-color: #9a9a9a !important;
}

.ui-textarea:hover {
  border-color: #3b82f6;
}

.ui-textarea.has-error:hover {
  border-color: #b00020;
}

.ui-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.ui-textarea.has-error:focus {
  border-color: #b00020;
  box-shadow: 0 0 0 2px rgba(176, 0, 32, 0.1);
}

.ui-textarea::placeholder {
  color: #9a9a9a;
  font-style: italic;
}

.ui-textarea:disabled {
  background-color: #f9fafb;
  color: #9ca3af;
  cursor: not-allowed;
  border-color: #e5e7eb;
}

/* Ошибка */
.textarea-error {
  font-size: 11px;
  color: #b00020;
  margin-top: 4px;
  padding-left: 4px;
  display: inline-block;
  margin-left: 8px;
}
</style>