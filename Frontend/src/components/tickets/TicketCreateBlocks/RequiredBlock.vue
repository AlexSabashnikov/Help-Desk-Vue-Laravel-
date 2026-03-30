<!-- 
    Блок обязательной информации заявки в режиме создания
    Обязательные поля администратора: (Тема, Описание, Тип, Приоритет, Организация-клиент, офис)
    Обязательные поля клиента: (Тема, Описание, Тип, Приоритет)
    Поля дедлайн, местоположение, статус подставляются автоматически
-->

<template>
  <div class="ticket-section">
    <div class="ticket-section-header">
      <h3>Обязательный блок</h3>
    </div>

    <div class="ticket-create-block-content">
      <!-- Столбец 1: Тема и Описание -->
      <div class="column column-1">
        <div class="horizontal-row">
          <div class="info-block-create horizontal-item">
            <UISelect 
              ref="typeInput"
              :required="true"
              :modelValue="ticket.type" 
              @update:modelValue="value => onFieldChange('type', value)"
              @valid="(isValid) => onFieldValid('type', isValid)"
              @error="(error) => onFieldError('type', error)"
              :options="typeOptions"
              placeholder="Выберите тип..."
              label="Тип"
              :rules="[validators.type]"
            />
          </div>
          <div class="info-block-create horizontal-item">
            <UISelect 
              ref="priorityInput"
              :required="true"
              :modelValue="ticket.priority" 
              @update:modelValue="value => onFieldChange('priority', value)"
              @valid="(isValid) => onFieldValid('priority', isValid)"
              @error="(error) => onFieldError('priority', error)"
              :options="priorityOptions"
              placeholder="Выберите приоритет..."
              label="Приоритет"
              :backgroundColor="priorityColors.background"
              :textColor="priorityColors.color"
              :borderColor="priorityColors.border"
            />
          </div>
          <div class="info-block-create horizontal-item">
            <UIComboBox 
              ref="clientInput"
              :required="true"
              max-length="30"
              :modelValue="ticket.client"
              @update:modelValue="value => onFieldChange('client', value)"
              @valid="(isValid) => onFieldValid('client', isValid)"
              @error="(error) => onFieldError('client', error)"
              :options="clientOptions"
              optionLabel="name"
              optionValue="id"
              placeholder="Выберите организацию..."
              label="Организация"
              :rules="[validators.client]"
            />
          </div>
        </div>
        
        <div class="info-block-create">
          <UITextarea 
            ref="subjectInput"
            :required="true"
            :modelValue="ticket.subject" 
            @update:modelValue="value => onFieldChange('subject', value)"
            @valid="(isValid) => onFieldValid('subject', isValid)"
            @error="(error) => onFieldError('subject', error)"
            placeholder="Введите тему заявки..."
            label="Тема"
            :maxLength="100"
            :showCharCount="true"
            :rows="1"
            :minHeight="'30px'"
            :maxHeight="'60px'"
            :rules="[validators.subject]"
          />
        </div>

        <div class="info-block-create">
          <UITextarea 
            ref="descriptionInput"
            :required="true"
            :modelValue="ticket.description" 
            @update:modelValue="value => onFieldChange('description', value)"
            @valid="(isValid) => onFieldValid('description', isValid)"
            @error="(error) => onFieldError('description', error)"
            placeholder="Введите описание задачи..."
            label="Описание"
            :maxLength="1000"
            :showCharCount="true"
            :rows="7"
            :minHeight="'45px'"
            :maxHeight="'180px'"
            :rules="[validators.description]"
          />
        </div>
      </div>
        
      <!-- Столбец 2: Статус, Срок выполнения, Контактное лицо, телефон, email, Договор -->
      <div class="column column-2">
        <div class="info-block-create">
          <UILabel 
            :modelValue="getStatusLabel(ticket.status)"
            label="Статус"
            emptyText="Не указан"
            :backgroundColor="statusColors.background"
            :textColor="statusColors.color"
          />
        </div>
        
        <div class="info-block-create">
          <UIInput 
            ref="deadlineInput"
            :required="true"
            :modelValue="formatDateTimeLocal(ticket.deadline)"
            @update:modelValue="value => onFieldChange('deadline', value)"
            @valid="(isValid) => onFieldValid('deadline', isValid)"
            @error="(error) => onFieldError('deadline', error)"
            label="Срок выполнения"
            type="datetime-local"
            :textColor="invalidColors(ticket.deadline).color"
            :rules="[validators.deadline]"
          />
        </div>
        
        <div class="info-block-create">
          <UILabel 
            :modelValue="ticket.contactPerson"
            label="Контактное лицо"
            emptyText="Автоматическое поле"
          />
        </div>
        
        <div class="info-block-create">
          <UILabel 
            :modelValue="ticket.phone"
            label="Телефон"
            emptyText="Автоматическое поле"
          />
        </div>
        
        <div class="info-block-create">
          <UILabel 
            :modelValue="ticket.email"
            label="Email"
            emptyText="Автоматическое поле"
          />
        </div>
        
        <div class="info-block-create">
          <UILabel 
            :modelValue="ticket.contract"
            label="Договор SLA"
            emptyText="Автоматическое поле"
            :isLink="true"
          >
            <template #append>
              <a v-if="ticket.contract" href="#" class="contract-link" @click.prevent="openContract">Договор.pdf</a>
            </template>
          </UILabel>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed, ref, reactive, watch } from 'vue'
