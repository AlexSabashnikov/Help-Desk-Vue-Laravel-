<template>
  <div class="ticket-section">
    <div class="ticket-section-header">
      <h3>Информация о клиенте</h3>
    </div>

    <div class="ticket-create-block-content">
      <!-- Столбец 1: Организация, Контактное лицо, Способ подачи заявки -->
      <div class="column column-1">
        <div class="info-block-create">
          <UIComboBox 
              :modelValue="ticket.client.name"
              @update:modelValue="value => onFieldChange('client', value)"
              optionLabel="name"
              optionValue="id"
              placeholder="Выберите организацию..."
              label="Организация"
            />
        </div>
        
        <div class="info-block-create">
          <UILabel 
            :modelValue="ticket.contactPerson"
            label="Контактное лицо"
            emptyText="Не указано"
            :showHeader="true"
          >
          </UILabel>
        </div>
        <div class="info-block-create">
          <UILabel 
            :modelValue="ticket.email"
            label="Email"
            emptyText="Не указан"
            :showHeader="true"
          />
        </div>
      </div>
      
      <!-- Столбец 2: Договор, Телефон, Email -->
      <div class="column column-2">
        <div class="info-block-create">
          <UILabel 
            :modelValue="ticket.contract"
            label="Договор SLA"
            emptyText="Не указан"
            :showHeader="true"
            :isLink="true"
          >
            <template #append>
              <a v-if="ticket.contract" href="#" class="contract-link" @click.prevent="openContract">
                Договор.pdf
              </a>
            </template>
          </UILabel>
        </div>
        
        <div class="info-block-create">
          <UILabel 
            :modelValue="ticket.phone"
            label="Телефон"
            emptyText="Не указан"
            :showHeader="true"
          />
        </div>
        
        <div class="info-block-create">
          <UILabel 
            :modelValue="ticket.requestMethod"
            label="Способ подачи заявки"
            emptyText="WEB-портал"
            :showHeader="true"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import UIComboBox from '@/components/common/UI/UIComboBox.vue';
import UILabel from '@/components/common/UI/UILabel.vue';
import { defineProps, defineEmits } from 'vue'
import { 
  handleFieldChange as handleFieldChangeUtil,
  createTicketValidators 
} from '@/utils/form.utils'
//import { getOrgOptions } from '@/utils/select.options.utils'

const props = defineProps({
  ticket: {
    type: Object,
    required: true,
  },
  editable: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['editSection', 'fieldChange','goToProfile'])

const validators = createTicketValidators(props.ticket)

const onFieldChange = (field, value) => {
  handleFieldChangeUtil(emit, field, value, validators)
}

const openContract = () => {
  // Логика открытия договора
  console.log('Открытие договора')
}

</script>

<style scoped>
@import '@/assets/styles/ticket-card.css';
@import '@/assets/styles/card-blocks-styles/card-client-info.css';
</style>