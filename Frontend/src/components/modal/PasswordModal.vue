<!-- src/components/common/UI/PasswordModal.vue -->
<template>
  <UIIcons ref="uiIcons" />
  <div v-if="visible" class="password-modal-backdrop">
    <div class="password-modal" aria-modal="true" :aria-label="title">
      <header class="modal-header">
        <h2 class="modal-title">{{ title }}</h2>
        <button class="close-btn" @click="close" title="Закрыть">
          <Icon :icon="uiIcons?.icons.close" class="close-btn-icon" width="36" height="36" />
        </button>
      </header>

      <div class="modal-body">
        <!-- Шаг 2: Ввод нового пароля (после подтверждения старого) -->
        <div v-if="mode === 'edit'" class="form-container">
          <UIInput
            ref="oldPasswordInput"
            v-model="form.oldPassword"
            label="Текущий пароль"
            type="password"
            :required="true"
            :min-length="6"
            :max-length="30"
            placeholder="Введите текущий пароль"
            :show-password-toggle="true"
            :validate-on-blur="true"
            :rules="oldPasswordRules"
          />
          <div class="password-field-container">
            <UIInput
              ref="passwordInput"
              v-model="form.password"
              label="Новый пароль"
              type="password"
              :required="true"
              :min-length="6"
              :max-length="30"
              placeholder="Введите новый пароль"
              :show-password-toggle="true"
              :validate-on-blur="true"
              :rules="passwordRules"
              @update:modelValue="checkPasswordStrength"
              @blur="checkPasswordStrength"
            />
            
            <!-- Индикатор сложности пароля -->
            <div v-if="form.password.length > 0" class="password-strength">
              <div class="strength-bars">
                <div 
                  v-for="index in 3"
                  :key="index"
                  class="strength-bar" 
                  :class="getStrengthClass(index)"
                  :style="{ backgroundColor: getBarColor(index) }"
                ></div>
              </div>
              <span class="strength-text" :style="{ color: getStrengthTextColor() }">
                {{ strengthText }}
              </span>
            </div>
          </div>
          
          <UIInput
            ref="confirmPasswordInput"
            v-model="form.confirmPassword"
            label="Подтверждение нового пароля"
            type="password"
            :required="true"
            :min-length="6"
            :max-length="30"
            placeholder="Подтвердите новый пароль"
            :show-password-toggle="true"
            :validate-on-blur="true"
          />
        </div>

        <!-- Режим создания пользователя -->
        <div v-if="mode === 'create'" class="form-container">
          <div class="password-field-container">
            <UIInput
              ref="passwordInput"
              v-model="form.password"
              label="Пароль"
              type="password"
              :required="true"
              :min-length="6"
              :max-length="30"
              placeholder="Введите пароль"
              :show-password-toggle="true"
              :validate-on-blur="true"
              :rules="passwordRules"
              @update:modelValue="checkPasswordStrength"
              @blur="checkPasswordStrength"
            />
            
            <!-- Индикатор сложности пароля -->
            <div v-if="form.password.length > 0" class="password-strength">
              <div class="strength-bars">
                <div 
                  v-for="index in 3"
                  :key="index"
                  class="strength-bar" 
                  :class="getStrengthClass(index)"
                  :style="{ backgroundColor: getBarColor(index) }"
                ></div>
              </div>
              <span class="strength-text" :style="{ color: getStrengthTextColor() }">
                {{ strengthText }}
              </span>
            </div>
          </div>
          
          <UIInput
            ref="confirmPasswordInput"
            v-model="form.confirmPassword"
            label="Подтверждение пароля"
            type="password"
            :required="true"
            :min-length="6"
            :max-length="30"
            placeholder="Подтвердите пароль"
            :show-password-toggle="true"
            :validate-on-blur="true"
          />
        </div>
      </div>

      <div class="modal-actions">
        <!-- Для режима edit показываем разные кнопки в зависимости от шага -->
        <template v-if="mode === 'edit'">
          <button 
            class="save-btn" 
            @click="changePassword"
            :disabled="loading"
          >
            <span v-if="loading" class="spinner"></span>
            <Icon v-else :icon="uiIcons?.icons.save" width="20" height="20" />
            Изменить пароль
          </button>
        </template>

        <!-- Для режима create -->
        <button 
          v-if="mode === 'create'"
          class="save-btn" 
          @click="createUser"
          :disabled="loading"
        >
          <span v-if="loading" class="spinner"></span>
          <Icon v-else :icon="uiIcons?.icons.save" width="20" height="20" />
          Создать пользователя
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, nextTick, computed } from 'vue'
import UIInput from '../common/UI/UIInput.vue'
import { Icon } from '@iconify/vue'
import { useUsersStore } from '@/stores/users.store'
import UIIcons from '@/components/common/UI/UIIcons.vue'

