<!-- 
    Карточка заявки (администратор)
    Полный доступ ко всем блокам заявки
    История изменений, комментарии, прикреплённые файлы
-->

<template>
  <UIIcons ref="uiIcons" />
  <!-- Модальное окно профиля пользователя -->
  <UserProfileModal
    v-model="showUserProfile"
    :mode="profileMode"
    :user="selectedUser"
  />
  <div v-if="visible" class="modal-overlay" @click.self="closeModal">
    <div class="modal-container">
      <!-- Шапка модального окна -->
      <div class="modal-header">
        <div class="header-left">
          <h2 class="modal-title">{{ mode === 'view' ? 'Режим просмотра' : 'Режим редактирования' }}</h2>
        </div>
        <div class="header-right">
          <button class="history-btn" @click="showHistory" title="История изменений">
            <Icon :icon="uiIcons?.icons.changeHistory" width="24" height="24" /> История изменений
          </button>
          <template v-if="mode==='edit'">
            <button class="save-btn" @click="saveChanges" title="Сохранить изменения">
              <Icon :icon="uiIcons?.icons.save" width="24" height="24" /> Сохранить изменения
            </button>
          </template>
          <button class="close-btn" @click="closeModal" title="Закрыть">
            <Icon :icon="uiIcons?.icons.close" class="close-btn-icon" width="36" height="36" />
          </button>
        </div>
      </div>

      <!-- Тело модального окна -->
      <div class="modal-body">
        <!-- Основная информация о заявке -->
        <div class="ticket-sections-one">
          <!-- Блок основной информации -->
          <MainInfo 
            :ticket="localTicket" 
            :mode="mode"
            :user-role="userRole"
            @fieldChange="handleFieldChange" 
            />

          <!-- Блок исполнения -->
          <ExecutionBlock 
            :ticket="localTicket"
            :mode="mode"
            :user-role="userRole"
            @fieldChange="handleFieldChange"
            @materialChange="handleMaterialChange"
            @openProfile="openUserProfile"
            />
        </div>
        <div class="ticket-sections-two">
          <!-- Блок местоположения -->
          <LocationBlock 
            :ticket="localTicket"
            :mode="mode"
            :user-role="userRole"
            @fieldChange="handleFieldChange"
            />
          <!-- Блок информации о клиенте -->
          <ClientInfo 
            :ticket="localTicket" 
            :mode="mode"
            :user-role="userRole"
            @fieldChange="handleFieldChange" 
            />
        </div>

        <!-- Комментарии (статичный блок) -->
        <div class="comments-section">
          <h3>Комментарии</h3>
          <div class="comment">
            <div class="comment-header">
              <span class="comment-author">Иванов И.И.</span>
              <span class="comment-role">Исполнитель</span>
            </div>
            <div class="comment-text">Начал работу по замене сетевого оборудования</div>
          </div>
          <div class="comment-input-container">
            <textarea
              class="comment-input"
              placeholder="Напишите комментарий..."
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, watch } from 'vue'
import { getUserRole } from '@/utils/auth.utils'
import MainInfo from '@/components/tickets/TicketCard/MainInfo.vue'
import ExecutionBlock from '@/components/tickets/TicketCard/ExecutionBlock.vue'
import ClientInfo from '@/components/tickets/TicketCard/ClientInfo.vue'
import LocationBlock from '@/components/tickets/TicketCard/LocationBlock.vue'
import UserProfileModal from '@/components/modal/UserProfileModal.vue'
import { Icon } from '@iconify/vue'
import UIIcons from '@/components/common/UI/UIIcons.vue'


const uiIcons = ref()

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  ticket: {
    type: Object,
    default: () => ({
      id: null,
      number: '',
      subject: '',
      description: '',
      priority: '',
      status: '',
      type: '',
      client: {},
      executor: {},
      contactPerson: '',
      phone: '',
      email: '',
      createdAt: '',
      deadline: '',
      workStart: '',
      workEnd: '',
      workCost: null,
      materials: [],
      requestMethod: '',
      adress: '',
      estimatedTravelTime: '',
      distance: '',
    }),
  },
  mode: {
    type: String,
    default: 'view', // 'view' или 'edit'
    validator: (value) => ['view', 'edit'].includes(value),
  },
})

const emit = defineEmits(['close', 'edit', 'save', 'delete'])

const showUserProfile = ref(false)
const profileMode = ref('user')
const selectedUser = ref(null)

// Локальная копия заявки для редактирования
const localTicket = ref({ ...props.ticket })

