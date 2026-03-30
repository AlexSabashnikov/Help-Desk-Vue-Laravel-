<!-- 
    Блок основной информации заявки в режиме редактирования
-->

<template>
  <div class="ticket-section">
    <div class="ticket-section-header">
      <h3>Общая информация</h3>
    </div>

    <div class="ticket-create-block-content">
      <!-- Строка 1: Номер, Приоритет, Статус -->
      <div class="horizontal-row row-1">
        <div class="info-block-create horizontal-item">
          <UILabel 
            :modelValue="ticket.number"
            label="Номер заявки"
            emptyText="Не указан"
            customClass="ticket-number"
          />
        </div>
        
        <div class="info-block-create horizontal-item">
          <UISelect 
              :modelValue="ticket.priority" 
              @update:modelValue="value => onFieldChange('priority', value)"
              :options="priorityOptions"
              placeholder="Выберите приоритет..."
              label="Приоритет"
              :backgroundColor="priorityColors.background"
              :textColor="priorityColors.color"
              :borderColor="priorityColors.border"
            />
        </div>
        
        <div class="info-block-create horizontal-item">
          <UISelect 
              :modelValue="ticket.status" 
              @update:modelValue="value => onFieldChange('status', value)"
              :options="statusOptions"
              placeholder="Выберите статус..."
              label="Статус"
              :backgroundColor="statusColors.background"
              :textColor="statusColors.color"
              :borderColor="statusColors.border"
            />
        </div>
      </div>
      
      <!-- Строка 2: Тип, Время создания, Срок выполнения -->
      <div class="horizontal-row row-2">
        <div class="info-block-create horizontal-item">
          <UISelect 
              :modelValue="ticket.type" 
              @update:modelValue="value => onFieldChange('type', value)"
              :options="typeOptions"
              placeholder="Выберите тип..."
              label="Тип"
            />
        </div>
        
        <div class="info-block-create horizontal-item">
          <UILabel 
            :modelValue="ticket.createdAt"
            label="Время создания"
            emptyText="Не указано"
            customClass="time-create"
          />
        </div>
        
        <div class="info-block-create horizontal-item">
          <UIInput 
            :modelValue="formatDateTimeLocal(ticket.deadline)"
            @update:modelValue="value => onFieldChange('deadline', value)"
            label="Срок выполнения"
            emptyText="Не указан"
            type="datetime-local"
            :textColor="dedlineColors.color"
          />
        </div>
      </div>
      
      <!-- Блок темы -->
      <div class="info-block-create full-width">
        <UITextarea 
          :modelValue="ticket.subject" 
          @update:modelValue="value => onFieldChange('subject', value)"
          placeholder="Тема не указана"
          label="Тема"
          :maxLength="100"
          :showCharCount="true"
          :rows="2"
          :minHeight="'45px'"
          :maxHeight="'90px'"
          :readonly="false"
        />
      </div>
      
      <!-- Блок описания -->
      <div class="info-block-create full-width">
        <UITextarea 
          :modelValue="ticket.description" 
          @update:modelValue="value => onFieldChange('description', value)"
          placeholder="Описание отсутствует"
          label="Описание"
          :maxLength="1000"
          :showCharCount="true"
          :rows="7"
          :minHeight="'45px'"
          :maxHeight="'180px'"
          :readonly="false"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue'
import UISelect from '@/components/common/UI/UISelect.vue'
import UITextarea from '@/components/common/UI/UITextarea.vue'
import UILabel from '@/components/common/UI/UILabel.vue'
import UIInput from '@/components/common/UI/UIInput.vue'
import { formatDateTimeLocal, isDeadlineOverdue } from '@/utils/date.utils'
import { getStatusColors, getPriorityColors } from '@/utils/ticket.utils'
import { getTicketStatusOptions, getTicketTypeOptions, getTicketPriorityOptions } from '@/utils/select.options.utils'
import { handleFieldChange as handleFieldChangeUtil, createTicketValidators } from '@/utils/form.utils'

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

const emit = defineEmits(['editSection', 'fieldChange'])

const isOverdue = computed(() => {
  return isDeadlineOverdue(props.ticket.deadline)
})

const priorityColors = computed(() => {
  return getPriorityColors(props.ticket.priority)
})

const statusColors = computed(() => {
  return getStatusColors(props.ticket.status)
})

const dedlineColors = computed(() => {
  if(isOverdue.value){
    return { color: 'red' }
  }
  else{
    return { color: 'black' }
  }
})

const typeOptions = getTicketTypeOptions()
const priorityOptions = getTicketPriorityOptions()
const statusOptions = getTicketStatusOptions()

const validators = createTicketValidators(props.ticket)

const onFieldChange = (field, value) => {
  handleFieldChangeUtil(emit, field, value, validators)
}

</script>

<style scoped>
@import '@/assets/styles/ticket-card.css';
@import '@/assets/styles/card-blocks-styles/card-main-info.css';
</style>