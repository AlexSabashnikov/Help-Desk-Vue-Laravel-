<template>
  <UIIcons ref="uiIcons" />
  <div class="ticket-section">
    <div class="ticket-section-header">
      <h3>Информация о клиенте</h3>
    </div>

    <div class="ticket-create-block-content">
      <!-- Столбец 1: Организация, Контактное лицо, Способ подачи заявки -->
      <div class="column column-1">
        <div class="info-block-create">
          <UILabel 
            :modelValue="ticket.client?.name"
            label="Организация"
            emptyText="Не указана"
            :showHeader="true"
          >
            <template #append>
              <button 
                class="ticket-profile-button" 
                @click="$emit('goToProfile', 'company', ticket.client?.id)"
                title="Перейти в профиль организации"
              >
                <Icon :icon="uiIcons?.icons.organizationProfile" width="20" height="20" />
              </button>
            </template>
          </UILabel>
        </div>
        
        <div class="info-block-create">
          <UILabel 
            :modelValue="ticket.contactPerson"
            label="Контактное лицо"
            emptyText="Не указано"
            :showHeader="true"
          >
            <template #append>
              <button 
                class="ticket-profile-button" 
                @click="$emit('goToProfile', 'user', ticket.contactPerson)"
                title="Перейти в профиль контакта"
                v-if="ticket.contactPerson"
              >
                <Icon :icon="uiIcons?.icons.clientProfile" width="20" height="20" />
              </button>
            </template>
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
import { defineProps, defineEmits, ref } from 'vue'
import UILabel from '@/components/common/UI/UILabel.vue'
import { Icon } from '@iconify/vue'
import UIIcons from '@/components/common/UI/UIIcons.vue'


const uiIcons = ref()

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

defineEmits(['editSection', 'fieldChange','goToProfile'])

const openContract = () => {
  // Логика открытия договора
  console.log('Открыть договор:', props.ticket.contract)
}
</script>

<style scoped>
@import '@/assets/styles/ticket-card.css';
@import '@/assets/styles/card-blocks-styles/card-client-info.css';
</style>