<template>
  <UIIcons ref="uiIcons" />
  <div class="ticket-section">
    <div class="ticket-section-header">
      <h3>Исполнение</h3>
    </div>

    <div class="ticket-create-block-content">
      <div class="column-grid">
      <div class="column column-1">
        <div class="info-block-create">
          <UILabel 
            :modelValue=getTicketExecutorName(ticket.executor)
            label="Исполнитель"
            emptyText="Не указан"
            :showHeader="true"
          >
            <template #append>
              <button 
                class="ticket-profile-button" 
                @click="$emit('openProfile', ticket.executor)"
                title="Перейти в профиль исполнителя"
                v-if="ticket.executor"
              >
                <Icon :icon="uiIcons?.icons.engineerProfile" width="20" height="20" />
              </button>
            </template>
          </UILabel>
        </div>
        <div class="info-block-create">
          <UILabel 
            :modelValue="ticket.workCost ? `${ticket.workCost} р.` : ''"
            label="Стоимость работ"
            emptyText="Не указана"
            :showHeader="true"
          />
        </div>
        
      </div>
      
      <div class="column column-2">
        
        <div class="info-block-create">
          <UILabel 
            :modelValue="formatDate(ticket.workStart)"
            label="Начало работы"
            emptyText="Не начато"
            :showHeader="true"
          />
        </div>
        <div class="info-block-create">
          <UILabel 
            :modelValue="formatDate(ticket.workEnd)"
            label="Окончание работы"
            emptyText="Не завершено"
            :showHeader="true"
          />
        </div>
      </div>
    </div>
      
      <!-- Материалы -->
      <div class="info-block-create full-width">
        <MaterialsTable 
          :ticket="ticket"
          :mode="mode"
          :userRole="userRole"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref } from 'vue'
import { getTicketExecutorName } from '@/utils/ticket.utils'
import { formatDate } from '@/utils/date.utils'
import UILabel from '@/components/common/UI/UILabel.vue'
import MaterialsTable from '@/components/tables/MaterialsTable.vue'
import { Icon } from '@iconify/vue'
import UIIcons from '@/components/common/UI/UIIcons.vue'


const uiIcons = ref()

defineProps({
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

defineEmits(['openProfile'])
</script>

<style scoped>
@import '@/assets/styles/ticket-card.css';
@import '@/assets/styles/card-blocks-styles/card-execution-block.css';
</style>