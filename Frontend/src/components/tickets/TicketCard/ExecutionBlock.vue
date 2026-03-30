<!-- 
    Блок исполнения заявки
    Исполнитель, плановое время работ, стоимость
    Материалы и ТМЦ (таблица с добавлением/удалением)
    Доступен для редактирования инженером и администратором
-->

<template>
  <ExecutionBlockView 
    v-if="mode === 'view'" 
    :ticket="ticket"
    :mode="mode"
    :user-role="userRole"
    @openProfile="openUserProfile"
    ></ExecutionBlockView>
  <ExecutionBlockEdit 
    v-else-if="mode === 'edit'"
    :ticket="ticket"
    :mode="mode"
    :user-role="userRole"
    @fieldChange="handleFieldChange"
    @materialChange="handleMaterialChange"
  ></ExecutionBlockEdit>
</template>

<script setup>
import ExecutionBlockView from './ModeView/ExecutionBlockView.vue';
import ExecutionBlockEdit from './ModeEdit/ExecutionBlockEdit.vue';

defineProps({
  ticket: Object,
  mode: String,
  userRole: String
})

const emit = defineEmits(['fieldChange', 'materialChange', 'openProfile'])

const handleFieldChange = (field, value) => {
  console.log(`ExecutionBlock: Field ${field} changed to:`, value)
  emit('fieldChange', field, value)
}

const handleMaterialChange = (materials) => {
  console.log('ExecutionBlock: Materials changed to:', materials)
  emit('materialChange', materials)
}

const openUserProfile = (user) => {
  console.log('ExecutionBlock: Open profile for user:', user)
  emit('openProfile', user)
}

</script>


