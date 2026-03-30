<!-- 
    Блок информации о клиенте
    Компания-клиент, контактное лицо, телефон, email, договор SLA
    Редактируется только администратором или клиентом
-->

<template>
  <ClientInfoView 
    v-if="mode === 'view'" 
    :ticket="ticket" 
    :mode="mode"
    :user-role="userRole"
    ></ClientInfoView>
  <ClientInfoEdit 
    v-else-if="mode === 'edit'"
    :ticket="ticket" 
    :mode="mode"
    :user-role="userRole"
  ></ClientInfoEdit>
</template>

<script setup>
import ClientInfoView from './ModeView/ClientInfoView.vue';
import ClientInfoEdit from './ModeEdit/ClientInfoEdit.vue';

defineProps({
  ticket: Object,
  mode: String,
  userRole: String
})

defineEmits(['fieldChange'])

</script>