<!-- 
    Создание заявки (администратор)
    Расширенная форма с возможностью указания любого исполнителя
    Выбор из всех компаний-клиентов
    Используется для ручного создания заявок от лица администратора
-->

<template>
  <UIIcons ref="uiIcons" />
  <UnsavedChangesGuard
    :has-unsaved-changes="hasUnsavedChanges"
    :on-confirm-exit="clearDraftAndLeave"
    :on-cancel-exit="cancelExit"
    message="У вас есть несохраненные изменения в черновике заявки."
  />
  <div class="create-ticket-overlay">
    <div class="create-ticket-container">
      <!-- Заголовок страницы -->
      <div class="create-ticket-header">
        <span class="header-text">Создание заявки</span>
        <button class="save-btn" @click="saveChanges" title="Сохранить изменения">
          <Icon :icon="uiIcons?.icons.save" width="24" height="24" /> Сохранить
        </button>
      </div>

      <!-- Блоки заявки -->
      <div class="crate-ticket-body">
        <!-- Основная информация о заявке -->
        <div class="ticket-sections-one">
          <!-- Блок обязательной информации -->
          
          <RequiredBlock
            ref="requiredBlockRef"
            :ticket="localTicket" 
            :mode="mode"
            :user-role="userRole"
            @fieldChange="handleFieldChange" 
            @validationError="handleValidationError"
            @validityChange="handleValidityChange"
            />
        </div>
        <div class="ticket-sections-two">
          <!-- Блок дополнительной информации -->
          <AdditionalBlock 
            :ticket="localTicket"
            :mode="mode"
            :user-role="userRole"
            @fieldChange="handleFieldChange"
            @materialChange="handleMaterialChange"
            @validationError="handleValidationError"
            />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getUserRole } from '@/utils/auth.utils'
import globalApiClient from '@/api/axios.config'
import RequiredBlock from '@/components/tickets/TicketCreateBlocks/RequiredBlock.vue'
import AdditionalBlock from '@/components/tickets/TicketCreateBlocks/AdditionalBlock.vue'
import UnsavedChangesGuard from '@/components/notifications/UnsavedChangesGuard.vue'
import { prepareTicketForSubmit } from '@/utils/form.utils'
import { Icon } from '@iconify/vue'
import UIIcons from '@/components/common/UI/UIIcons.vue'

const uiIcons = ref()

const props = defineProps({
  ticket: {
    type: Object,
    default: () => ({
      id: null,
      number: '',
      subject: '',
      description: '',
      priority: '',
      status: 'new',
      type: '',
      client: {},
      executor: {},
      contactPerson: '',
      phone: '',
      email: '',
      createdAt: '',
      deadline: '',
      workStart: '',
      workEnd: '',
      workCost: null,
      materials: [],
      requestMethod: '',
      address: '',
      distance: ''
    }),
  },
  mode: {
    type: String,
    default: 'create',
  },
})

const router = useRouter()
defineEmits(['save'])

// Ссылки на дочерние компоненты
const requiredBlockRef = ref(null)
const additionalBlockRef = ref(null)

// Ключ для localStorage
const STORAGE_KEY = 'ticket_draft_create'

// Флаг для предотвращения повторных вызовов при успешном сохранении
let isLeaving = false

const hasLocalChanges = ref(false)

// Карта ошибок валидации
const validationErrors = ref(new Map())

// Флаг валидности всей формы
const isFormValid = ref(true)

// Локальная копия заявки для редактирования
const localTicket = ref({ ...props.ticket })

// Компьютед свойство для автоматического обновления статуса
const autoUpdateStatus = computed(() => {
  const executor = localTicket.value.executor
  
  // Проверяем, назначен ли исполнитель
  const isExecutorAssigned = executor && 
                            executor.id && 
                            executor.name && 
                            executor.name.trim() !== '' && 
                            executor.name !== 'Не назначен'
  
  // Возвращаем соответствующий статус
  return isExecutorAssigned ? 'assigned' : 'new'
})

// Следим за изменением исполнителя и обновляем статус
watch(() => localTicket.value.executor, (newExecutor, oldExecutor) => {
  if (JSON.stringify(newExecutor) !== JSON.stringify(oldExecutor)) {
    setTimeout(() => {
      const newStatus = autoUpdateStatus.value
      
      if (localTicket.value.status !== newStatus) {
        console.log(`Автоматическое изменение статуса с "${localTicket.value.status}" на "${newStatus}"`)
        localTicket.value.status = newStatus
      }
    }, 0)
  }
}, { deep: true })