// Следим за изменениями пропса ticket
watch(() => props.ticket, (newTicket) => {
  localTicket.value = { ...newTicket }
  // Убедимся, что materials всегда массив
  if (!localTicket.value.materials) {
    localTicket.value.materials = []
  }
}, { immediate: true })

// Роль пользователя
const userRole = ref('guest')

userRole.value = getUserRole()

const closeModal = () => {
  emit('close')
}

const saveChanges = () => {
  // Сохраняем изменения
  emit('save', localTicket.value)
}

const showHistory = () => {
  // Пока что просто заглушка
  console.log('Показать историю изменений для заявки:', props.ticket.id)
  alert('Функция "История изменений" в разработке')
}

const openUserProfile = (user) => {
  console.log('Opening profile for user:', user)
  if (user && user.id) {
    selectedUser.value = user
    profileMode.value = 'view'
    showUserProfile.value = true
  }
}

// Обработчик изменения материалов
const handleMaterialChange = (materials) => {
  localTicket.value = {
    ...localTicket.value,
    materials: materials
  }
}

// Обработчик изменений полей
const handleFieldChange = (field, value) => {
  console.log(`Field ${field} changed to:`, value)
  localTicket.value = {
    ...localTicket.value,
    [field]: value
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1201;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-container {
  background: #e7e7e7;
  border-radius: 12px;
  width: 90%;
  max-width: 1200px;
  max-height: 90vh;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgb(72, 72, 72) transparent;
  border: 2px solid #757575;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.save-btn {
  background: #3cc93a;
  color: white;
  border: none;
  padding: 4px 12px;
  border-radius: 16px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.save-btn:hover {
  background: #34bb32;
  transform: scale(1.03);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Обновляем стили для header-right чтобы вместить больше кнопок */
.modal-header .header-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}


.history-btn {
  background: #d8d8d8;
  color: rgb(17, 17, 17);
  border: none;
  padding: 4px 12px;
  border-radius: 16px;
  border: 2px solid rgb(187, 187, 187);
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.history-btn:hover {
  background: #f1f1f1;
  transform: scale(1.03);
}

/* Сделаем шапку фиксированной при прокрутке */
.modal-header {
  position: sticky;
  top: 0;
  z-index: 15;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 15px;
  background: #e7e7e7;
  border-bottom: 3px solid rgb(72, 72, 72);
  color: white;
  border-radius: 12px 12px 0 0;
}

.header-left {
  flex: 1;
}

.modal-title {
  margin-top: 10px;
  font-size: 18px;
  font-weight: 600;
  color: black;
}

.ticket-status-indicators {
  display: flex;
  gap: 10px;
}

.close-btn {
  background: rgba(255, 255, 255, 0.1);
  color: rgb(46, 46, 46);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border:none;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  margin-left: 6px;
}

.close-btn:hover {
  transform: scale(1.1);
}

.close-btn-icon:hover {
  color: rgb(255, 19, 19);
}

.modal-body {
  padding: 20px 15px 15px 15px;
}

.filters-section {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  color: #495057;
}

.filter-count {
  background: #4dabf7;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.divider {
  height: 1px;
  background: #e0e0e0;
  margin: 20px 0;
}

.ticket-sections-one {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.ticket-sections-two {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.comments-section {
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.comments-section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #343a40;
  font-size: 16px;
  padding-bottom: 8px;
}

.comment {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.comment-author {
  font-weight: 600;
  color: #212529;
}

.comment-role {
  font-size: 12px;
  color: #6c757d;
  background: #e9ecef;
  padding: 2px 8px;
  border-radius: 4px;
}

.comment-text {
  color: #495057;
  line-height: 1.5;
}

.comment-input-container {
  margin-top: 10px;
}

.comment-input {
  width: 100%;
  padding: 6px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  min-height: 35px;
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
}

.comment-input:focus {
  outline: none;
  border-color: #4dabf7;
  box-shadow: 0 0 0 3px rgba(77, 171, 247, 0.1);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.btn {
  padding: 10px 24px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-edit {
  background: #4dabf7;
  color: white;
}

.btn-edit:hover {
  background: #339af0;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(77, 171, 247, 0.3);
}

.btn-delete {
  background: #fa5252;
  color: white;
}

.btn-delete:hover {
  background: #e03131;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(250, 82, 82, 0.3);
}

@media (max-width: 992px) {
  .ticket-sections {
    grid-template-columns: 1fr;
  }

  .modal-container {
    width: 95%;
    max-height: 95vh;
  }
}

@media (max-width: 768px) {
  .modal-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .close-btn {
    align-self: flex-end;
  }

  .filters-section {
    flex-direction: column;
    gap: 10px;
  }

  .modal-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
