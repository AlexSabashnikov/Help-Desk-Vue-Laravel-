<template>
  <div class="offices-block">
    <UIIcons ref="uiIcons" />
    <DeleteNotification ref="deleteOfficeModal" />
    <DeleteNotification ref="deleteContactModal" />
    <div class="block-header">
      <div class="block-header-left">
        <span class="block-label">Офисы / Подразделения</span>
        <span class="count-offices" v-if="objectsLocal && objectsLocal.length > 0">
          Всего офисов: {{ objectsLocal.length }}
        </span>
      </div>
    </div>

    <div class="offices-table">
      <!-- Заголовок таблицы -->
      <div class="offices-row header-row">
        <div class="col number-col">№</div>
        <div class="col address-col">Адрес</div>
        <div class="col actions-col" v-if="mode === 'edit'"></div>
      </div>

      <!-- Строки с офисами -->
      <div
        v-for="(office, idx) in objectsLocal"
        :key="office.id ?? idx"
        class="offices-row data-row"
        @click.stop="toggleOfficeExpand(office)"
      >
      <!-- Номер офиса (кликабельный для открытия контактов) -->
      <div class="col number-col">
        <span class="expand-icon">
          <Icon 
              :icon="uiIcons?.icons.arrowDown"
              :class="{ rotated: isOfficeExpanded(office.id) }"
              class="arrow-icon-small"
              width="22"
              height="22"
            /></span>
        {{ idx + 1 + '.' }}
      </div>

    <!-- Адрес -->
    <div class="col address-col">
      <template v-if="mode === 'edit' && editingOfficeId === office.id">
        <UIInput
          :modelValue="office.address"
          @update:modelValue="v => updateField(idx, 'address', v)"
          @blur="saveOfficeEdit"
          @click.stop 
          :showHeader="false"
          placeholder="Адрес офиса"
          ref="officeInputRef"
          customClass="compact-input"
        />
      </template>
      <template v-else>
        {{ office.address || 'Адрес не указан' }}
      </template>
    </div>

        

        <!-- Действия (только в режиме редактирования) -->
        <div class="col actions-col" v-if="mode === 'edit'" @click.stop> <!-- Добавлено @click.stop -->
          <button 
            class="action-btn edit-btn" 
            @click.stop="startEditOffice(office, idx)" 
            title="Редактировать адрес"
          >
            <Icon :icon="uiIcons?.icons.edit" width="20" height="20" />
          </button>
          <button 
            class="action-btn delete-btn" 
            @click.stop="removeOffice(office)"
            title="Удалить офис"
          >
            <Icon :icon="uiIcons?.icons.delete" width="20" height="20" />
          </button>
        </div>

        <!-- Гармошка с контактами -->
        <div v-if="isOfficeExpanded(office.id)" class="office-contacts-expanded" @click.stop>
          <div class="block-header">
            <div>
              <span class="contacts-title">Контакты офиса</span>
              <span class="count-offices">
                Всего контактов: {{ office.contacts?.length || 0 }}
              </span>
            </div>
          </div>

          <!-- Таблица контактов -->
          <div class="contacts-table">
            <div class="contacts-row header-row">
              <div class="contact-col name-col">Пользователь</div>
              <div class="contact-col phone-col">Телефон</div>
              <div class="contact-col email-col">Email</div>
              <div class="contact-col actions-col" v-if="mode === 'edit'"></div>
            </div>

            <div
              v-for="(contact, contactIdx) in office.contacts"
              :key="contact.id ?? contactIdx"
              class="contacts-row data-row"
            >
              <!-- ФИО -->
              <div class="contact-col name-col">
                <template v-if="mode === 'edit' && editingContact?.index === contactIdx && editingContact?.officeId === office.id">
                  <UIInput
                    :modelValue="contact.full_name"
                    @update:modelValue="v => updateContact(office, contactIdx, 'full_name', v)"
                    :showHeader="false"
                    placeholder="ФИО"
                    customClass="compact-input"
                  />
                </template>
                <template v-else>
                  {{ contact.full_name || '—' }}
                </template>
              </div>

              <!-- Телефон -->
              <div class="contact-col phone-col">
                <template v-if="mode === 'edit' && editingContact?.index === contactIdx && editingContact?.officeId === office.id">
                  <UIInput
                    :modelValue="contact.phone"
                    @update:modelValue="v => updateContact(office, contactIdx, 'phone', v)"
                    :showHeader="false"
                    placeholder="Телефон"
                    customClass="compact-input"
                  />
                </template>
                <template v-else>
                  {{ contact.phone || '—' }}
                </template>
              </div>

              <!-- Email -->
              <div class="contact-col email-col">
                <template v-if="mode === 'edit' && editingContact?.index === contactIdx && editingContact?.officeId === office.id">
                  <UIInput
                    :modelValue="contact.email"
                    @update:modelValue="v => updateContact(office, contactIdx, 'email', v)"
                    :showHeader="false"
                    placeholder="Email"
                    customClass="compact-input"
                  />
                </template>
                <template v-else>
                  {{ contact.email || '—' }}
                </template>
              </div>

              <!-- Действия с контактом -->
              <div class="contact-col actions-col" v-if="mode === 'edit'">
                <button 
                  class="action-btn delete-btn"
                  @click.stop="removeContact(office, contactIdx)"
                  title="Удалить"
                >
                  <Icon :icon="uiIcons?.icons.delete" width="20" height="20" />
                </button>
              </div>
            </div>

            <!-- Пустое состояние для контактов -->
            <div v-if="!office.contacts?.length" class="contacts-empty">
              Нет контактов
            </div>

            <!-- Дополнительная строка для добавления контакта (только в режиме edit) -->
            <div v-if="mode === 'edit'" class="contacts-row add-row" @click.stop="addContact(office)">
              <div class="contact-col add-contact-col">
                <span class="add-link">+ Добавить контакт</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Дополнительная строка для добавления офиса (только в режиме edit) -->
      <div v-if="mode === 'edit'" class="offices-row add-row" @click="onAddOffice">
        <div class="col add-office-col">
          <span class="add-link">+ Добавить офис</span>
        </div>
      </div>

      <!-- Пустое состояние таблицы офисов -->
      <div v-if="(!objectsLocal || objectsLocal.length === 0) && mode !== 'edit'" class="empty-state">
        Офисы не найдены
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import UIInput from '@/components/common/UI/UIInput.vue'
import { Icon } from '@iconify/vue'
import UIIcons from '@/components/common/UI/UIIcons.vue'
import DeleteNotification from '@/components/notifications/DeleteNotification.vue'