// Флаг наличия изменений - теперь проверяем, есть ли хоть какие-то данные в черновике
const hasUnsavedChanges = computed(() => {
  // Если мы уже покидаем страницу (успешное сохранение), то изменений нет
  if (isLeaving) return false

  if (hasLocalChanges.value) {
    console.log("hasLocalChanges: true")
    return true
  }
  
  const savedDraft = localStorage.getItem(STORAGE_KEY)
  if (!savedDraft) return false
  
  try {
    const parsedDraft = JSON.parse(savedDraft)
    console.log(parsedDraft)
    const hasAnyFieldFilled = Object.entries(parsedDraft).some(([key, value]) => {
      if (key === 'id' || key === 'createdAt' || key === 'status' || key === 'number') 
        return false
      
      if (typeof value === 'object' && value !== null) {
        return Object.keys(value).length > 0 && 
               Object.values(value).some(v => v && v.toString().trim() !== '')
      }
      
      return value && value.toString().trim() !== ''
    })
    console.log("hasUnsaved: ", hasAnyFieldFilled)
    return hasAnyFieldFilled
  } catch (error) {
    console.log(error)
    return false
  }
})

// Функция для проверки, есть ли в объекте заполненные поля
const hasFilledFields = (obj) => {
  return Object.entries(obj).some(([key, value]) => {
    if (key === 'id' || key === 'createdAt' || key === 'status' || key === 'number') return false
    
    if (typeof value === 'object' && value !== null) {
      return Object.keys(value).length > 0 && 
             Object.values(value).some(v => v && v.toString().trim() !== '')
    }
    
    return value && value.toString().trim() !== ''
  })
}

// Инициализация данных из localStorage при загрузке
onMounted(() => {
  loadDraftFromStorage()
  
  if (localTicket.value.executor) {
    const initialStatus = autoUpdateStatus.value
    if (localTicket.value.status !== initialStatus) {
      localTicket.value.status = initialStatus
    }
  }
  
  // Автосохранение при изменении данных
  watch(localTicket, (newValue) => {
  // ДОБАВЬТЕ ЭТУ СТРОКУ - обновляем флаг локальных изменений
  hasLocalChanges.value = hasFilledFields(newValue)
  
  saveDraftToStorage(newValue)
}, { deep: true, immediate: true })
})

// Загрузка черновика из localStorage
const loadDraftFromStorage = () => {
  try {
    const savedDraft = localStorage.getItem(STORAGE_KEY)
    if (savedDraft) {
      const parsedDraft = JSON.parse(savedDraft)
      localTicket.value = { ...localTicket.value, ...parsedDraft }
      hasLocalChanges.value = hasFilledFields(localTicket.value)
      console.log('Черновик заявки загружен из localStorage')
    }
  } catch (error) {
    console.error('Ошибка при загрузке черновика:', error)
  }
}

// Сохранение черновика в localStorage
const saveDraftToStorage = (ticketData) => {
  try {
    const cleanData = Object.entries(ticketData).reduce((acc, [key, value]) => {
      if (value === null || value === undefined || 
          (typeof value === 'string' && value.trim() === '') ||
          (typeof value === 'object' && Object.keys(value).length === 0)) {
        return acc
      }
      acc[key] = value
      return acc
    }, {})
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanData))
  } catch (error) {
    console.error('Ошибка при сохранении черновика:', error)
  }
}

// Очистка черновика из localStorage
const clearDraftFromStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEY)
    hasLocalChanges.value = false   
  } catch (error) {
    console.error('Ошибка при очистке черновика:', error)
  }
}

// Обработчик выхода со страницы (закрытие вкладки/браузера)
const handleBeforeUnload = (event) => {
  if (hasUnsavedChanges.value) {
    event.preventDefault()
    event.returnValue = 'У вас есть несохраненные изменения.'
    return event.returnValue
  }
  clearDraftAndLeave()
}

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

// Следим за изменениями пропса ticket
watch(() => props.ticket, (newTicket) => {
  localTicket.value = { ...newTicket }
  if (!localTicket.value.materials) {
    localTicket.value.materials = []
  }
}, { immediate: true })

// Роль пользователя
const userRole = ref('guest')
userRole.value = getUserRole()

// Вспомогательная функция для проверки, назначен ли исполнитель
const isExecutorAssigned = (executor) => {
  if (!executor) return false
  
  if (typeof executor === 'object') {
    if (executor.id && executor.name && executor.name.trim() !== '' && executor.name !== 'Не назначен') {
      return true
    }
    if (executor.name && executor.name.trim() !== '' && executor.name !== 'Не назначен') {
      return true
    }
  } else if (typeof executor === 'string') {
    return executor.trim() !== '' && executor !== 'Не назначен'
  }
  
  return false
}

