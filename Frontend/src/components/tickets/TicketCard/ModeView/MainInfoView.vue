<!-- 
    Блок основной информации заявки в режиме просмотра
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
          <UILabel 
            :modelValue="getPriorityLabel(ticket.priority)"
            label="Приоритет"
            emptyText="Не указан"
            :backgroundColor="priorityColors.background"
            :textColor="priorityColors.color"
          />
        </div>
        
        <div class="info-block-create horizontal-item">
          <UILabel 
            :modelValue="getStatusLabel(ticket.status)"
            label="Статус"
            emptyText="Не указан"
            :backgroundColor="statusColors.background"
            :textColor="statusColors.color"
          />
        </div>
      </div>
      
      <!-- Строка 2: Тип, Время создания, Срок выполнения -->
      <div class="horizontal-row row-2">
        <div class="info-block-create horizontal-item">
          <UILabel 
            :modelValue="getTypeLabel(ticket.type)"
            label="Тип"
            emptyText="Не указан"
            customClass="ticket-type"
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
          <UILabel 
            :modelValue="formatDate(ticket.deadline)"
            label="Срок выполнения"
            emptyText="Не указан"
            :customClass="isOverdue ? 'deadline deadline-overdue' : 'deadline'"
          />
        </div>
      </div>
      
      <!-- Блок темы -->
      <div class="info-block-create full-width">
        <UITextarea 
          :modelValue="ticket.subject" 
          @update:modelValue="value => $emit('fieldChange', 'subject', value)"
          placeholder="Тема не указана"
          label="Тема"
          :maxLength="100"
          :showCharCount="true"
          :rows="2"
          :minHeight="'45px'"
          :maxHeight="'90px'"
          :readonly="true"
        />
      </div>
      
      <!-- Блок описания -->
      <div class="info-block-create full-width">
        <UITextarea 
          :modelValue="ticket.description" 
          @update:modelValue="value => $emit('fieldChange', 'description', value)"
          placeholder="Описание отсутствует"
          label="Описание"
          :maxLength="1000"
          :showCharCount="true"
          :rows="7"
          :minHeight="'45px'"
          :maxHeight="'180px'"
          :readonly="true"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue'
import UITextarea from '@/components/common/UI/UITextarea.vue'
import UILabel from '@/components/common/UI/UILabel.vue'
import { formatDate, isDeadlineOverdue } from '@/utils/date.utils'
import { getPriorityLabel, getStatusLabel, getStatusColors, getPriorityColors } from '@/utils/ticket.utils'

// ...

const priorityColors = computed(() => {
  return getPriorityColors(props.ticket.priority)
})

// Получаем цвета статуса из утилиты
const statusColors = computed(() => {
  return getStatusColors(props.ticket.status)
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

defineEmits(['editSection', 'fieldChange'])

const isOverdue = computed(() => {
  return isDeadlineOverdue(props.ticket.deadline)
})

const getTypeLabel = (type) => {
  const labels = {
    onsite: 'Выездная заявка',
    remote: 'Удаленная заявка',
    phone: 'Телефонная заявка',
    web: 'WEB-заявка',
  }
  return labels[type] || type || 'Не указан'
}



</script>

<style scoped>
@import '@/assets/styles/ticket-card.css';
@import '@/assets/styles/card-blocks-styles/card-main-info.css';
</style>