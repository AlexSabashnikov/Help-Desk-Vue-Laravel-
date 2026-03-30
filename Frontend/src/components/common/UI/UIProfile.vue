<!-- src/components/common/UI/UIProfile.vue -->
<template>
  <div
    class="user-profile"
    role="button"
    tabindex="0"
    @click="handleClick"
    @keydown.enter.prevent="handleClick"
    :title="userNameDisplay"
  >
    <div class="profile-info">
      <div class="user-details">
        <div class="user-name">{{ userNameDisplay }}</div>
        <div class="user-role">{{ getRoleLabel(userRoleStr) }}</div>
      </div>
      <div class="avatar" :style="avatarGradient" aria-hidden="true">
        {{ userInitials }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { getUserRole, getRoleLabel } from '@/utils/auth.utils'

// Emit для открытия модалки (MainLayout слушает)
const emit = defineEmits(['openProfile'])

const authStore = useAuthStore()

// Надёжный геттер user: сначала из store, затем fallback на localStorage (если нужно)
const userData = computed(() => {
  return authStore.user || (() => {
    try {
      const raw = localStorage.getItem('user')
      if (!raw) return null
      const parsed = JSON.parse(raw)
      // Поддержка двух форматов: { user: {...}, token: '...' } или сам user object
      if (parsed && typeof parsed === 'object') {
        if (parsed.user) return parsed.user
        if (parsed.id || parsed.email || parsed.login) return parsed
      }
      return null
    } catch {
      return null
    }
  })()
})

// Формирование отображаемого имени
const userNameDisplay = computed(() => {
  const u = userData.value
  if (!u) return 'Пользователь'
  const last = u.lastName || u.last_name || ''
  const first = u.firstName || u.first_name || u.first || ''
  // Если три есть — возвращаем "Фамилия И."
  if (last && first) {
    let initialFirst = (first || '').trim()[0] || ''
    return `${last} ${initialFirst}.`
  }
  // если нет фамилии/имени — попробуем более общие поля
  return u.name || u.login || u.email || 'Пользователь'
})

// Нормализация роли для отображения
const userRoleStr =  getUserRole()

// Формирование инициалов (max 2 буквы)
// Пример: "Иванов С." -> "ИС", "Пользователь" -> "П"
const userInitials = computed(() => {
  const name = userNameDisplay.value || ''
  const parts = name.split(' ').filter(Boolean)
  if (parts.length === 0) return ''
  if (parts.length === 1) return (parts[0][0] || '').toUpperCase()
  return ((parts[0][0] || '') + (parts[1][0] || '')).toUpperCase().slice(0, 2)
})

// Клик — эмитим событие наверх (layout откроет модалку)
function handleClick() {
  emit('openProfile')
}

// Функция для генерации числа на основе строки (хэш)
const hashString = (str) => {
  if (!str) return 0
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

// Функция для генерации цвета на основе данных пользователя
const generateColorFromUser = (seed, offset = 0) => {
  if (!seed) {
    // Если нет данных, возвращаем цвета по умолчанию
    const defaultColors = [
      { h: 210, s: 80, l: 50 }, // Синий
      { h: 120, s: 80, l: 45 }  // Зеленый
    ]
    return `hsl(${defaultColors[offset].h}, ${defaultColors[offset].s}%, ${defaultColors[offset].l}%)`
  }
  
  // Используем хэш для генерации оттенка
  const hash = hashString(seed)
  
  // Генерируем два разных оттенка на основе одного seed
  // Первый цвет: от 0 до 360
  const hue1 = hash % 360
  
  // Второй цвет: сдвигаем на 30-60 градусов для гармоничного сочетания
  const hue2 = (hue1 + 230 + (hash % 30)) % 360
  
  // Насыщенность: от 60% до 90%
  const saturation = 80 + (hash % 30)
  
  // Светлота: от 40% до 60% для насыщенных цветов
  const lightness1 = 40 + (hash % 20)
  const lightness2 = 40 + ((hash >> 8) % 20)
  
  if (offset === 0) {
    return `hsl(${hue1}, ${saturation}%, ${lightness1}%)`
  } else {
    return `hsl(${hue2}, ${saturation}%, ${lightness2}%)`
  }
}

// Генерация seed для цветов на основе данных пользователя
const colorSeed = computed(() => {
  const u = userData.value
  if (!u) return null
  
  // Собираем уникальные данные пользователя для генерации цвета
  const seedData = [
    u.id,
    u.firstName || u.first_name,
    u.lastName || u.last_name,
    u.middleName || u.middle_name
  ].filter(Boolean).join('_')
  
  return seedData || null
})

// Градиент для аватара
const avatarGradient = computed(() => {
  const seed = colorSeed.value
  const color1 = generateColorFromUser(seed, 0)
  const color2 = generateColorFromUser(seed, 1)
  
  return {
    background: `linear-gradient(135deg, ${color1}, ${color2})`
  }
})

</script>

<style scoped>
.user-profile {
  cursor: pointer;
  outline: none;
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px 4px 12px;
  border-radius: 10px;
  transition: background-color 0.2s ease;
  background-color: #031432;;
}

.profile-info:hover {
  background-color: #299f1990;
}

.user-details {
  text-align: right;
}

.user-name {
  font-weight: 500;
  font-size: 14px;
  color: #ffffff;
  line-height: 1.2;
  white-space: nowrap;
  max-width: 170px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 12px;
  color: #bec9d7;
  line-height: 1.2;
  text-align: right;
}

.avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 400;
  color: rgb(255, 255, 255);
  font-size: 14px;
  flex-shrink: 0;
  text-transform: uppercase;
}
</style>