const uiIcons = ref()

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: 'Создание пароля' },
  userData: { type: Object, default: null },
  mode: { type: String, default: 'create' } // 'create' или 'edit'
})

const emit = defineEmits(['update:modelValue', 'apply', 'cancel', 'userCreated', 'passwordChanged'])

// Store
const usersStore = useUsersStore()

// Refs для полей ввода
const oldPasswordInput = ref(null)
const passwordInput = ref(null)
const confirmPasswordInput = ref(null)

// Состояние
const visible = ref(props.modelValue)
const loading = ref(false)
const verifying = ref(false)
const error = ref(null)
const passwordStrength = ref(0)

// Форма
const form = reactive({
  oldPassword: '',
  password: '',
  confirmPassword: ''
})

// Следим за видимостью
watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    resetForm()
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

// Правила валидации для старого пароля
const oldPasswordRules = [
  {
    validator: (value) => {
      if (!value) return true
      if (value.length < 6) {
        return 'Пароль должен содержать минимум 6 символов'
      }
      return true
    },
    message: 'Неверный формат пароля'
  }
]

// Правила валидации для нового пароля
const passwordRules = [
  {
    validator: (value) => {
      if (!value) return true
      const hasUpperCase = /[A-Z]/.test(value)
      const hasLowerCase = /[a-z]/.test(value)
      const hasNumbers = /\d/.test(value)
      
      const onlyDigits = /^\d+$/.test(value)
      const onlyLetters = /^[A-Za-z]+$/.test(value)
      
      if (onlyDigits) {
        return 'Пароль не может состоять только из цифр'
      }
      
      if (onlyLetters) {
        return 'Пароль должен содержать хотя бы одну цифру'
      }
      
      if (!hasUpperCase || !hasLowerCase) {
        return 'Пароль должен содержать заглавные и строчные буквы'
      }
      
      if (!hasNumbers) {
        return 'Пароль должен содержать хотя бы одну цифру'
      }
      
      return true
    },
    message: 'Пароль не соответствует требованиям безопасности'
  }
]

// Текст сложности пароля
const strengthText = computed(() => {
  if (form.password.length === 0) return ''
  if (passwordStrength.value === 0) return 'Слабый'
  if (passwordStrength.value === 1) return 'Средний'
  if (passwordStrength.value === 2) return 'Хороший'
  return 'Отличный'
})

// Функция проверки сложности пароля
function checkPasswordStrength() {
  const value = form.password
  if (!value) {
    passwordStrength.value = 0
    return
  }
  
  let score = 0
  
  if (value.length >= 6) score++
  
  const hasUpperCase = /[A-Z]/.test(value)
  const hasLowerCase = /[a-z]/.test(value)
  const hasNumbers = /\d/.test(value)
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value)
  
  if (hasUpperCase && hasLowerCase) score++
  if (hasNumbers) score++
  if (hasSpecial) score++
  
  const onlyDigits = /^\d+$/.test(value)
  const onlyLetters = /^[A-Za-z]+$/.test(value)
  const sequential = /(?:012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(value)
  
  if (onlyDigits || onlyLetters) score = Math.max(0, score - 1)
  if (sequential) score = Math.max(0, score - 1)
  
  if (score <= 1) passwordStrength.value = 0
  else if (score <= 2) passwordStrength.value = 1
  else if (score <= 4) passwordStrength.value = 2
  else passwordStrength.value = 3
}