const uiIcons = ref()

const deleteOfficeModal = ref()
const deleteContactModal = ref()

const props = defineProps({
  objects: { type: Array, default: () => [] },
  mode: { type: String, default: 'view' } // 'view' | 'edit'
})

const emit = defineEmits(['update:objects', 'editOffice', 'removeOffice', 'addOffice', 'setMain'])

const objectsLocal = ref([])
const expandedOffices = ref(new Set())
const editingOfficeId = ref(null)
const editingContact = ref(null)
const officeInputRef = ref(null)

watch(() => props.objects, (v) => {
  objectsLocal.value = Array.isArray(v) ? JSON.parse(JSON.stringify(v)) : []
}, { immediate: true })

// Функции для работы с офисами
const commitUpdate = () => {
  emit('update:objects', JSON.parse(JSON.stringify(objectsLocal.value)))
}

// Проверка, открыт ли офис
const isOfficeExpanded = (officeId) => {
  return expandedOffices.value.has(officeId)
}

// Переключение состояния офиса
const toggleOfficeExpand = (office) => {
  if (editingOfficeId.value === office.id) return // Не закрываем при редактировании
  
  const newSet = new Set(expandedOffices.value)
  if (newSet.has(office.id)) {
    newSet.delete(office.id)
  } else {
    newSet.add(office.id)
  }
  expandedOffices.value = newSet
}

const onAddOffice = () => {
  // Находим максимальный существующий ID для временных ID
  const maxId = objectsLocal.value.reduce((max, office) => {
    const id = typeof office.id === 'number' ? Math.abs(office.id) : 0
    return Math.max(max, id)
  }, 0)
  
  const newOffice = { 
    id: -(maxId + 1), // Более предсказуемые временные ID
    name: '', 
    address: '', 
    is_main: false, 
    contacts: [] 
  }
  
  // Добавляем в конец массива
  objectsLocal.value = [...objectsLocal.value, newOffice]
  commitUpdate()
  
  // Автоматически открываем новый офис
  const newSet = new Set(expandedOffices.value)
  newSet.add(newOffice.id)
  expandedOffices.value = newSet
}

// Начало редактирования офиса
const startEditOffice = (office) => {
  if (editingOfficeId.value === office.id) {
    editingOfficeId.value = null
  } else {
    // Иначе включаем режим редактирования для выбранного офиса
    editingOfficeId.value = office.id
  }
}

