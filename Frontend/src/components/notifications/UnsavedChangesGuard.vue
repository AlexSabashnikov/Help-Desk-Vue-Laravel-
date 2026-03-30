<template>
  <UIIcons ref="uiIcons" />
  <Teleport to="body">
    <div v-if="showDialog" class="guard-modal-overlay">
      <div class="guard-modal">
        
        <div class="guard-modal-body">
          <div class="guard-modal-icon">
            <Icon :icon="uiIcons?.icons.warning" width="54" height="54" />
          </div>
          <p class="guard-modal-message">{{ message }}</p>
          <p class="guard-modal-submessage">Все несохраненные данные будут потеряны.</p>
        </div>
        
        <div class="guard-modal-footer">
          <button class="guard-modal-btn guard-modal-btn-secondary" @click="handleCancel">
            Отмена
          </button>
          <button class="guard-modal-btn guard-modal-btn-danger" @click="handleConfirm">
            Покинуть страницу
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { Icon } from '@iconify/vue'
import UIIcons from '@/components/common/UI/UIIcons.vue'

const uiIcons = ref()

const props = defineProps({
  hasUnsavedChanges: {
    type: Boolean,
    required: true
  },
  onConfirmExit: {
    type: Function,
    required: true
  },
  onCancelExit: {
    type: Function,
    default: () => {}
  },
  message: {
    type: String,
    default: 'У вас есть несохраненные изменения.'
  }
})

const showDialog = ref(false)
let pendingNavigation = null

// Сбрасываем диалог при изменении hasUnsavedChanges
watch(() => props.hasUnsavedChanges, (newVal) => {
  if (!newVal) {
    showDialog.value = false
    pendingNavigation = null
  }
})

onBeforeRouteLeave((to, from, next) => {
  if (props.hasUnsavedChanges) {
    // Сохраняем функцию next для последующего вызова
    pendingNavigation = { to, from, next }
    showDialog.value = true
  } else {
    props.onConfirmExit()
    next()
  }
})

const handleConfirm = () => {
  showDialog.value = false
  if (pendingNavigation) {
    props.onConfirmExit()
    pendingNavigation.next()
    pendingNavigation = null
  }
}

const handleCancel = () => {
  showDialog.value = false
  props.onCancelExit()
  if (pendingNavigation) {
    pendingNavigation.next(false)
    pendingNavigation = null
  }
}

// Обработка клавиши Escape
const handleKeyDown = (e) => {
  if (e.key === 'Escape' && showDialog.value) {
    handleCancel()
  }
}

// Добавляем/удаляем обработчик клавиш
watch(showDialog, (newVal) => {
  if (newVal) {
    document.addEventListener('keydown', handleKeyDown)
    // Блокируем прокрутку body
    document.body.style.overflow = 'hidden'
  } else {
    document.removeEventListener('keydown', handleKeyDown)
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
.guard-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease;
}

.guard-modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 450px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: slideUp 0.3s ease;
  overflow: hidden;
}

.guard-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.guard-modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.guard-modal-close {
  background: none;
  border: none;
  font-size: 20px;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.guard-modal-close:hover {
  color: #1f2937;
  background-color: #f3f4f6;
}

.guard-modal-body {
  padding: 24px 20px;
  text-align: center;
}

.guard-modal-icon {
  color: #f59e0b;
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
}

.guard-modal-message {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #1f2937;
  font-weight: 500;
}

.guard-modal-submessage {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.guard-modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.guard-modal-btn {
  flex: 1;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  text-align: center;
}

.guard-modal-btn-secondary {
  background-color: white;
  color: #4b5563;
  border: 1px solid #d1d5db;
}

.guard-modal-btn-secondary:hover {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

.guard-modal-btn-danger {
  background-color: #ef4444;
  color: white;
}

.guard-modal-btn-danger:hover {
  background-color: #dc2626;
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

/* Адаптация для мобильных устройств */
@media (max-width: 640px) {
  .guard-modal {
    width: 95%;
    margin: 16px;
  }
  
  .guard-modal-footer {
    flex-direction: column-reverse;
  }
  
  .guard-modal-btn {
    width: 100%;
  }
}
</style>