import UISelect from '@/components/common/UI/UISelect.vue'
import UIComboBox from '@/components/common/UI/UIComboBox.vue'
import UITextarea from '@/components/common/UI/UITextarea.vue'
import UIInput from '@/components/common/UI/UIInput.vue'
import UILabel from '@/components/common/UI/UILabel.vue'

// Импорт утилит
import { 
  getStatusLabel,
  getStatusColors,
  getPriorityColors
} from '@/utils/ticket.utils'
import { formatDateTimeLocal, isInvalidDate } from '@/utils/date.utils'
import { 
  getTicketTypeOptions, 
  getTicketPriorityOptions, 
  getOrgOptions
} from '@/utils/select.options.utils'

// Refs для полей ввода
const typeInput = ref(null)
const priorityInput = ref(null)
const clientInput = ref(null)
const subjectInput = ref(null)
const descriptionInput = ref(null)
const deadlineInput = ref(null)

// Состояние валидации полей
const fieldValidity = reactive({
  type: true,
  priority: true,
  client: true,
  subject: true,
  description: true,
  deadline: true
})

const props = defineProps({
  ticket: {
    type: Object,
    required: true,
  },
  mode: {
    type: String,
    default: 'view',
  },
  userRole: {
    type: String,
    default: 'guest',
  },
})

const emit = defineEmits(['fieldChange', 'validationError', 'validityChange'])

// Валидаторы для полей
const validators = {
  type: (value) => {
    if (!value || value.trim() === '') {
      return 'Выберите тип заявки'
    }
    return true
  },
  priority: (value) => {
    if (!value || value.trim() === '') {
      return 'Выберите приоритет'
    }
    return true
  },
  client: (value) => {
    if (!value) return 'Обязательное поле'
    if (typeof value === 'object') {
      if (!value.id && (!value.name || value.name.trim() === '')) {
        return 'Обязательное поле'
      }
    } else if (typeof value === 'string' && value.trim() === '') {
      return 'Обязательное поле'
    }
    return true
  },
  subject: (value) => {
    if (!value || value.trim() === '') {
      return 'Введите тему заявки'
    }
    if (!(/\s/g.test(value))) {
      return 'Слишком короткая тема'
    }
    if (value.length > 100) {
      return 'Тема не может превышать 100 символов'
    }
    return true
  },
  description: (value) => {
    if (!value || value.trim() === '') {
      return 'Введите описание заявки'
    }
    if (!(/\s/g.test(value))) {
      return 'Слишком короткое описание'
    }
    if (value.length > 1000) {
      return 'Описание не может превышать 1000 символов'
    }
    return true
  },
  deadline: (value) => {
    if (!value) {
      return 'Укажите срок выполнения'
    }
    // Проверяем, что дата не в прошлом
    const date = new Date(value)
    const now = new Date()
    if (date < now) {
      return 'Неверный срок выполнения'
    }
    return true
  }
}

// Получаем цвета статуса из утилиты
const statusColors = computed(() => {
  return getStatusColors(props.ticket.status)
})

const priorityColors = computed(() => {
  return getPriorityColors(props.ticket.priority)
})

// Обработчик изменения поля
const onFieldChange = (field, value) => {
  emit('fieldChange', field, value)
}