// Обновление поля
const updateField = (index, field, value) => {
  if (!objectsLocal.value[index]) return
  objectsLocal.value[index][field] = value
}

// Сохранение редактирования офиса
const saveOfficeEdit = () => {
  commitUpdate()
  editingOfficeId.value = null
}

const removeOffice = async (office) => {
  let confirmed
  if(office.address){
    confirmed = await deleteOfficeModal.value.open({
      title: 'Удаление офиса',
      mainMessage: 'Вы действительно хотите удалить офис по адресу:',
      secondaryMessage: office.address + " и все его контакты?" || ''
    })
  }
  else{
    confirmed = await deleteOfficeModal.value.open({
      title: 'Удаление офиса',
      mainMessage: 'Вы действительно хотите удалить офис и все его контакты?',
      secondaryMessage: ''
    })
  }
  if (confirmed) {
    objectsLocal.value = objectsLocal.value.filter(o => o.id !== office.id)
    commitUpdate()
    // Удаляем офис из открытых
    const newSet = new Set(expandedOffices.value)
    newSet.delete(office.id)
    expandedOffices.value = newSet
  }
}

// Функции для работы с контактами
const addContact = (office) => {
  const newContact = { 
    id: Date.now() * -1, 
    full_name: '', 
    phone: '', 
    email: '', 
    is_main: false 
  }
  
  const officeIndex = objectsLocal.value.findIndex(o => o.id === office.id)
  console.log(officeIndex)
  if (officeIndex !== -1) {
    if (!objectsLocal.value[officeIndex].contacts) {
      objectsLocal.value[officeIndex].contacts = []
    }
    objectsLocal.value[officeIndex].contacts.push(newContact)
    commitUpdate()
    
    // Автоматически начинаем редактирование нового контакта
    startEditContact(objectsLocal.value[officeIndex], objectsLocal.value[officeIndex].contacts.length - 1)
  }
}

const startEditContact = (office, contactIndex) => {
  editingContact.value = {
    officeId: office.id,
    index: contactIndex
  }
}

const updateContact = (office, contactIndex, field, value) => {
  const officeIndex = objectsLocal.value.findIndex(o => o.id === office.id)
  if (officeIndex !== -1 && objectsLocal.value[officeIndex].contacts?.[contactIndex]) {
    objectsLocal.value[officeIndex].contacts[contactIndex][field] = value
  }
}

const removeContact = async (office, contactIdx) => {
  const contact = office.contacts[contactIdx]
  let confirmed
  if(contact.full_name){
    confirmed = await deleteContactModal.value.open({
      title: 'Удаление контакта',
      mainMessage: 'Вы действительно хотите удалить контакт',
      secondaryMessage: contact.full_name + "?"
    })
  }
  else{
    confirmed = await deleteContactModal.value.open({
      title: 'Удаление контакта',
      mainMessage: 'Вы действительно хотите удалить контакт?',
      secondaryMessage: ''
    })
  }
  if (confirmed) {
    const officeIndex = objectsLocal.value.findIndex(o => o.id === office.id)
    if (officeIndex !== -1 && objectsLocal.value[officeIndex].contacts) {
      objectsLocal.value[officeIndex].contacts.splice(contactIdx, 1)
      commitUpdate()
      if (editingContact.value?.officeId === office.id && editingContact.value?.index === contactIdx) {
        editingContact.value = null
      }
    }
  }
}
</script>

<style scoped>
.offices-block {
  margin-top: 0px;
}

.block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.block-label {
  font-weight: 600;
  color: #374151;
  font-size: 13px;
}

