<template>
  <UIIcons ref="uiIcons" />
  <Teleport to="body">
    <div v-if="isOpen" class="delete-modal-overlay" @click.self="handleConfirm">
      <div class="delete-modal">
        <div class="delete-modal-body">
            <div class="success-modal-icon">
                <Icon v-if="type==='success'" :icon="uiIcons?.icons.success" width="64" height="64" />
            </div>
            <div class="warning-modal-icon">
                <Icon v-if="type==='notSuccess'" :icon="uiIcons?.icons.warning" width="64" height="64" />
            </div>
            <p class="delete-modal-message">{{ title }}</p>
            <p class="delete-modal-submessage">{{ mainMessage }}</p>
        </div>
        
        <div class="delete-modal-footer">
          <button 
            class="delete-modal-btn delete-modal-btn-danger" 
            @click="handleConfirm"
            :disabled="processing"
          >
            <span v-if="processing" class="spinner"></span>
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import UIIcons from '@/components/common/UI/UIIcons.vue'

const uiIcons = ref()

const isOpen = ref(false)
const title = ref('')
const mainMessage = ref('Операция выполнена успешно!')
const confirmText = ref('Ок')
const type = ref('notSuccess')
const processing = ref(false)
let resolvePromise = null

const open = (options = {}) => {
    title.value = options.title
  mainMessage.value = options.mainMessage
  type.value = options.type
  isOpen.value = true
  document.body.style.overflow = 'hidden'
  return new Promise((resolve) => {
    resolvePromise = resolve
  })
}

const close = () => {
  isOpen.value = false
  document.body.style.overflow = ''
  resolvePromise = null
}

const handleConfirm = () => {
  if (resolvePromise) resolvePromise(true)
  close()
}

const handleCancel = () => {
  if (resolvePromise) resolvePromise(false)
  close()
}

// Обработка клавиши Escape
const handleKeyDown = (e) => {
  if (e.key === 'Escape' && isOpen.value) {
    handleCancel()
  }
}

// Добавляем/удаляем обработчик при открытии/закрытии
watch(isOpen, (newVal) => {
  if (newVal) {
    document.addEventListener('keydown', handleKeyDown)
  } else {
    document.removeEventListener('keydown', handleKeyDown)
  }
})

defineExpose({ open, close })
</script>

<style scoped>
.delete-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.2s ease;
}

.delete-modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: slideUp 0.3s ease;
  overflow: hidden;
}

.delete-modal-body {
  padding: 20px 20px;
  text-align: center;
}

.success-modal-icon {
  color: #1cc310;
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
}
.warning-modal-icon {
  color: #fc830b;
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
}

.delete-modal-message {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #1f2937;
  font-weight: 600;
}

.delete-modal-submessage {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
}

.delete-modal-footer {
  display: flex;
  justify-content: center;
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.delete-modal-btn {
  flex: 1;
  padding: 6px 10px;
  max-width: 40%;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  text-align: center;
  position: relative;
}

.delete-modal-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.delete-modal-btn-secondary {
  background-color: white;
  color: #4b5563;
  border: 1px solid #d1d5db;
}

.delete-modal-btn-secondary:hover:not(:disabled) {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

.delete-modal-btn-danger {
  background-color: #1cc310;
  color: white;
}

.delete-modal-btn-danger:hover:not(:disabled) {
  background-color: #18a60e;
}

/* Спиннер для кнопки */
.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
  margin-right: 8px;
  vertical-align: middle;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>