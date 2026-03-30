<template>
  <LocationBlockView 
    v-if="mode === 'view'" 
    :ticket="ticket"
    :mode="mode"
    :user-role="userRole"
    ></LocationBlockView>
  <LocationBlockEdit 
    v-else-if="mode === 'edit'"
    :ticket="ticket"
    :mode="mode"
    :user-role="userRole"
    @fieldChange="handleFieldChange"
  ></LocationBlockEdit>
</template>

<script setup>
import LocationBlockView from './ModeView/LocationBlockView.vue';
import LocationBlockEdit from './ModeEdit/LocationBlockEdit.vue';

defineProps({
  ticket: Object,
  mode: String,
  userRole: String
})

const emit = defineEmits(['fieldChange', 'materialChange'])

const handleFieldChange = (field, value) => {
  console.log(`LocationBlock: Field ${field} changed to:`, value)
  emit('fieldChange', field, value)
}
</script>