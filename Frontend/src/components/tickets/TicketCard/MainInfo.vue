<!-- 
    Блок основной информации заявки
    Номер, тема, описание, тип, приоритет, срок выполнения
    Редактируемые поля (зависит от роли пользователя)
    Валидация обязательных полей, автосохранение
-->

<template>
  <MainInfoView 
    v-if="mode === 'view'" 
    :ticket="ticket" 
    :mode="mode"
    :user-role="userRole"
    ></MainInfoView>
  <MainInfoEdit 
    v-else-if="mode === 'edit'"
    :ticket="ticket" 
    :mode="mode"
    :user-role="userRole"
    @fieldChange="handleFieldChange" 
  ></MainInfoEdit>
</template>

<script setup>
import MainInfoView from './ModeView/MainInfoView.vue';
import MainInfoEdit from './ModeEdit/MainInfoEdit.vue';

defineProps({
  ticket: Object,
  mode: String,
  userRole: String
})

const emit = defineEmits(['fieldChange'])

const handleFieldChange = (field, value) => {
  console.log(`MainInfo: Field ${field} changed to:`, value)
  emit('fieldChange', field, value)
}

</script>