// Обработчик ошибок валидации от дочерних компонентов
const handleValidationError = ({ field, error }) => {
  if (error === null || error === '') {
    validationErrors.value.delete(field)
  } else {
    validationErrors.value.set(field, error)
  }
  
  // Обновляем флаг валидности формы
  isFormValid.value = validationErrors.value.size === 0
}

// Обработчик изменения валидности поля
const handleValidityChange = ({ field, isValid }) => {
  if (isValid) {
    validationErrors.value.delete(field)
  }
  isFormValid.value = validationErrors.value.size === 0
}

// Сохранение заявки
const saveChanges = async () => {
  // Валидируем все блоки
  let isValid = true
  
  if (requiredBlockRef.value) {
    const requiredValid = requiredBlockRef.value.validateAll()
    if (!requiredValid) isValid = false
  }
  
  if (additionalBlockRef.value && additionalBlockRef.value.validateAll) {
    const additionalValid = additionalBlockRef.value.validateAll()
    if (!additionalValid) isValid = false
  }
  
  // Если форма невалидна, просто прерываем сохранение
  // Ошибки уже отображаются в UI компонентах
  if (!isValid || validationErrors.value.size > 0) {
    console.log('Форма содержит ошибки валидации, сохранение отменено')
    return
  }
  
  try {
    const shouldBeAssigned = isExecutorAssigned(localTicket.value.executor)
    const finalStatus = shouldBeAssigned ? 'assigned' : 'new'
    
    if (localTicket.value.status !== finalStatus) {
      localTicket.value.status = finalStatus
    }
    
    const ticketData = prepareTicketForSubmit({
      ...localTicket.value,
      createdAt: new Date().toISOString(),
      materials: localTicket.value.materials || []
    })
    
    const response = await globalApiClient.post('/api/tickets', ticketData)
    
    if (response.data && response.data.success) {
      alert('Заявка успешно создана!')
      
      // Очищаем черновик
      clearDraftFromStorage()
      
      // Устанавливаем флаг, что мы покидаем страницу (чтобы guard не сработал)
      isLeaving = true
      
      // Перенаправляем на список заявок
      router.push('/admin/tickets')
    } else {
      throw new Error('Ошибка при сохранении заявки')
    }
  } catch (error) {
    console.error('Ошибка при сохранении заявки:', error)
    alert(`Ошибка при сохранении заявки: ${error.message || 'Неизвестная ошибка'}`)
  }
}

// Обработчик изменения материалов
const handleMaterialChange = (materials) => {
  localTicket.value = {
    ...localTicket.value,
    materials: materials
  }
}

// Обработчик изменений полей
const handleFieldChange = (field, value) => {
  console.log(`Field ${field} changed to:`, value)
  
  if (field === 'executor') {
    localTicket.value = {
      ...localTicket.value,
      [field]: value
    }
    
    const isAssigned = isExecutorAssigned(value)
    const newStatus = isAssigned ? 'assigned' : 'new'
    
    if (localTicket.value.status !== newStatus) {
      setTimeout(() => {
        localTicket.value.status = newStatus
        console.log(`Статус автоматически изменен на "${newStatus}" из-за изменения исполнителя`)
      }, 0)
    }
  } else if (field === 'workCost') {
    const numericValue = value.toString().replace(/[^0-9.-]+/g, '')
    localTicket.value = {
      ...localTicket.value,
      [field]: numericValue
    }
  } else if (field === 'client') {
    localTicket.value = {
      ...localTicket.value,
      [field]: value
    }
  } else {
    localTicket.value = {
      ...localTicket.value,
      [field]: value
    }
  }
  hasLocalChanges.value = hasFilledFields(localTicket.value)
}

// Метод для подтверждения выхода (вызывается из Guard при подтверждении)
const clearDraftAndLeave = () => {
  clearDraftFromStorage()
  isLeaving = true
  // Guard сам вызовет next() после этого
}

// Метод при отмене выхода (вызывается из Guard при отмене)
const cancelExit = () => {
  console.log('Выход отменен')
  // Можно добавить дополнительную логику при отмене
}
</script>

<style>
.create-ticket-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.create-ticket-container {
  width: 95%;
  max-width: 1200px;
}

.create-ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 5px;
  margin-bottom: 10px;
}

.header-text{
  font-size: 24px;
  font-weight: 600;
  color: rgb(22, 22, 22);
}

.save-btn {
  background: #3cc93a;
  color: white;
  border: none;
  padding: 4px 12px;
  border-radius: 16px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.save-btn:hover {
  background: #28a23e;
  transform: scale(1.05);
}

.create-ticket-body {
  padding: 20px 15px 15px 15px;
}

.ticket-sections-one {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.ticket-sections-two {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

</style>