// Получить цвет для полоски
function getBarColor(barIndex) {
  if (passwordStrength.value === 0) return '#f44336'
  if (passwordStrength.value === 1) return barIndex <= 1 ? '#ff9800' : '#e0e0e0'
  if (passwordStrength.value === 2) return barIndex <= 2 ? '#4caf50' : '#e0e0e0'
  return '#4caf50'
}

// Получить класс для полоски
function getStrengthClass(barIndex) {
  return {
    'active': barIndex <= passwordStrength.value
  }
}

// Получить цвет текста
function getStrengthTextColor() {
  if (passwordStrength.value === 0) return '#f44336'
  if (passwordStrength.value === 1) return '#ff9800'
  if (passwordStrength.value === 2) return '#4caf50'
  return '#2e7d32'
}

// Валидация полей нового пароля
function validateNewPassword() {
  let isValid = true
  const errors = []

  if (oldPasswordInput.value && typeof oldPasswordInput.value.validate === 'function') {
    
    const passwordValid = passwordInput.value.validate()
    if (!passwordValid) {
      isValid = false
      if (oldPasswordInput.value.errorMessage) {
        errors.push({
          field: 'Текущий пароль',
          error: oldPasswordInput.value.errorMessage
        })
      }
    }
  }
  
  if (passwordInput.value && typeof passwordInput.value.validate === 'function') {
    checkPasswordStrength()
    
    const passwordValid = passwordInput.value.validate()
    if (!passwordValid) {
      isValid = false
      if (passwordInput.value.errorMessage) {
        errors.push({
          field: 'Новый пароль',
          error: passwordInput.value.errorMessage
        })
      }
    }
  }
  
  if (confirmPasswordInput.value && typeof confirmPasswordInput.value.validate === 'function') {
    const confirmValid = confirmPasswordInput.value.validate()
    if (!confirmValid) {
      isValid = false
    }
  }
  
  if (form.password !== form.confirmPassword) {
    isValid = false
    
    if (confirmPasswordInput.value && typeof confirmPasswordInput.value.setError === 'function') {
      confirmPasswordInput.value.setError('Пароли не совпадают')
    }
    
    errors.push({
      field: 'Подтверждение пароля',
      error: 'Пароли не совпадают'
    })
  }
  
  if (form.password.length > 0 && passwordStrength.value === 0) {
    isValid = false
    if (passwordInput.value && typeof passwordInput.value.setError === 'function') {
      passwordInput.value.setError('Пароль слишком слабый. Используйте комбинацию букв разного регистра и цифр')
    }
  }
  
  return isValid
}

// Смена пароля
async function changePassword() {
  if (!validateNewPassword()) {
    return
  }
  
  loading.value = true
  error.value = null
  
  try {
    const payload = {
      user_id: props.userData.user_id,
      old_password: form.oldPassword,
      password: form.password,
      password_confirmation: form.confirmPassword
    }
    
    // Вызов метода из store для смены пароля
    const response = await usersStore.changePassword(payload)
    
    emit('passwordChanged', response)
    close()
  } catch (err) {
    error.value = err?.message || 'Ошибка при смене пароля'
    
    if (err?.response?.status === 422) {
      const d = err.response.data
      const fieldErrors = d?.errors || d?.validator_fails || {}
      
      if (fieldErrors.password && passwordInput.value) {
        passwordInput.value.setError?.(fieldErrors.password[0])
      }
      if (fieldErrors.password_confirmation && confirmPasswordInput.value) {
        confirmPasswordInput.value.setError?.(fieldErrors.password_confirmation[0])
      }
    }
  } finally {
    loading.value = false
  }
}