// Обработчик валидности поля
const onFieldValid = (field, isValid) => {
  fieldValidity[field] = isValid
  emit('validityChange', { field, isValid })
  
  // Если поле стало валидным, убираем ошибку
  if (isValid) {
    emit('validationError', { field, error: null })
  }
}

// Обработчик ошибки поля
const onFieldError = (field, error) => {
  if (error) {
    emit('validationError', { field, error })
  }
}

// Метод для проверки валидности всех полей
const validateAll = () => {
  let isValid = true
  
  // Собираем все refs полей
  const fields = {
    type: typeInput,
    priority: priorityInput,
    client: clientInput,
    subject: subjectInput,
    description: descriptionInput,
    deadline: deadlineInput
  }
  
  // Валидируем каждое поле
  Object.entries(fields).forEach(([field, ref]) => {
    if (ref.value && typeof ref.value.validate === 'function') {
      const fieldIsValid = ref.value.validate()
      if (!fieldIsValid) {
        isValid = false
      }
    } else {
      // Если у поля нет метода validate, используем валидатор напрямую
      const validator = validators[field]
      if (validator) {
        const result = validator(props.ticket[field])
        const fieldIsValid = result === true
        fieldValidity[field] = fieldIsValid
        if (!fieldIsValid) {
          isValid = false
          emit('validationError', { field, error: result })
        }
      }
    }
  })
  
  return isValid
}

// Следим за изменениями ticket и обновляем валидацию при необходимости
watch(() => props.ticket, () => {
  if (props.mode === 'create' || props.mode === 'edit') {
    // Проверяем каждое поле
    Object.keys(validators).forEach(field => {
      const value = props.ticket[field]
      const result = validators[field](value)
      const isValid = result === true
      
      fieldValidity[field] = isValid
      if (!isValid) {
        emit('validationError', { field, error: result })
      } else {
        emit('validationError', { field, error: null })
      }
    })
  }
}, { deep: true, immediate: true })

// Экспонируем методы для родительского компонента
defineExpose({
  validateAll,
  fieldValidity
})

// Используем функции для получения опций
const typeOptions = getTicketTypeOptions()
const priorityOptions = getTicketPriorityOptions()
const clientOptions = getOrgOptions(clientInput)

const isOverdue = (date) => {
  return isInvalidDate(date)
}

const invalidColors = (date) => {
  if(isOverdue(date)){
    return { color: 'red' }
  }
  else{
    return { color: '#141414' }
  }
}
</script>

<style scoped>
/* Общие стили для всех блоков заявки */
.ticket-section {
  background: #fcfcfc;
  border: 1px solid #031432;
  border-radius: 12px;
  overflow: hidden;
  box-sizing: border-box;
}

/* Заголовок секции */
.ticket-section-header {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 15px;
  color: white;
  border-radius: 10px 10px 0 0;
  background: #031432;
  box-sizing: border-box;
}

.ticket-section-header h3 {
  margin: 0;
  color: #ffffff;
  font-size: 16px;
}

/* Контейнер для содержимого - сетка из 2 столбцов */
.ticket-create-block-content {
  display: grid;
  grid-template-columns: 5fr 2fr;
  padding: 15px;
  gap: 40px;
  align-items: start;
  min-height: 200px;
}

/* Общие стили для всех столбцов */
.column {
  display: flex;
  flex-direction: column;
  gap: 15px;
  height: 100%;
}

/* Столбец 1: Тема и Описание (шире) */
.column-1 {
  grid-column: 1;
}

/* Столбец 2: Приоритет, Тип, Организация */
.column-2 {
  grid-column: 2;
}

/* Горизонтальная строка для типа, приоритета и организации */
.horizontal-row {
  display: flex;
  gap: 15px;
  width: 100%;
}

.horizontal-row .horizontal-item {
  flex: 1;
  min-width: 0;
}

/* Общие стили для внутренних блоков */
.info-block-create {
  display: flex;
  flex-direction: column;
  width: 100%;
  flex: 0;
  min-height: 50px;
}

/* Ссылка на договор */
.contract-link {
  color: #007bff;
  text-decoration: none;
  cursor: pointer;
  font-size: 12px;
  margin-left: 8px;
}

.contract-link:hover {
  text-decoration: underline;
}

/* Стили для статусного бейджа */
.statusLabel{
  max-width: 140px !important;
}
</style>