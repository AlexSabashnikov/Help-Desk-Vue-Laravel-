<!-- 
    Базовая кнопка с несколькими вариантами
    Поддерживает различные варианты, размеры, состояния
    Единый стиль для всего приложения
-->

<template>
  <button 
    :class="['ui-button', `variant-${variant}`]" 
    @click="handleClick"
    :disabled="isClicked"
  >
    <slot />
  </button>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  variant: { type: String, default: 'primary' },
})

const emit = defineEmits(['click'])
const isClicked = ref(false)

const handleClick = (event) => {
  if (isClicked.value) return
  
  isClicked.value = true
  emit('click', event)
  
  // Сброс флага через небольшую задержку
  setTimeout(() => {
    isClicked.value = false
  }, 300)
}
</script>

<style scoped>
.ui-button {
  padding: 4px 12px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
}

.ui-button:hover {
  transform: scale(1.01);
}

.variant-primary {
  background: #3b82f6;
  color: white;
}

.variant-crit {
  background: #ffdbdb;
  color: #b70c0c;
  border: 2px solid #b70c0c;
}

.variant-crit:hover {
  background: #fff2f2;
  color: #ea1717;
  border: 2px solid #ea1717;
}

.variant-new {
  background: #d8dbff;
  color: #08105f;
  border: 2px solid #08105f;
}

.variant-new:hover {
  background: #f4f5ff;
  color: #0f1faf;
  border: 2px solid #0f1faf;
}

.variant-near {
  background: #fff2d8;
  color: #cd8900;
  border: 2px solid #cd8900;
}

.variant-near:hover {
  background: #fff9ed;
  color: #ce8d0c;
  border: 2px solid #ce8d0c;
}
</style>