// Создание пользователя
async function createUser() {
  if (!validateNewPassword()) {
    return
  }
  
  loading.value = true
  error.value = null
  
  try {
    const payload = {
      ...props.userData,
      password: form.password,
      password_confirmation: form.confirmPassword
    }
    
    console.log("Отправка на сервер при создании пользователя: ", payload)
    
    // Вызов метода из store для создания пользователя
    const res = await usersStore.createUser(payload)
    
    emit('userCreated', res)
    close()
  } catch (err) {
    error.value = err?.message || 'Ошибка при создании пользователя'
    
    if (err?.response?.status === 422) {
      const d = err.response.data
      const fieldErrors = d?.errors || d?.validator_fails || {}
      
      if (fieldErrors.password && passwordInput.value) {
        passwordInput.value.setError?.(fieldErrors.password[0])
      }
      if (fieldErrors.password_confirmation && confirmPasswordInput.value) {
        confirmPasswordInput.value.setError?.(fieldErrors.password_confirmation[0])
      }
    }
  } finally {
    loading.value = false
  }
}

// Следим за изменениями пароля для автоочистки ошибки совпадения
watch(() => form.password, () => {
  if (form.password === form.confirmPassword && confirmPasswordInput.value) {
    confirmPasswordInput.value.clearError?.()
  }
})

watch(() => form.confirmPassword, () => {
  if (form.password === form.confirmPassword && confirmPasswordInput.value) {
    confirmPasswordInput.value.clearError?.()
  }
})

// Сброс формы
function resetForm() {
  form.oldPassword = ''
  form.password = ''
  form.confirmPassword = ''
  error.value = null
  passwordStrength.value = 0
  loading.value = false
  verifying.value = false
  
  nextTick(() => {
    if (oldPasswordInput.value?.clearError) {
      oldPasswordInput.value.clearError()
    }
    if (passwordInput.value?.clearError) {
      passwordInput.value.clearError()
    }
    if (confirmPasswordInput.value?.clearError) {
      confirmPasswordInput.value.clearError()
    }
  })
}

// Закрытие модального окна
function close() {
  visible.value = false
  resetForm()
  emit('cancel')
}

// Экспортируем методы
defineExpose({
  resetForm,
  clearAllErrors: resetForm,
  validateAll: validateNewPassword
})
</script>

<style scoped>
.password-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1600;
}

.password-modal {
  width: 400px;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-title {
  font-size: 18px;
  margin: 0;
  color: #333;
}

.close-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-btn:hover {
  transform: scale(1.1);
}

.close-btn-icon:hover {
  color: rgb(255, 19, 19);
}

.modal-body {
  margin-bottom: 24px;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.password-field-container {
  position: relative;
}

.password-strength {
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.strength-bars {
  display: flex;
  gap: 4px;
  flex: 1;
}

.strength-bar {
  height: 4px;
  flex: 1;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.strength-text {
  font-size: 11px;
  font-weight: 500;
  min-width: 45px;
  text-align: right;
}

.action-container {
  display: flex;
  justify-content: center;
  margin-top: 8px;
}

.verify-btn {
  background: #2563eb;
  color: white;
  border: none;
  padding: 4px 24px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  min-width: 180px;
}

.verify-btn:hover:not(:disabled) {
  transform: scale(1.03);
}

.verify-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.success-message {
  background: #4caf50;
  color: white;
  padding: 4px 12px;
  border-radius: 6px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.save-btn {
  background: #3cc93a;
  color: white;
  border: none;
  padding: 4px 24px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  min-width: 180px;
  justify-content: center;
}

.save-btn:hover:not(:disabled) {
  background: #34bb32;
  transform: scale(1.03);
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cancel-btn {
  background: #9ca3af;
  color: white;
  border: none;
  padding: 4px 24px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  min-width: 180px;
}

.cancel-btn:hover {
  background: #6b7280;
  transform: scale(1.03);
}

.error-message {
  color: #dc2626;
  font-size: 14px;
  margin-top: 12px;
  padding: 8px;
  background: #fee2e2;
  border-radius: 4px;
  text-align: center;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #ffffff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>