.count-offices {
  font-weight: 600;
  color: #5a616d;
  font-size: 12px;
  margin-left: 10px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

/* Table container */
.offices-table {
  border: 1px solid #9ea5bd;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  max-height: 490px;
  overflow-y: auto;
  scrollbar-width: none;
  scrollbar-color: rgb(143, 143, 143) rgba(0, 0, 0, 0);
}

/* Row grid for offices */
.offices-row {
  display: grid;
  grid-template-columns: 2fr 25fr 3fr;
  gap: 8px;
  padding: 2px 10px;
  align-items: center;
  min-height: 36px; /* Унифицированная высота */
  box-sizing: border-box;
  position: relative;
}

.header-row {
  background: #2877de;
  font-weight: 500;
  color: #ffffff;
  position: relative;
  top: 0;
  z-index: 2;
  min-height: 36px;
  height: 36px;
}

.arrow-icon-small {
  color: #2877de;
  flex-shrink: 0;
  display: inline-block;
  align-items: center;
  transition: transform 0.2s ease;
}

.arrow-icon-small.rotated {
  transform: rotate(180deg);
}

.data-row {
  background-color: #ffffff;
  cursor: pointer;
  transition: background-color 0.2s;
  border-top: 1px solid #9ea5bd;
  min-height: 36px;
}

.data-row:hover {
  background: #ecf1ff;
}

.col {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  line-height: 32px; /* Унифицированный line-height */
  height: 32px;
  display: flex;
  align-items: center;
}

.compact-input :deep(.ui-input) {
  min-height: 22px !important;
  height: 28px !important;
  padding-top: 0px !important;
  padding-bottom: 0px !important;
  font-size: 14px !important;
}

.number-col {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
  height: 32px;
}

.expand-icon {
  font-size: 12px;
  color: #6b7280;
  align-items: center;
  justify-content: center;
  display: flex;
}

/* Contacts expanded section */
.office-contacts-expanded {
  grid-column: 1 / -1;
  margin: 4px 0;
}

.contacts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  height: 28px;
}

.contacts-title {
  font-weight: 600;
  font-size: 13px;
  color: #1f2937;
}

/* Contacts table */
.contacts-table {
  border: 1px solid #9ea5bd;
  border-radius: 6px;
  max-height: 200px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgb(143, 143, 143) rgba(0, 0, 0, 0);
}

.contacts-row {
  display: grid;
  grid-template-columns: 7fr 4fr 4fr 1fr;
  gap: 8px;
  padding: 2px 8px;
  align-items: center;
  min-height: 34px; /* Унифицированная высота */
  height: 34px;
  border-top: 1px solid #9ea5bd;
}

.contacts-row:first-child {
  border-top: none;
}

.contacts-row.header-row {
  background: #1548af;
  font-weight: 500;
  font-size: 14px;
  color: white;
  min-height: 34px;
  height: 34px;
  padding: 0 8px;
}

.contacts-row.data-row {
  background-color: #ffffff;
  min-height: 34px;
  height: 34px;
}

.contact-col {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 30px;
  height: 30px;
  display: flex;
  align-items: center;
}

/* Action buttons */
.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.action-btn .iconify {
  width: 18px;
  height: 18px;
}

.edit-btn:hover {
  color: #3b82f6;
}

.delete-btn:hover {
  color: #ef4444;
}

.save-btn:hover {
  color: #10b981;
}

.actions-col {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  align-items: center;
  height: 32px;
}

.empty-state {
  padding: 18px;
  text-align: center;
  color: #6b7280;
  font-style: italic;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #1774ee;
  font-size: 14px;
  height: 32px;
}

.stat-item .iconify {
  color: #178aee;
  width: 18px;
  height: 18px;
}

/* Строка добавления - унифицированный стиль для обеих кнопок */
.add-row {
  cursor: pointer;
  transition: background-color 0.2s;
  border-top: 1px solid #9ea5bd;
  justify-content: center;
  text-align: center;
  color: #3b82f6;
  font-weight: 500;
  min-height: 34px;
  height: 34px;
  display: flex; /* Добавлено для центрирования */
  align-items: center;
  justify-content: center;
  width: 100%; /* На всю ширину */
}

.add-row .col {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 30px;
  width: 100%; /* На всю ширину */
}

.add-link {
  border: 1px dashed #3b82f6;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  padding: 2px 16px; /* Увеличил горизонтальные отступы */
  font-size: 13px;
  height: 26px;
  line-height: 1;
  margin: 0 auto; /* Центрирование */
}

.add-link:hover{
  background-color: #c1dcff;
}

.add-office-col,
.add-contact-col {
  grid-column: 1 / -1;
  text-align: center;
  width: 100%;
  display: flex;
  justify-content: center;
}

/* Contacts empty state */
.contacts-empty {
  padding: 10px;
  text-align: center;
  color: #6b7280;
  font-style: italic;
  min-height: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Responsive */
@media (max-width: 900px) {
  .offices-row {
    grid-template-columns: 40px 1fr 60px 60px;
    gap: 4px;
    padding: 8px 6px;
  }
  
  .contacts-row {
    grid-template-columns: 1fr;
    gap: 4px;
  }
  
  .contacts-row.header-row {
    display: none;
  }
}
</style>