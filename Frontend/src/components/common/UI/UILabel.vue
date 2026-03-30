<template>
  <div class="ui-label-wrapper" :class="customClass">
    <div v-if="showHeader" class="ui-label-header">
      <span class="ui-label-label">{{ label }}</span>
    </div>
    <div       
      v-if="label==='Статус'"
      class="ui-label-content"
      :class="{ 'empty-value': !modelValue && showEmptyIndicator }"
      :style="contentStyles"
      style="max-width: 170px;"
      @click="handleClick"
    >
      <span class="ui-label-value" :style="textStyles">
        {{ displayValue }}
      </span>
      <slot name="append"></slot>
    </div>
    <div 
      v-else
      class="ui-label-content"
      :class="{ 'empty-value': !modelValue && showEmptyIndicator }"
      :style="contentStyles"
      @click="handleClick"
    >
      <span class="ui-label-value" :style="textStyles">
        {{ displayValue }}
      </span>
      <slot name="append"></slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number, Object],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  emptyText: {
    type: String,
    default: 'Не указано'
  },
  showEmptyIndicator: {
    type: Boolean,
    default: true
  },
  showHeader: {
    type: Boolean,
    default: true
  },
  isLink: {
    type: Boolean,
    default: false
  },
  customClass: String,
  backgroundColor: {
    type: String,
    default: null
  },
  textColor: {
    type: String,
    default: null
  },
})

const emit = defineEmits(['click'])

const displayValue = computed(() => {
  if (!props.modelValue && props.showEmptyIndicator) {
    return props.emptyText
  }
  return props.modelValue || ''
})

const contentStyles = computed(() => {
  const styles = {}
  if (props.backgroundColor) {
    styles.backgroundColor = props.backgroundColor
  }
  if (props.textColor) {
    styles.borderColor = props.textColor
  }
  return styles
})

const textStyles = computed(() => {
  const styles = {}
  if (props.textColor) {
    styles.color = props.textColor
  }
  return styles
})

const handleClick = () => {
  if (props.isLink) {
    emit('click', props.modelValue)
  }
}
</script>

<style scoped>
.ui-label-wrapper {
  position: relative;
  width: 100%;
  margin-top: 2px;
}

.ui-label-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ui-label-label {
  font-size: 12px;
  color: #8c8c8c;
  font-weight: 400;
}

.ui-label-content {
  width: 100%;
  padding: 2px 6px;
  border: 1px solid #c5c5c5;
  border-radius: 6px;
  font-size: 14px;
  color: #141414;
  background-color: white;
  box-sizing: border-box;
  max-height: 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: border-color 0.2s ease;
}

.ui-label-content.empty-value {
  color: #9a9a9a;
  font-style: italic;
}

.ui-label-content:hover {
  border-color: #9ca3af;
}

.ui-label-value {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

/* Стили для ссылок */
.ui-label-content.is-link {
  color: #007bff;
  cursor: pointer;
  text-decoration: none;
}

.ui-label-content.is-link:hover {
  text-decoration: underline;
  border-color: #007bff;
}
</style>