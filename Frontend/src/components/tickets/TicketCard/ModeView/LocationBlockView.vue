<!-- 
    Блок местоположения
    Адрес объекта, карта, расстояние, время в пути
    Автоматический расчёт по выбранному адресу
    Только для просмотра
-->

<template>
  <div class="ticket-section">
    <div class="ticket-section-header">
      <h3>Местоположение</h3>
    </div>

    <div class="location-info">
        <UILabel 
            :modelValue="ticket.adress"
            label="Адрес"
            emptyText="Не указан"
            :showHeader="true"
        />
      <div class="info-block">
        <UILabel 
            :modelValue="ticket.distance"
            label="Расстояние до объекта"
            emptyText="Не указано"
            :showHeader="true"
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

// Только объявление, без присваивания переменной
defineProps({
  ticket: {
    type: Object,
    required: true,
  },
  editable: {
    type: Boolean,
    default: false,
  },
  showMap: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['editSection', 'fieldChange'])

</script>

<style scoped>
@import '@/assets/styles/ticket-card.css';
@import '@/assets/styles/card-blocks-styles/card-location-block.css';
</style>