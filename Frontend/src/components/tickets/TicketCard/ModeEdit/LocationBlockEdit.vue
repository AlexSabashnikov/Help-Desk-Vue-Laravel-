<template>
  <div class="ticket-section">
    <div class="ticket-section-header">
      <h3>Местоположение</h3>
    </div>

    <div class="location-info">
        <UIInput 
            :modelValue="ticket.adress"
            @update:modelValue="value => onFieldChange('address', value)"
            label="Адрес"
            type="text"
            placeholder="Введите адрес..."
        />
      <div class="info-block">
        <UIInput 
            :modelValue="ticket.distance"
            @update:modelValue="value => onFieldChange('distance', value)"
            label="Расстояние до объекта"
            type="number"
            :min="0"
            :step="0.1"
            placeholder="Введите расстояние..."
        />
        <UILabel 
            :modelValue="ticket.estimatedTravelTime"
            label="Примерное время в пути"
            emptyText="Не рассчитано"
            :showHeader="true"
        />
    </div>
    </div>

    <div class="map-placeholder" v-if="!showMap">
      <span>Здесь будет карта</span>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import UILabel from '@/components/common/UI/UILabel.vue'
import UIInput from '@/components/common/UI/UIInput.vue'
import { 
  handleFieldChange as handleFieldChangeUtil,
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
  showMap: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['editSection', 'fieldChange'])

const validators = createTicketValidators(props.ticket)

const onFieldChange = (field, value) => {
  handleFieldChangeUtil(emit, field, value, validators)
}
</script>

<style scoped>
@import '@/assets/styles/ticket-card.css';
@import '@/assets/styles/card-blocks-styles/card-location-block.css';
</style>