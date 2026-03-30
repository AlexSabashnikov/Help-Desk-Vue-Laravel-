<template>
  <div class="ticket-section">
    <div class="ticket-section-header">
      <h3>Исполнение</h3>
    </div>

    <div class="ticket-create-block-content">
      <div class="column-grid">
      <div class="column column-1">
        <div class="info-block-create">
          <UIComboBox 
            :modelValue=getTicketExecutorName(ticket.executor)
            :return-object="false"
            @update:modelValue="value => onFieldChange('executor', value)"
            :options="executorOptions"
            optionLabel="name"
            optionValue="id"
            placeholder="Выберите исполнителя..."
            label="Исполнитель"
          />
        </div>
        <div class="info-block-create">
          <UIInput 
            :modelValue="ticket.workCost"
            @update:modelValue="value => onFieldChange('workCost', value)"
            label="Стоимость работ"
            type="number"
            placeholder="Введите стоимость..."
          />
        </div>
        
      </div>
      
      <div class="column column-2">
        
        <div class="info-block-create">
          <UIInput 
            :modelValue="formatDateTimeLocal(ticket.workStart)"
            @update:modelValue="value => onFieldChange('workStart', value)"
            label="Начало работы"
            type="datetime-local"
            :textColor="invalidColors(ticket.workStart).color"
          />
        </div>
        <div class="info-block-create">
          <UIInput 
            :modelValue="formatDateTimeLocal(ticket.workEnd)"
            @update:modelValue="value => onFieldChange('workEnd', value)"
            label="Окончание работы"
            type="datetime-local"
            :textColor="invalidColors(ticket.workEnd).color"
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
          @materialChange="handleMaterialChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import UIComboBox from '@/components/common/UI/UIComboBox.vue'
import UIInput from '@/components/common/UI/UIInput.vue'
import MaterialsTable from '@/components/tables/MaterialsTable.vue'
import { formatDateTimeLocal, isInvalidDate } from '@/utils/date.utils'
import { getExecutorOptions } from '@/utils/select.options.utils'
import { getTicketExecutorName } from '@/utils/ticket.utils'
import { 
  handleFieldChange as handleFieldChangeUtil,
  handleMaterialChange as handleMaterialChangeUtil,
  createTicketValidators 
} from '@/utils/form.utils'

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

const emit = defineEmits(['editSection', 'fieldChange', 'materialChange'])

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

const executorOptions = getExecutorOptions()

const validators = createTicketValidators(props.ticket)

const onFieldChange = (field, value) => {
  handleFieldChangeUtil(emit, field, value, validators)
}

const handleMaterialChange = (updatedMaterials) => {
  handleMaterialChangeUtil(emit, updatedMaterials)
}
</script>

<style scoped>
@import '@/assets/styles/ticket-card.css';
@import '@/assets/styles/card-blocks-styles/card-execution-block.css';
</style>
